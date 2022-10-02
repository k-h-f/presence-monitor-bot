import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Client,
  SelectMenuBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { getConfig } from '../../getConfig';
import { httpRequest } from '../../httpService/http';
import { BotsResponse } from '../../httpService/responseTypes';

export const SELECT_BOT_CUSTOM_ID = 'selectbot';

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
  const monitoredBots: BotsResponse = await httpRequest(
    'get',
    `${PRESENCE_API_URL}/bots/${interaction.guildId}`
  );

  if (!bots) {
    interaction.reply('Something went wrong...');
    return;
  }

  const botOptions = bots
    ?.filter((bot) => !monitoredBots.bots.includes(parseInt(bot.id)))
    .map((bot) => {
      return {
        label: bot.displayName,
        value: bot.id
      };
    });

  const row = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId(SELECT_BOT_CUSTOM_ID)
      .setPlaceholder('Nothing selected')
      .addOptions(botOptions)
  );

  await interaction.reply({ components: [row] });
};
