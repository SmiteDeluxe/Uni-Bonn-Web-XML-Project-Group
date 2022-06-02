// bearbeitet von ***
import { AsyncMqttClient } from 'async-mqtt';
import LogService from '../services/LogService';
import Topics from '../topics/Topics';
import { clean, fill, matches } from '../utilities/topicTools';
import { BaseController } from './BaseController';

/* 
Controller, which handles all messages related to logs.

Processes all read request for logs from the frontend.
*/
export default class LogController extends BaseController {
  constructor(public client: AsyncMqttClient, private logService: LogService) {
    super(client);
  }
  async start() {
    await this.client.subscribe(clean(Topics.logsmanagement.requestList));
    await this.client.subscribe(clean(Topics.logsmanagement.requestLog));

    this.client.on('message', (topic: string) => {
      if (matches(clean(Topics.logsmanagement.requestList), topic)) {
        this.getFileNames(topic);
      }

      if (matches(clean(Topics.logsmanagement.requestLog), topic)) {
        this.getLogData(topic);
      }
    });
  }

  async getLogData(topic: string) {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.logsmanagement.requestLog,
      topic
    );

    const logId: string = this.getWildcardFromTopic(
      'logId',
      Topics.logsmanagement.requestLog,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.logsmanagement.responseLog, {
          clientId,
          logId,
        })
      );
      return;
    }

    const logNames = await this.logService.getFileNames();
    if (!logNames.includes(logId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Log not found!' },
        fill(Topics.logsmanagement.responseLog, {
          clientId,
          logId,
        })
      );
      return;
    }

    try {
      const response: string = await this.logService.getLog(logId);
      const responseObject = {
        log: response,
      };
      this.client.publish(
        fill(Topics.logsmanagement.responseLog, {
          clientId,
          logId,
        }),
        JSON.stringify(responseObject)
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Loglist not posted!' },
        fill(Topics.logsmanagement.responseList, {
          clientId: clientId,
        })
      );
    }
  }

  async getFileNames(topic: string) {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.logsmanagement.requestList,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.logsmanagement.responseList, {
          clientId: clientId,
        })
      );
      return;
    }

    try {
      const response: string[] = await this.logService.getFileNames();
      this.client.publish(
        fill(Topics.logsmanagement.responseList, {
          clientId: clientId,
        }),
        JSON.stringify(response)
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Loglist not posted!' },
        fill(Topics.logsmanagement.responseList, {
          clientId: clientId,
        })
      );
    }
  }
}
