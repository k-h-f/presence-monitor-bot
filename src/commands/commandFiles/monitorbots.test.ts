import { ChatInputCommandInteraction } from 'discord.js';
import { execute } from './monitorbots';
import InteractionHandler from '../../interactionHandler/interactionHandler';
import { httpRequest } from '../../httpService/http';

jest.mock('../../interactionHandler/interactionHandler', () =>
  jest.fn().mockImplementation(() => ({
    getCustomIds: jest.fn().mockReturnValue({
      SELECT_BOT: 'selectbot',
      SELECT_CHANNEL: 'selectchannel'
    })
  }))
);

jest.mock('../../httpService/http');

const mockHttpRequest = httpRequest as jest.Mocked<any>;
const mockInteractionReply = jest.fn();

describe('monitorbots', () => {
  it('should reply with unhappy Discord API message', () => {
    execute({
      reply: mockInteractionReply
    } as any);

    expect(mockInteractionReply).toHaveBeenCalledWith(
      'Something went wrong... Could not find bots using Discord API'
    );
  });
});
