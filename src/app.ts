import dotenv from 'dotenv';
dotenv.config();

import './commands/deploy-commands';

// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from 'discord.js';
import { getConfig } from './getConfig';
import EventHandler from './eventHandler/eventHandler';

const DISCORD_TOKEN = getConfig().DISCORD_TOKEN;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages
  ]
});

const eventHandler = new EventHandler(client);
eventHandler.initEvents();

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);
