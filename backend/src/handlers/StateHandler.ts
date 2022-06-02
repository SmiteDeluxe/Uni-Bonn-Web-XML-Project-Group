//bearbeitet von ***
import { AsyncMqttClient } from 'async-mqtt';
import Logger from '../utilities/Logger';
import StateService from '../services/StateService';
import StateCacheService from '../services/StateCacheService';
import ConfigService from '../services/ConfigService';
import BroadcastController from '../controllers/BroadcastController';
import Device from '../models/internal/Device';

export class StateHandler {
  private stateService: StateService;
  private client: AsyncMqttClient;
  private config: ConfigService;
  private devices: Promise<Device[]>;
  constructor(
    client: AsyncMqttClient,
    config: ConfigService,
    stateCacheService: StateCacheService,
    connection: ConfigService
  ) {
    this.client = client;
    this.stateService = StateService.getInstance(
      stateCacheService,
      connection,
      new BroadcastController(this.client),
      this
    );

    this.config = config;
    this.devices = this.config.getAllDevices();
    this.config.on('updatedDeviceConfig', () => {
      this.client.removeListener('message', this.registerListener([]));
      this.devices = this.config.getAllDevices();
      this.start();
    });
  }

  async start() {
    const devices = await this.devices;

    devices.forEach((device: Device) => {
      device.template.listeners.forEach((listener: any) => {
        this.client.subscribe(listener.topic);
      });
    });

    this.client.on('message', this.registerListener(devices));
  }

  public registerListener(devices: Device[]) {
    return (topic: string, message: string) => {
      devices.forEach((device: Device) => {
        device.template.listeners.forEach((listener) => {
          if (topic == listener.topic) {
            if (listener.type !== 'command') {
              this.stateService.postStateFromDevice(
                device.id,
                JSON.parse(message),
                listener.id
              );
            } else {
              this.stateService.postStateFromDevice(
                device.id,
                message.toString(),
                listener.id
              );
            }
          }
        });
      });
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async subscribeToDeviceState() {}

  publishToDevice(topic: string, message: string) {
    this.client.publish(topic, message);
    Logger.log('State published to Device');
  }

  publishObjectToDevice(topic: string, message: any) {
    this.client.publish(topic, JSON.stringify(message));
    Logger.log('State published to Device');
  }
}
