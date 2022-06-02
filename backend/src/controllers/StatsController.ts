//bearbeitet von ***
import { AsyncMqttClient } from 'async-mqtt';
import StatsService from '../services/StatsService';
import Topics from '../topics/Topics';
import { clean, fill, matches } from '../utilities/topicTools';
import { BaseController } from './BaseController';

/* 
Controller, which handles all messages related to statistics.

Processes all read request for statistics from the frontend.
*/
export default class StatsController extends BaseController {
  private statsService: StatsService;

  constructor(client: AsyncMqttClient, statsService: StatsService) {
    super(client);
    this.statsService = statsService;
  }

  async start() {
    await this.client.subscribe(
      clean(Topics.statsmanagement.getLastEntriesRequest)
    );
    await this.client.subscribe(
      clean(Topics.statsmanagement.getEntriesBetweenRequest)
    );
    await this.client.subscribe(
      clean(Topics.statsmanagement.getFullDayRequest)
    );
    this.client.on('message', (topic: string, message: string) => {
      if (matches(clean(Topics.statsmanagement.getLastEntriesRequest), topic)) {
        this.getStats(topic);
      }

      if (
        matches(clean(Topics.statsmanagement.getEntriesBetweenRequest), topic)
      ) {
        this.getBetweenInterval(topic, message);
      }
      if (matches(clean(Topics.statsmanagement.getFullDayRequest), topic)) {
        this.getStatsByDay(topic);
      }
    });
  }

  async getStats(topic: string) {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.statsmanagement.getLastEntriesRequest,
      topic
    );

    const numberEntries: string = this.getWildcardFromTopic(
      'numberEntries',
      Topics.statsmanagement.getLastEntriesRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.statsmanagement.getLastEntriesResponse, {
          clientId: clientId,
          numberEntries: numberEntries,
        })
      );
      return;
    }

    try {
      const response: string = await this.statsService.getStats(+numberEntries);
      this.client.publish(
        fill(Topics.statsmanagement.getLastEntriesResponse, {
          clientId: clientId,
          numberEntries: numberEntries,
        }),
        JSON.stringify({
          statistics: response,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'No Stats available!' },
        fill(Topics.statsmanagement.getLastEntriesResponse, {
          clientId: clientId,
          numberEntries: numberEntries,
        })
      );
    }
  }

  async getStatsByDay(topic: string) {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.statsmanagement.getFullDayRequest,
      topic
    );

    const day: string = this.getWildcardFromTopic(
      'day',
      Topics.statsmanagement.getFullDayRequest,
      topic
    );

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.statsmanagement.getFullDayResponse, {
          clientId,
          day,
        })
      );
      return;
    }

    try {
      const response = await this.statsService.readByDay(day);
      this.client.publish(
        fill(Topics.statsmanagement.getFullDayResponse, {
          clientId,
          day,
        }),
        JSON.stringify({
          statistics: response,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'No Stats available!' },
        fill(Topics.statsmanagement.getFullDayResponse, {
          clientId,
          day,
        })
      );
    }
  }

  async getBetweenInterval(topic: string, message: string) {
    const clientId: string = this.getWildcardFromTopic(
      'clientId',
      Topics.statsmanagement.getEntriesBetweenRequest,
      topic
    );

    const day: string = this.getWildcardFromTopic(
      'day',
      Topics.statsmanagement.getEntriesBetweenRequest,
      topic
    );
    const start: string = JSON.parse(message).start;
    const end: string = JSON.parse(message).end;

    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'Client not registered!' },
        fill(Topics.statsmanagement.getEntriesBetweenResponse, {
          clientId,
          day,
        })
      );
      return;
    }

    try {
      const response = await this.statsService.readByInterval(day, start, end);
      this.client.publish(
        fill(Topics.statsmanagement.getEntriesBetweenResponse, {
          clientId,
          day,
        }),
        JSON.stringify({
          statistics: response,
        })
      );
    } catch (e) {
      this.publishStatusCode(
        { statusCode: 400, statusMessage: 'No Stats available!' },
        fill(Topics.statsmanagement.getEntriesBetweenResponse, {
          clientId,
          day,
        })
      );
    }
  }
}
