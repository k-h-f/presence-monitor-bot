import {
  Client,
  Interaction,
  Presence,
  PresenceUpdateStatus,
  TextChannel
} from 'discord.js';
import { getConfig } from '../getConfig';
import * as commandModules from '../commands/commandFiles';
import InteractionHandler from '../interactionHandler/interactionHandler';
import { httpRequest } from '../httpService/http';
import { MonitoringResponse } from '../httpService/responseTypes';

/**
 * EventHandler handles all Discord events in one place by taking a Discord client and attaches
 * listeners to specific events on the client. Each method is an particular event found from
 * this list: https://discord-ts.js.org/docs/general/events/
 * More information about events found here:
 * https://github.com/amishshah/discord.js-guide/blob/master/development/understanding-events.md
 */
class EventHandler {
  private client: Client<boolean>;
  private commands: any;

  /**
   * @param client Discord client instance
   */
  constructor(client: Client<boolean>) {
    this.client = client;
    this.commands = Object(commandModules);
  }

  /**
   * This method initialises all the listeners for the events that we're interested in
   * If you want to add a new event, make sure to invoke the method here
   * Otherwise, the event won't be listened to
   */
  initEvents() {
    this.client.on('ready', () => this.ready());
    this.client.on('presenceUpdate', (data) => this.presenceUpdate(data));
    this.client.on('interactionCreate', (data) => this.interactionCreate(data));
  }

  /**
   * When the client is ready, this event is triggered
   */
  ready() {
    console.log('READY');
  }

  async presenceUpdate(data: Presence | null) {
    if (!data || !data.member || !data.member.user.bot) {
      return;
    }

    const { PRESENCE_API_URL } = getConfig();
    const monitoredBots: MonitoringResponse = await httpRequest(
      'GET',
      `${PRESENCE_API_URL}/monitoring/${data.guild?.id}`
    );

    const { bots, channelId } = monitoredBots;

    const isMonitored = bots.includes(data.member.id);
    if (data.status === PresenceUpdateStatus.Offline && isMonitored) {
      const channel = this.client.channels.cache.get(channelId) as TextChannel;

      if (!channel) {
        //Send to default channel
        const defaultChannel = this.client.channels.cache
          .filter((channel) => channel.isTextBased())
          .at(0) as TextChannel;

        defaultChannel.send(`${data.member.displayName} is offline!`);
      } else {
        channel.send(`${data.member.displayName} is offline!`);
      }
    }
  }

  /**
   * When a message from a user that is a command
   */
  async interactionCreate(interaction: Interaction) {
    if (interaction.isSelectMenu()) {
      await interaction.deferReply();

      const interactionHandler = new InteractionHandler();

      interactionHandler.handleSelectMenuInteractionEvent(interaction);

      await interaction.deleteReply();
    }

    if (!interaction.isCommand()) {
      return;
    }

    const { commandName } = interaction;
    this.commands[commandName].execute(interaction, this.client);
  }
}

export default EventHandler;
