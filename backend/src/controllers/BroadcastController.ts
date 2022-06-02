import { AsyncMqttClient } from 'async-mqtt';
import Logger from '../utilities/Logger';
import { BaseController } from './BaseController';

/* 
Controller, which publish all Messages to BroadcastTopics.

Message Format depends on message type
*/
export default class BroadcastController extends BaseController {
  constructor(public client: AsyncMqttClient) {
    super(client);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start() {}

  async publishToBroadcast(topic: string, message: any, type: string) {
    let responseObject: any;
    if (type === 'device') {
      responseObject = {
        devices: message,
      };
    } else if (type === 'group') {
      responseObject = {
        groups: message,
      };
    } else if (type === 'state') {
      responseObject = message;
    } else if (type === 'automations') {
      responseObject = {
        automations: message,
      };
    }

    try {
      this.client.publish(topic, JSON.stringify(responseObject ?? message));
      if (type === 'device') {
        Logger.trace('Published all devices to broadcast');
      } else if (type === 'group') {
        Logger.trace('Published all groups to broadcast');
      } else if (type === 'automations') {
        Logger.trace('Published all automations to broadcast');
      } else if (type === 'state') {
        Logger.trace(
          `Published state "${JSON.stringify(message)}" to broadcast`
        );
      } else if (type === 'offline') {
        Logger.trace(
          `Device with id ${JSON.stringify(message.device)}" is offline`
        );
      }
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Couldnt search for Devices!' },
        topic
      );
    }
  }
}
