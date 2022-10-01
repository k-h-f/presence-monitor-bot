import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('monitorbots')
  .setDescription('Will allow users to set the bots to monitor');

export const execute = async (interaction: ChatInputCommandInteraction) => {
  interaction.reply('');
};
