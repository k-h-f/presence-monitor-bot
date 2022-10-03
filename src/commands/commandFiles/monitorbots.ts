import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
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

  const botOptions = bots.map((bot) => {
    return {
      label: bot.displayName,
      value: bot.id,
      default: monitoredBots.bots.includes(parseInt(bot.id))
    };
  });

  const embed = new EmbedBuilder().setTitle('Select bots to monitor');

  const row = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId(SELECT_BOT_CUSTOM_ID)
      .setMinValues(0)
      .setMaxValues(botOptions.length)
      .setPlaceholder('Nothing selected')
      .addOptions(botOptions)
  );

  //have to use any here to avoid compilation error
  //this may be a bug in discordjs
  await interaction.reply({
    ephemeral: true,
    embeds: [embed],
    components: [row as any]
  });
};
