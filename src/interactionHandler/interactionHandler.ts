import { SelectMenuInteraction } from 'discord.js';
import { getConfig } from '../getConfig';
import { httpRequest } from '../httpService/http';

interface CustomId {
  SELECT_BOT: string;
  SELECT_CHANNEL: string;
}

class InteractionHandler {
  private customIds: CustomId;

  constructor() {
    this.customIds = {
      SELECT_BOT: 'selectBot',
      SELECT_CHANNEL: 'selectChannel'
    };
  }

  public async handleSelectMenuInteractionEvent(
    interaction: SelectMenuInteraction
  ) {
    const { PRESENCE_API_URL } = getConfig();

    let body = {};
    switch (interaction.customId) {
      case this.customIds.SELECT_BOT:
        body = { ...body, bots: interaction.values };
        break;
      case this.customIds.SELECT_CHANNEL:
        body = { ...body, channelId: interaction.values[0] };
        break;
    }

    await httpRequest(
      'post',
      `${PRESENCE_API_URL}/update/${interaction.guildId}`,
      {
        body
      }
    );
  }

  public getCustomIds() {
    return this.customIds;
  }
}

export default InteractionHandler;
