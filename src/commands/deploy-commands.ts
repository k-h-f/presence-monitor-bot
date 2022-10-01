import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { getConfig } from '../getConfig';
import * as commandModules from './commandFiles';

/**
 * Deploys the commands to the servers that the bot has joined
 * Takes all of the commands exported from index.ts in ./commandFiles and
 * makes REST calls using the Discord bot's Client ID and the Guild ID that
 * the bot has joined.
 */

const { DISCORD_TOKEN, CLIENT_ID } = getConfig();

const commands = Object.values(commandModules).map((module) => module.data);

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

rest
  .put(Routes.applicationCommands(CLIENT_ID), {
    body: commands
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
