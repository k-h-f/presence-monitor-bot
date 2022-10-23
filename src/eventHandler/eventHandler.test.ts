import { Client, Guild, Presence } from 'discord.js';
import { getConfig } from '../getConfig';
import { httpRequest } from '../httpService/http';
import EventHandler from './eventHandler';

jest.mock('discord.js', () => ({
  PresenceUpdateStatus: { Online: 'online', Offline: 'offline' }
}));
jest.mock('../commands/commandFiles', () => ({
  randomCommand: {
    execute: () => {
      mockExecute();
    }
  }
}));
jest.mock('../interactionHandler/interactionHandler', () =>
  jest.fn().mockImplementation(() => ({
    handleSelectMenuInteractionEvent: mockHandleSelectMenuInteractionEvent
  }))
);
jest.mock('../httpService/http');
jest.mock('../getConfig');

const mockDiscordClientGet = jest.fn();
const mockExecute = jest.fn();
const mockDiscordClientFilter = jest.fn();
const mockDiscordClientSend = jest.fn();
const mockHttpRequest = httpRequest as jest.Mock<any>;
const mockConfig = getConfig as jest.Mock<any>;
const mockHandleSelectMenuInteractionEvent = jest.fn();
const mockDeferReply = jest.fn();
const mockDeleteReply = jest.fn();
const mockDiscordClient: Partial<Client> = {
  channels: {
    cache: {
      get: mockDiscordClientGet,
      filter: mockDiscordClientFilter.mockImplementation(() => ({
        at: () => ({
          send: mockDiscordClientSend
        })
      }))
    }
  } as any
};

mockDiscordClientGet.mockImplementation(() => ({
  send: mockDiscordClientSend
}));

describe('eventHandler', () => {
  beforeEach(() => {});

  describe('presenceUpdate', () => {
    beforeEach(() => {
      mockConfig.mockReturnValue({ PRESENCE_API_URL: 'presence-api.com' });
      mockHttpRequest.mockReturnValue({ bots: [] });
    });
    it('should not alert if data is null', async () => {
      const eventHandler = new EventHandler({} as Client);
      await eventHandler.presenceUpdate(null);

      expect(mockHttpRequest).not.toHaveBeenCalled();
      expect(mockDiscordClientGet).not.toHaveBeenCalled();
    });

    it('should call the http service with the correct url/body', async () => {
      const eventHandler = new EventHandler({} as Client);
      await eventHandler.presenceUpdate({
        status: 'offline',
        guild: { id: '1' } as Partial<Guild>,
        member: {
          user: {
            bot: true
          }
        }
      } as Presence);

      expect(mockHttpRequest).toHaveBeenCalledWith(
        'GET',
        'presence-api.com/monitoring/1'
      );
    });

    it('should send an alert to the channel if it is a monitored bot', async () => {
      mockHttpRequest.mockReturnValue({
        bots: ['123'],
        channelId: 'channelId456'
      });
      const eventHandler = new EventHandler(mockDiscordClient as Client);
      await eventHandler.presenceUpdate({
        status: 'online',
        guild: { id: '1' } as Partial<Guild>,
        member: {
          displayName: 'monitored bot',
          id: '123',
          user: {
            bot: true
          }
        }
      } as Presence);

      expect(mockDiscordClientGet).toHaveBeenCalledWith('channelId456');
      expect(mockDiscordClientSend).toHaveBeenCalledWith(
        '@everyone monitored bot is offline!'
      );
    });

    it('should send an alert to the default channel', async () => {
      mockHttpRequest.mockReturnValue({
        bots: ['123']
      });

      //resetting mocks mimics undefined channel being returned from api
      mockDiscordClientGet.mockReset();

      const eventHandler = new EventHandler(mockDiscordClient as Client);
      await eventHandler.presenceUpdate({
        status: 'online',
        guild: { id: '1' } as Partial<Guild>,
        member: {
          displayName: 'monitored bot',
          id: '123',
          user: {
            bot: true
          }
        }
      } as Presence);

      expect(mockDiscordClientFilter).toHaveBeenCalled();
      expect(mockDiscordClientSend).toHaveBeenCalledWith(
        '@everyone monitored bot is offline!'
      );
    });
  });

  describe('interactionCreate', () => {
    beforeEach(() => jest.clearAllMocks());
    it('should execute command', async () => {
      const eventHandler = new EventHandler(mockDiscordClient as Client);
      await eventHandler.interactionCreate({
        commandName: 'randomCommand',
        isCommand: () => true,
        isSelectMenu: jest.fn()
      } as any);

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should not execute command', async () => {
      const eventHandler = new EventHandler(mockDiscordClient as Client);
      await eventHandler.interactionCreate({
        isCommand: () => false,
        isSelectMenu: jest.fn()
      } as any);

      expect(mockExecute).toHaveBeenCalledTimes(0);
    });

    it('should handle the select menu event correctly', async () => {
      const eventHandler = new EventHandler(mockDiscordClient as Client);
      const interactionObj = {
        isCommand: () => false,
        isSelectMenu: () => true,
        deferReply: mockDeferReply,
        deleteReply: mockDeleteReply,
        customId: '1234'
      } as any;
      await eventHandler.interactionCreate(interactionObj);

      expect(mockDeferReply).toHaveBeenCalled();
      expect(mockDeleteReply).toHaveBeenCalled();
      expect(mockHandleSelectMenuInteractionEvent).toHaveBeenCalledWith(
        interactionObj
      );
    });
  });
});
