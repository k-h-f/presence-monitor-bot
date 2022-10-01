import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import * as commandModules from '.';

export const data = new SlashCommandBuilder()
  .setName('commandslist')
  .setDescription('Sends a DM to the user who requested the commands list');

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const fields = Object.values(commandModules).map((module) => {
    return { name: `/${module.data.name}`, value: module.data.description };
  });

  const helpEmbed = new EmbedBuilder();
  helpEmbed
    .setTitle('Presence Monitor Bot')
    .addFields(fields)
    .setFooter({ text: 'This bot is still in early development' });

  interaction.reply({ embeds: [helpEmbed] });
};
