// Bearbeitet von ***
import { BaseController } from './BaseController';
import ConfigService from '../services/ConfigService';
import { AsyncMqttClient } from 'async-mqtt';
import { clean, fill, matches } from '../utilities/topicTools';
import Logger from '../utilities/Logger';
import Topics from '../topics/Topics';
import StatusResponse, {
  ResponseStatusCode,
} from '../models/api/StatusResponse';
import { AllAutomationsResponse } from '../models/api/AutomationModels';
import { handle } from '../utilities';
import { AutomationCreateValidator } from '../utilities/validation/AutomationCreateValidator';
import { ValidationError } from '../utilities/validation/Validator';
import { AutomationUpdateValidator } from '../utilities/validation/AutomationUpdateValidator';

export class AutomationController extends BaseController {
  constructor(private config: ConfigService, public client: AsyncMqttClient) {
    super(client);
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.automations.deleteRequest));
    await this.client.subscribe(clean(Topics.automations.getAllRequest));
    await this.client.subscribe(clean(Topics.automations.getRequest));
    await this.client.subscribe(clean(Topics.automations.updateRequest));
    await this.client.subscribe(clean(Topics.automations.postRequest));

    this.client.on('message', (topic: string, message: string) => {
      if (matches(clean(Topics.automations.getAllRequest), topic)) {
        this.getAllAutomations(message, topic);
      }

      if (matches(clean(Topics.automations.getRequest), topic)) {
        this.getAutomation(message, topic);
      }

      if (matches(clean(Topics.automations.postRequest), topic)) {
        this.createAutomation(message, topic);
      }

      if (matches(clean(Topics.automations.updateRequest), topic)) {
        this.updateAutomation(message, topic);
      }

      if (matches(clean(Topics.automations.deleteRequest), topic)) {
        this.deleteAutomation(message, topic);
      }
    });
  }

  async createAutomation(message: string, topic: string) {
    const params = this.getParams(Topics.automations.postRequest, topic);
    const responseTopic = fill(Topics.automations.postResponse, {
      clientId: params.clientId,
    });
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;
    const [validatedData, validationErr] = await handle(
      AutomationCreateValidator.validate(JSON.parse(message))
    );
    if (validatedData !== undefined && validationErr === undefined) {
      this.config.createAutomation(validatedData.automation);
    } else {
      let response: StatusResponse;
      if (validationErr instanceof ValidationError) {
        response = {
          statusCode: ResponseStatusCode.BAD_REQUEST,
          statusMessage: `${(validationErr as Error).message ?? validationErr}`,
        };
        Logger.warn(
          `Create automation request posted invalid data: ${response.statusMessage}`
        );
      } else {
        response = {
          statusCode: ResponseStatusCode.INTERNAL_SERVER_ERROR,
          statusMessage: `${(validationErr as Error).message ?? validationErr}`,
        };
        Logger.warn(
          `Error when handling create automation request: ${response.statusMessage}`
        );
      }
      this.publishStatusCode(response, responseTopic);
    }
  }

  async updateAutomation(message: string, topic: string) {
    const params = this.getParams(Topics.automations.updateRequest, topic);
    const responseTopic = fill(Topics.automations.updateResponse, {
      clientId: params.clientId,
    });
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;
    const [validatedData, validationErr] = await handle(
      AutomationUpdateValidator.validate(JSON.parse(message))
    );
    if (validatedData !== undefined && validationErr === undefined) {
      const [, updateErr] = await handle(
        this.config.updateAutomation(
          params.automationId,
          validatedData.automation
        )
      );
      if (updateErr !== undefined) {
        const response: StatusResponse = {
          statusCode: ResponseStatusCode.NOT_FOUND,
          statusMessage: `${(updateErr as Error).message ?? updateErr}`,
        };
        this.publishStatusCode(response, responseTopic);
        Logger.warn(
          `Could not fullfill request to update automation "${params.automationId}" because an error occured: "${response.statusMessage}"`
        );
        return;
      }
      const response: StatusResponse = {
        statusCode: ResponseStatusCode.OK,
        statusMessage: `Successfully updated automation "${params.automationId}"`,
      };
      this.publishStatusCode(response, responseTopic);
      Logger.trace(response.statusMessage);
    } else {
      let response: StatusResponse;
      if (validationErr instanceof ValidationError) {
        response = {
          statusCode: ResponseStatusCode.BAD_REQUEST,
          statusMessage: `${(validationErr as Error).message ?? validationErr}`,
        };
        Logger.warn(
          `Update automation "${params.automationId}" request posted invalid data: ${response.statusMessage}`
        );
      } else {
        response = {
          statusCode: ResponseStatusCode.INTERNAL_SERVER_ERROR,
          statusMessage: `${(validationErr as Error).message ?? validationErr}`,
        };
        Logger.warn(
          `Error when handling update automation "${params.automationId}" request: ${response.statusMessage}`
        );
      }
      this.publishStatusCode(response, responseTopic);
    }
  }

  async getAutomation(message: string, topic: string): Promise<void> {
    const params = this.getParams(Topics.automations.getRequest, topic);
    const responseTopic = fill(Topics.automations.getResponse, {
      clientId: params.clientId,
      automationId: params.automationId,
    });
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;
    const [automation, readErr] = await handle(
      this.config.getAutomation(params.automationId)
    );
    if (automation !== undefined && readErr === undefined) {
      this.client.publish(responseTopic, JSON.stringify(automation));
      Logger.trace(
        `Automation "${params.automationId}" published to "${responseTopic}"`
      );
    } else {
      const response = {
        statusCode: ResponseStatusCode.NOT_FOUND,
        statusMessage: `${(readErr as Error).message ?? readErr}`,
      };
      this.publishStatusCode(response, responseTopic);
      Logger.warn(
        `Could not fullfill request to read automation "${params.automationId}" because an error occured: ${response.statusMessage}`
      );
    }
  }

  async deleteAutomation(message: string, topic: string): Promise<void> {
    const params = this.getParams(Topics.automations.deleteRequest, topic);
    const responseTopic = fill(Topics.automations.deleteResponse, {
      clientId: params.clientId,
    });
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;
    const [, deleteErr] = await handle(
      this.config.deleteAutomation(params.automationId)
    );
    if (deleteErr === undefined) {
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.OK,
          statusMessage: `Successfully deleted automation "${params.automationId}"`,
        },
        responseTopic
      );
      Logger.trace(
        `Automation "${params.automationId}" deleted and confirmation published to "${responseTopic}"`
      );
    } else {
      const response = {
        statusCode: ResponseStatusCode.NOT_FOUND,
        statusMessage: `${(deleteErr as Error).message ?? deleteErr}`,
      };
      this.publishStatusCode(response, responseTopic);
      Logger.warn(
        `Could not fulfill request to delete automation "${params.automationId}" because an error occured: ${response.statusMessage}`
      );
    }
  }

  async getAllAutomations(message: string, topic: string): Promise<void> {
    const params = this.getParams(Topics.automations.getAllRequest, topic);
    const responseTopic = fill(Topics.automations.getAllResponse, {
      clientId: params.clientId,
    });
    if (!this.clientIdRegistered(responseTopic, params.clientId)) return;

    try {
      const responseObject: AllAutomationsResponse = {
        automations: await this.config.getAllAutomations(),
      };
      this.client.publish(responseTopic, JSON.stringify(responseObject));
      Logger.trace(`All configured users published to "${responseTopic}"`);
    } catch (e) {
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.INTERNAL_SERVER_ERROR,
          statusMessage: 'Error retrieving configured automations',
        },
        responseTopic
      );
    }
  }
}
