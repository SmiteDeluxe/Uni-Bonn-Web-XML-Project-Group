//bearbeitet von ***
import { DateTime } from 'luxon';
import config from '../config';
import BroadcastController from '../controllers/BroadcastController';
import { StateHandler } from '../handlers/StateHandler';
import Device from '../models/internal/Device';
import Topics from '../topics/Topics';
import { fill } from '../utilities/topicTools';
import ConfigService from './ConfigService';
import StateCacheService from './StateCacheService';
import { resolve, valid } from '../utilities/JsonPath';
import { handle } from '../utilities';

export default class StateService {
  private publishTime: { [k: string]: any } = {};
  private static _instance: StateService;
  private timeToWaitForDeviceResponse: number;

  private constructor(
    private stateCacheService: StateCacheService,
    private configService: ConfigService,
    private broadcastController: BroadcastController,
    private stateHandler: StateHandler
  ) {
    this.timeToWaitForDeviceResponse = config.state?.timeout ?? 500;
  }

  getState(id: string) {
    const data = this.stateCacheService.getDeviceState(id);

    // if no data is given -> device offline
    if (data == undefined) {
      this.broadcastController.publishToBroadcast(
        fill(Topics.statemanagement.offlineDevice, { deviceId: id }),
        { device: id },
        'offline'
      );
      return;
    }

    return data;
  }

  async postState(deviceId: string, object: any): Promise<boolean> {
    const device = await this.configService.getDevice(deviceId);
    this.publishStateToDevice(device, object);

    /*
      sets timestamp and checks if device is answering in given timeintervall
      if its not -> device offline
    */
    this.publishTime[device.id] = DateTime.now().toMillis();
    const publishTimeCheck = this.publishTime[device.id];

    await this.delay(this.timeToWaitForDeviceResponse);
    if (publishTimeCheck < this.publishTime[device.id]) {
      return true;
    } else {
      this.broadcastController.publishToBroadcast(
        fill(Topics.statemanagement.offlineDevice, { deviceId: device.id }),
        { device: deviceId },
        'offline'
      );
      return false;
    }
  }

  async postStateFromDevice(
    deviceId: string,
    message: any,
    listenerId: string
  ) {
    const [device, deviceError]: [Device | undefined, unknown] = await handle(
      this.configService.getDevice(deviceId)
    );
    if (deviceError !== undefined || device == undefined) {
      return;
    }
    // sets timestamp for offline check
    this.publishTime[device.id] = DateTime.now().toMillis();

    // converts messageobject to array of stateobjects
    let convertedStates;
    const listener = device.template.listeners.filter(
      (listener: any) => listener.id == listenerId
    )[0];
    if (listener.type !== 'command') {
      convertedStates = await this.convertDeviceStateToClientState(
        message,
        device,
        listener
      );
    } else {
      convertedStates = {
        states: [{ inputId: listener.payloadInput, value: message }],
      };
    }

    this.stateCacheService.updateState(deviceId, convertedStates);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static getInstance(
    stateCacheService: StateCacheService,
    config: ConfigService,
    broadcastController: BroadcastController,
    stateHandler: StateHandler
  ): StateService {
    return (
      this._instance ||
      (this._instance = new this(
        stateCacheService,
        config,
        broadcastController,
        stateHandler
      ))
    );
  }

  //publishs for every defined action the given inputs
  publishStateToDevice(device: any, inputs: any) {
    const publishObject = this.convertStatesToInputObject(inputs.states);
    const neededActions = this.getNeededActionFromDevice(device, publishObject);

    //checks for every action if its type is command
    neededActions.forEach((action: any) => {
      if (action.type != 'command') {
        this.stateHandler.publishObjectToDevice(
          action.topic,
          this.convertStatesToPublishObject(action.payload)
        );
      } else {
        this.stateHandler.publishToDevice(
          action.topic,
          publishObject[Object.keys(action.payload[0])[0]]
        );
      }
    });
  }

  // checks for  all actions from device, which contains given inputs and returns them
  getNeededActionFromDevice(device: any, input: any) {
    let createdActions: any = [];
    device.template.actions.forEach((action: any) => {
      let constructedAction: any = {};
      constructedAction['payload'] = [];
      Object.keys(input).forEach((inputKey) => {
        if (action.payloadInput.includes(inputKey, 0)) {
          let object: any = {};
          object[inputKey] = input[inputKey];
          constructedAction['payload'].push(object);
        }
      });
      constructedAction['topic'] = action.topic;
      constructedAction['type'] = action.type;
      if (constructedAction.payload.length > 0) {
        createdActions.push(constructedAction);
      }
    });
    return createdActions;
  }

  /*
   converts a List of states to Object
  
    [{inputId: 'example', value: 'on'}, {inputId: 'example2', value: 'off'}] -> {example: 'on', example2: 'off'}
   */
  convertStatesToInputObject(states: any) {
    let returnObject: any = {};
    states.forEach((state: any) => {
      returnObject[state.inputId] = state.value;
    });
    return returnObject;
  }

  /*
    converts a list of single inputs to one object
    [ { red: 160 }, { green: 13 }, { blue: 13 } ] -> { red: 160, green: 13, blue: 13 }
  */
  convertStatesToPublishObject(payload: any) {
    let object: any = {};
    payload.forEach((input: any) => {
      object[Object.keys(input)[0]] = input[Object.keys(input)[0]];
    });
    return object;
  }

  /*
    converts a Object of states to a List of States
    can handle nested objects
    {example: 'on', example2: 'off'} -> [{inputId: 'example', value: 'on'}, {inputId: 'example2', value: 'off'}]

    can handle nested objects like 
    {
      values:{ 
        example: 'on',
        example2: 'off'
      }
    } -> [{inputId: 'example', value: 'on'}, {inputId: 'example2', value: 'off'}]
   */
  convertDeviceStateToClientState(states: any, device: Device, listener: any) {
    const inputs = device.template.inputs;
    const stateArray: any = [];
    inputs.forEach((input) => {
      if (!listener.payloadInput.includes(input.id)) {
        return;
      }
      if (!input.path) {
        Object.keys(states).forEach((state) => {
          if (input.id == state) {
            const object: any = {};
            object['inputId'] = state;
            object['value'] = states[state];
            stateArray.push(object);
          }
        });
      } else {
        if (!valid(input.path, states)) {
          const object: any = {};
          object['inputId'] = input.id;
          object['value'] = resolve(input.path, states);
          stateArray.push(object);
        }
      }
    });
    return { states: stateArray };
  }
}
