// Bearbeitet von *** & ***
import { BaseController } from './BaseController';
import ConfigService from '../services/ConfigService';
import GroupConfig from '../models/config/GroupConfig';
import { AsyncMqttClient } from 'async-mqtt';
import { clean, fill, matches } from '../utilities/topicTools';
import Logger from '../utilities/Logger';
import Topics from '../topics/Topics';
import Group from '../models/internal/Group';

/* 
Controller, which handles all messages related to groups.

Processes all CRUD request for groups from the frontend.
*/
export class GroupController extends BaseController {
  constructor(private config: ConfigService, public client: AsyncMqttClient) {
    super(client);
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.groups.post));
    await this.client.subscribe(clean(Topics.groups.update));
    await this.client.subscribe(clean(Topics.groups.delete));
    await this.client.subscribe(clean(Topics.groups.getRequest));
    await this.client.subscribe(clean(Topics.groups.getAllRequest));

    this.client.on('message', (topic: string, message: string) => {
      if (matches(clean(Topics.groups.post), topic)) {
        this.createGroup(message, topic);
      }

      if (matches(clean(Topics.groups.update), topic)) {
        this.updateGroup(message, topic);
      }

      if (matches(clean(Topics.groups.delete), topic)) {
        this.deleteGroup(message, topic);
      }

      if (matches(clean(Topics.groups.getRequest), topic)) {
        this.getGroup(message, topic);
      }

      if (matches(clean(Topics.groups.getAllRequest), topic)) {
        this.getAllGroups(message, topic);
      }
    });
  }

  async createGroup(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.groups.post,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.groups.postResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      this.config.createGroup(JSON.parse(message.toString()));
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Group created' },
        fill(Topics.groups.postResponse, {
          clientId: clientId,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Group not created' },
        fill(Topics.groups.postResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async updateGroup(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.groups.update,
      topic
    );
    const groupId: string = this.getWildcardFromTopic(
      'groupId',
      Topics.groups.update,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.groups.updateResponse, { clientId: clientId })
      );
      return;
    }

    try {
      const object: GroupConfig = JSON.parse(message.toString());
      this.config.updateGroup(groupId, object);
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Group updated' },
        fill(Topics.groups.updateResponse, { clientId: clientId })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Group not updated' },
        fill(Topics.groups.updateResponse, { clientId: clientId })
      );
    }
  }

  async deleteGroup(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.groups.delete,
      topic
    );
    const groupId: string = this.getWildcardFromTopic(
      'groupId',
      Topics.groups.delete,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.groups.deleteResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      this.config.deleteGroup(groupId);
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Group deleted' },
        fill(Topics.groups.deleteResponse, {
          clientId: clientId,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Group not deleted' },
        fill(Topics.groups.deleteResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async getGroup(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.groups.getRequest,
      topic
    );
    const groupId: string = this.getWildcardFromTopic(
      'groupId',
      Topics.groups.getRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.groups.getResponse, {
          clientId: clientId,
          groupId: groupId,
        })
      );
      return;
    }

    try {
      const response = await this.config.getGroup(groupId);
      this.client.publish(
        fill(Topics.groups.getResponse, {
          clientId: clientId,
          groupId: groupId,
        }),
        JSON.stringify(response)
      );
      Logger.log(
        'Gruppe: ' +
          response +
          ' wurde über Topic: ' +
          topic +
          ' veröffentlicht'
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'No group found' },
        fill(Topics.groups.getResponse, {
          clientId: clientId,
          groupId: groupId,
        })
      );
    }
  }

  async getAllGroups(message: string, topic: string): Promise<void> {
    const clientId = this.getWildcardFromTopic(
      'clientId',
      Topics.groups.getAllRequest,
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
      const response: Group[] = await this.config.getAllGroups();
      const responseObject: { [key: string]: Group[] } = {
        groups: response,
      };

      this.client.publish(
        fill(Topics.groups.getAllResponse, {
          clientId: clientId,
        }),
        JSON.stringify(responseObject)
      );
      Logger.log('Alle Gruppen wurde über Topic: ' + topic + ' veröffentlicht');
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Could not find groups' },
        fill(Topics.groups.getAllResponse, {
          clientId: clientId,
        })
      );
    }
  }
  async publishAllGroupsToBroadcast() {
    try {
      const response: GroupConfig[] = await this.config.getAllGroups();
      const responseObject: { [key: string]: GroupConfig[] } = {
        groups: response,
      };

      this.client.publish(
        Topics.devices.broadcast,
        JSON.stringify(responseObject)
      );
      Logger.log('Alle Gruppen wurde über die Broadcast Topic veröffentlicht');
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Could not find groups' },
        Topics.devices.broadcast
      );
    }
  }
}
