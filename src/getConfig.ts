interface Config {
  PORT: number;
  PRESENCE_API_URL: string;
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
}

export const getConfig = (): Config => ({
  PORT: (process.env.PORT && parseInt(process.env.PORT)) || 4000,
  PRESENCE_API_URL: process.env.PRESENCE_API_URL || '',
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || ''
});
