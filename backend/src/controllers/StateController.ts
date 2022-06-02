// Bearbeitet von *** & ***

import { BaseController } from './BaseController';
import StateService from '../services/StateService';
import { clean, fill, matches } from '../utilities/topicTools';
import { AsyncMqttClient } from 'async-mqtt';
import Topics from '../topics/Topics';
import { DeviceStateValidator } from '../utilities/validation/DeviceStateValidator';
import { handle } from '../utilities';
import { ResponseStatusCode } from '../models/api/StatusResponse';
import Logger from '../utilities/Logger';
import promiseData from '../utilities/promiseData';
import { InputState } from '../models/api/StateModels';

/* 
Controller, which handles all messages related to states.

Processes all read request for states from the frontend.

Processes all statechanges from the frontend
*/
export class StateController extends BaseController {
  private stateService: StateService;

  constructor(client: AsyncMqttClient, stateService: StateService) {
    super(client);
    this.stateService = stateService;
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.statemanagement.getRequest));
    await this.client.subscribe(clean(Topics.statemanagement.post));

    this.client.on('message', (topic: string, message: string) => {
      if (matches(clean(Topics.statemanagement.getRequest), topic)) {
        this.getState(message, topic);
      }

      if (matches(clean(Topics.statemanagement.post), topic)) {
        this.postState(message, topic);
      }
    });
  }

  async getState(message: string, topic: string): Promise<void> {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.statemanagement.getRequest,
      topic
    );
    const deviceId: string = this.getWildcardFromTopic(
      'deviceId',
      Topics.statemanagement.getRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.statemanagement.getResponse, {
          clientId: clientId,
          deviceId: deviceId,
        })
      );
      return;
    }

    try {
      const states: InputState[] = this.stateService.getState(deviceId);
      this.publishState(
        fill(Topics.statemanagement.getResponse, {
          clientId: clientId,
          deviceId: deviceId,
        }),
        { states: states }
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Couldnt get State' },
        fill(Topics.statemanagement.getResponse, {
          clientId: clientId,
          deviceId: deviceId,
        })
      );
    }
  }

  async postState(message: string, topic: string): Promise<void> {
    // First, the usual preparations
    const params = this.getParams(Topics.statemanagement.post, topic);
    const responseTopic = fill(Topics.statemanagement.postResponse, {
      clientId: params.clientId,
    });

    // Return if the client is not registered
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;

    try {
      const [unvalidatedState, parsingErr] = await handle(
        promiseData(JSON.parse(message.toString()))
      );
      if (unvalidatedState === undefined || parsingErr !== undefined) {
        const statusMessage = `Couldn't answer state change request for device "${
          params.deviceId
        }", error parsing JSON from message payload${
          parsingErr instanceof Error ? `: ${parsingErr.message}` : ''
        }`;
        Logger.warn(statusMessage);
        this.publishStatusCode(
          { statusCode: ResponseStatusCode.BAD_REQUEST, statusMessage },
          responseTopic
        );
      }

      // Validation of the state object
      const [validatedState, validationErr] = await handle(
        DeviceStateValidator.validate(unvalidatedState)
      );
      if (validatedState === undefined || validationErr !== undefined) {
        const statusMessage = `Couldn't answer state change request for device "${
          params.deviceId
        }", error during validation${
          validationErr instanceof Error ? `: ${validationErr.message}` : ''
        }`;
        Logger.warn(statusMessage);
        this.publishStatusCode(
          { statusCode: ResponseStatusCode.BAD_REQUEST, statusMessage },
          responseTopic
        );
      }

      // Posting the state
      const statePosted = await this.stateService.postState(
        params.deviceId,
        validatedState
      );
      if (statePosted) {
        this.publishStatusCode(
          { statusCode: 200, statusMessage: 'States ' },
          responseTopic
        );
      }
    } catch (e) {
      const statusMessage = `Error changing state of "${
        params.deviceId
      }", an error occured when posting the state${
        e instanceof Error ? `: ${e.message}` : ''
      }`;
      Logger.warn(statusMessage);
      this.publishStatusCode(
        { statusCode: ResponseStatusCode.INTERNAL_SERVER_ERROR, statusMessage },
        responseTopic
      );
    }
  }
}
