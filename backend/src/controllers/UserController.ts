// Bearbeitet von ***
import { BaseController } from './BaseController';
import ConfigService from '../services/ConfigService';
import { AsyncMqttClient } from 'async-mqtt';
import { clean, exec, fill, matches } from '../utilities/topicTools';
import Logger from '../utilities/Logger';
import Topics from '../topics/Topics';
import UserResponse from '../models/api/UserResponse';

export class UserController extends BaseController {
  constructor(private config: ConfigService, public client: AsyncMqttClient) {
    super(client);
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.users.getAllRequest));
    await this.client.subscribe(clean(Topics.users.getRestrictionsRequest));

    this.client.on('message', (topic: string, message: string) => {
      if (matches(clean(Topics.users.getAllRequest), topic)) {
        this.getAllUsers(message, topic);
      }

      if (matches(clean(Topics.users.getRestrictionsRequest), topic)) {
        this.getRestrictionsOfUser(message, topic);
      }
    });
  }

  async getRestrictionsOfUser(message: string, topic: string): Promise<void> {
    const params = exec(Topics.users.getRestrictionsRequest, topic);
    if (params === null) {
      throw new Error(
        `Error parsing request topic "${topic}". Please adhere to the API specifications`
      );
    }
    try {
      if (!this.cache.verifiyClientID(params.clientId)) {
        this.publishStatusCode(
          { statusCode: 400, statusMessage: 'Client not registered!' },
          fill(Topics.users.getRestrictionsResponse, {
            clientId: params.clientId,
            userId: params.userId,
          })
        );
        return;
      }

      const response = await this.config.getRestrictionsOfUser(params.userId);
      const responseTopic = fill(Topics.users.getRestrictionsResponse, {
        clientId: params.clientId,
        userId: params.userId,
      });
      this.client.publish(responseTopic, JSON.stringify(response));
      Logger.trace(
        `Restrictions of user "${params.userId}" published to "${responseTopic}"`
      );
    } catch (e) {
      this.publishStatusCode(
        {
          statusCode: 400,
          statusMessage: `Error retrieving restrictions for user "${params.userId}"`,
        },
        fill(Topics.users.getRestrictionsResponse, {
          clientId: params.clientId,
          userId: params.userId,
        })
      );
    }
  }

  async getAllUsers(message: string, topic: string): Promise<void> {
    const clientId = this.getWildcardFromTopic(
      'clientId',
      Topics.users.getAllRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.groups.getAllResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      const responseObject: UserResponse = {
        users: await this.config.getAllUsers(),
      };
      const responseTopic = fill(Topics.users.getAllResponse, {
        clientId: clientId,
      });
      this.client.publish(responseTopic, JSON.stringify(responseObject));
      Logger.trace(`All configured users published to "${responseTopic}"`);
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Could not find groups' },
        fill(Topics.groups.getAllResponse, {
          clientId: clientId,
        })
      );
    }
  }
}
