import { getConfig } from '../getConfig';
import { httpRequest } from '../httpService/http';
import InteractionHandler from './interactionHandler';

jest.mock('../getConfig');
jest.mock('../httpService/http');

const mockHttpRequest = httpRequest as jest.Mocked<any>;
const mockGetConfig = getConfig as jest.Mocked<any>;
mockGetConfig.mockReturnValue({ PRESENCE_API_URL: 'presence-api.dev.com' });

describe('Interaction Handler', () => {
  describe('handleSelectMenuInteractionEvent', () => {
    const testCasesForConstructingBody = [
      {
        customId: 'selectBot',
        body: {
          bots: ['1234']
        }
      },
      {
        customId: 'selectChannel',
        body: {
          channelId: '1234'
        }
      }
    ];
    it.each(Object.values(testCasesForConstructingBody))(
      'should create the correct body for %s',
      (testCase) => {
        const interactionHandler = new InteractionHandler();
        interactionHandler.handleSelectMenuInteractionEvent({
          customId: testCase.customId,
          values: ['1234'],
          guildId: '4567'
        } as any);

        expect(mockHttpRequest).toHaveBeenCalledWith(
          'post',
          `presence-api.dev.com/update/4567`,
          {
            body: testCase.body
          }
        );
      }
    );
  });
});
