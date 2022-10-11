import { Channel, Client, Guild, Presence } from 'discord.js';
import { getConfig } from '../getConfig';
import { httpRequest } from '../httpService/http';
import EventHandler from './eventHandler';

jest.mock('discord.js', () => ({
  PresenceUpdateStatus: { Online: 'online', Offline: 'offline' }
}));
jest.mock('../commands/commandFiles', () => {});
jest.mock('../httpService/http');
jest.mock('../getConfig');

const mockDiscordClientGet = jest.fn();
const mockDiscordClientFilter = jest.fn();
const mockDiscordClientSend = jest.fn();
const mockHttpRequest = httpRequest as jest.Mock<any>;
const mockConfig = getConfig as jest.Mock<any>;
const mockDiscordClient: Partial<Client> = {
  channels: {
    cache: { get: mockDiscordClientGet, filter: mockDiscordClientFilter }
  } as any
};

mockDiscordClientGet.mockReturnValue({
  channel: { send: mockDiscordClientSend }
});
mockDiscordClientFilter.mockImplementationOnce(() => ({ at: jest.fn() }));

describe('eventHandler', () => {
  beforeEach(() => {
    mockConfig.mockReturnValue({ PRESENCE_API_URL: 'presence-api.com' });
  });

  describe('presenceUpdate', () => {
    beforeEach(() => {
      mockHttpRequest.mockReturnValue({ bots: [] });
    });
    it('should not alert if data is null', () => {
      const eventHandler = new EventHandler({} as Client);
      eventHandler.presenceUpdate(null);

      expect(mockHttpRequest).not.toHaveBeenCalled();
      expect(mockDiscordClientGet).not.toHaveBeenCalled();
    });

    it('should call the http service with the correct url/body', () => {
      const eventHandler = new EventHandler({} as Client);
      eventHandler.presenceUpdate({
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

    it('should send an alert to the channel if it is a monitored bot', () => {
      mockHttpRequest.mockReturnValue({
        bots: ['123'],
        channelId: 'channelId456'
      });
      const eventHandler = new EventHandler(mockDiscordClient as Client);
      eventHandler.presenceUpdate({
        status: 'offline',
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
      expect(mockDiscordClientFilter).toHaveBeenCalled();
      expect(mockDiscordClientSend).toHaveBeenCalledWith(
        'monitored is offline!'
      );
    });
  });
});
