// Bearbeitet von *** & ***
import { BaseController } from './BaseController';
import ConfigService from '../services/ConfigService';
import { AsyncMqttClient } from 'async-mqtt';
import { clean, fill, matches } from '../utilities/topicTools';
import Logger from '../utilities/Logger';
import Topics from '../topics/Topics';
import { DeviceCreate, DeviceUpdate } from '../models/api/DeviceModels';
import { ResponseStatusCode } from '../models/api/StatusResponse';
import { handle } from '../utilities';
import StateCacheService from '../services/StateCacheService';
import Device from '../models/internal/Device';

/* 
Controller, which handles all messages related to devices.

Processes all CRUD request for devices from the frontend.
*/
export class DeviceController extends BaseController {
  constructor(
    private config: ConfigService,
    public client: AsyncMqttClient,
    private stateCacheService: StateCacheService
  ) {
    super(client);
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.devices.post));
    await this.client.subscribe(clean(Topics.devices.update));
    await this.client.subscribe(clean(Topics.devices.delete));
    await this.client.subscribe(clean(Topics.devices.getRequest));
    await this.client.subscribe(clean(Topics.devices.getAllRequest));
    await this.client.subscribe(clean(Topics.devices.getGroupDevicesRequest));
    await this.client.subscribe(Topics.client.createRequest);

    this.client.on('message', async (topic: string, message: string) => {
      if (matches(clean(Topics.devices.post), topic)) {
        this.createDevice(message, topic);
      }

      if (matches(clean(Topics.devices.update), topic)) {
        this.updateDevice(message, topic);
      }

      if (matches(clean(Topics.devices.delete), topic)) {
        this.deleteDevice(message, topic);
      }

      if (matches(clean(Topics.devices.getRequest), topic)) {
        this.getDevice(message, topic);
      }

      if (matches(clean(Topics.devices.getAllRequest), topic)) {
        this.getAllDevices(message, topic);
      }

      if (matches(clean(Topics.devices.getGroupDevicesRequest), topic)) {
        this.getAllGroupDevices(message, topic);
      }

      if (Topics.client.createRequest == topic) {
        this.getClientID();
      }
    });
  }

  async getDevice(message: string, topic: string): Promise<void> {
    const params = this.getParams(Topics.devices.getRequest, topic);
    const responseTopic = fill(Topics.devices.getResponse, {
      clientId: params.clientId,
      deviceId: params.deviceId,
    });

    if (!this.cache.verifiyClientID(params.clientId)) {
      this.publishStatusCode(
        {
          statusCode: 400,
          statusMessage: `Client "${params.clientId}" not registered!`,
        },
        fill(Topics.devices.getResponse, {
          clientId: params.clientId,
          deviceId: params.deviceId,
        })
      );
      return;
    }
    const [device, readErr] = await handle(
      this.config.getDevice(params.deviceId)
    );
    if (device === undefined || readErr) {
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.NOT_FOUND,
          statusMessage: (readErr as Error).message ?? `${readErr}`,
        },
        responseTopic
      );
      return;
    }
    await this.client.publish(responseTopic, JSON.stringify(device));
    Logger.trace(
      `Device with id "${device.id}" published on "${responseTopic}"`
    );
  }

  async getAllDevices(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.devices.getAllRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.devices.getAllResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      const response: Device[] = await this.config.getAllDevices();
      const responseObject: { [key: string]: Device[] } = {
        devices: response,
      };
      this.client.publish(
        fill(Topics.devices.getAllResponse, {
          clientId: clientId,
        }),
        JSON.stringify(responseObject)
      );
      Logger.log('Alle Geräte wurden über Topic: ' + topic + ' veröffentlicht');
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Couldnt search for Devices!' },
        fill(Topics.devices.getAllResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async createDevice(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.devices.post,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.devices.postResponse, {
          clientId: clientId,
        })
      );
      return;
    }
    try {
      const newDevice: DeviceCreate = JSON.parse(message.toString());
      await this.config.createDevice(newDevice);
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Device created!' },
        fill(Topics.devices.postResponse, {
          clientId: clientId,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Device not created!' },
        fill(Topics.devices.postResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async updateDevice(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.devices.update,
      topic
    );
    const deviceId: string = this.getWildcardFromTopic(
      'deviceId',
      Topics.devices.update,
      topic
    );
    const object: DeviceUpdate = JSON.parse(message.toString());

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.devices.updateResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      await this.config.updateDevice(deviceId, object);
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Device udpated' },
        fill(Topics.devices.updateResponse, {
          clientId: clientId,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Device not updated!' },
        fill(Topics.devices.updateResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async deleteDevice(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.devices.delete,
      topic
    );
    const deviceId: string = this.getWildcardFromTopic(
      'deviceId',
      Topics.devices.delete,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.devices.deleteResponse, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      const deleted = await this.config.deleteDevice(deviceId);
      if (!deleted) {
        this.publishStatusCode(
          {
            statusCode: 400,
            statusMessage: 'Device not deleted, Automation includes Device',
          },
          fill(Topics.devices.deleteResponse, {
            clientId: clientId,
          })
        );
        return;
      }
      this.publishStatusCode(
        { statusCode: 200, statusMessage: 'Device deleted' },
        fill(Topics.devices.deleteResponse, {
          clientId: clientId,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Device not deleted' },
        fill(Topics.devices.deleteResponse, {
          clientId: clientId,
        })
      );
    }
  }

  async getAllGroupDevices(message: string, topic: string): Promise<void> {
    const clientId = this.getWildcardFromTopic(
      'clientId',
      Topics.devices.getGroupDevicesRequest,
      topic
    );
    const groupId: string = this.getWildcardFromTopic(
      'groupId',
      Topics.devices.getGroupDevicesRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.devices.getGroupDevicesResponse, {
          clientId: clientId,
          groupId: groupId,
        })
      );
      return;
    }

    try {
      const response: Device[] = await this.config.getAllGroupDevices(groupId);

      const responseObject: { [key: string]: Device[] } = {
        devices: response,
      };

      this.client.publish(
        fill(Topics.devices.getGroupDevicesResponse, {
          clientId: clientId,
          groupId: groupId,
        }),
        JSON.stringify(responseObject)
      );
      Logger.log('Geräte  wurde über Topic: ' + topic + ' veröffentlicht');
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Couldnt search for Devices!' },
        fill(Topics.devices.getGroupDevicesResponse, {
          clientId: clientId,
          groupId: groupId,
        })
      );
    }
  }
}
