// Bearbeitet von ***
import { BaseController } from './BaseController';
import ConfigService from '../services/ConfigService';
import { AsyncMqttClient } from 'async-mqtt';
import { clean, fill, matches } from '../utilities/topicTools';
import Logger from '../utilities/Logger';
import Topics from '../topics/Topics';
import { TemplateResponse } from '../models/api/TemplateModels';
import { ResponseStatusCode } from '../models/api/StatusResponse';

export class TemplateController extends BaseController {
  constructor(private config: ConfigService, public client: AsyncMqttClient) {
    super(client);
  }

  async start(): Promise<void> {
    await this.client.subscribe(clean(Topics.templates.getTemplatesRequest));

    this.client.on('message', (topic: string) => {
      if (matches(clean(Topics.templates.getTemplatesRequest), topic)) {
        this.getTemplateList(topic);
      }
    });
  }

  async getTemplateList(topic: string): Promise<void> {
    // Get request parameters from topic
    const params = this.getParams(Topics.templates.getTemplatesRequest, topic);
    // Fill response topic with parameters for later use
    const responseTopic = fill(Topics.templates.getTemplatesResponse, {
      clientId: params.clientId,
    });

    // Check if the client is registred and abort if it isn't
    if (!this.clientIdRegistered(responseTopic, params.clientId)) {
      Logger.debug(
        `Request to get template list by unregistered client ${params.clientId}`
      );
    }

    // Respond to the request
    try {
      const responsePayload: TemplateResponse = { templates: [] };
      const templates = await this.config.getAllTemplates();
      for (const { id, name, placeholders } of templates) {
        responsePayload.templates.push({ name, id, placeholders });
      }
      this.client.publish(responseTopic, JSON.stringify(responsePayload));
    } catch (e) {
      const message = `Error fetching templates: ${(e as Error).message ?? e}`;
      Logger.error(message);
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.INTERNAL_SERVER_ERROR,
          statusMessage: message,
        },
        responseTopic
      );
    }
  }
}
