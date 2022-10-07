import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  NonThreadGuildBasedChannel,
  SelectMenuBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { getConfig } from '../../getConfig';
import { httpRequest } from '../../httpService/http';
import { MonitoringResponse } from '../../httpService/responseTypes';

export const SELECT_BOT_CUSTOM_ID = 'selectbot';
export const SELECT_CHANNEL_CUSTOM_ID = 'selectchannel';

export const data = new SlashCommandBuilder()
  .setName('monitorbots')
  .setDescription('Will allow users to set the bots to monitor');

export const execute = async (
  interaction: ChatInputCommandInteraction,
  client: Client
) => {
  const { PRESENCE_API_URL } = getConfig();
  //Get all bots from server
  const members = await interaction.guild?.members.fetch();
  const bots = members?.filter((member) => member.user.bot);

  //Get all bots that is being monitored right now
  const monitoredInfo: MonitoringResponse = await httpRequest(
    'get',
    `${PRESENCE_API_URL}/monitoring/${interaction.guildId}`
  );

  if (!bots) {
    interaction.reply(
      'Something went wrong... Could not find bots using Discord API'
    );
    return;
  }

  const botOptions = bots.map((bot) => {
    return {
      label: bot.displayName,
      value: bot.id,
      default: monitoredInfo.bots.includes(bot.user.id)
    };
  });

  const embed = new EmbedBuilder().setTitle('Select bots to monitor');

  const selectBotsRow = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId(SELECT_BOT_CUSTOM_ID)
      .setMinValues(0)
      .setMaxValues(botOptions.length)
      .setPlaceholder('Nothing selected')
      .addOptions(botOptions)
  );

  //Get all channels
  const channels = await interaction.guild?.channels.fetch();

  if (!channels) {
    interaction.reply(
      'Something went wrong... Could not find channels using Discord API'
    );
    return;
  }

  const channelOptions = channels
    .filter(
      (channel): channel is NonThreadGuildBasedChannel =>
        channel !== null && channel.isTextBased()
    )
    .map((channel) => {
      return {
        label: channel.name,
        value: channel.id,
        default: channel.id === monitoredInfo.channelId
      };
    });

  const selectChannlRow = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId(SELECT_CHANNEL_CUSTOM_ID)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder('Nothing selected')
      .addOptions(channelOptions)
  );

  //have to use any here to avoid compilation error
  //this may be a bug in discordjs
  await interaction.reply({
    ephemeral: true,
    embeds: [embed],
    components: [selectBotsRow as any, selectChannlRow]
  });
};
