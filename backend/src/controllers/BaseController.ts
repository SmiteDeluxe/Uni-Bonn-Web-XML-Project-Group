// Bearbeitet von *** & ***
import { AsyncMqttClient } from 'async-mqtt';
import ClientIDCacheService from '../services/ClientIDCacheService';
import Logger from '../utilities/Logger';
import { exec, MqttTopic, TopicParameters } from '../utilities/topicTools';
import StatusResponse, {
  ResponseStatusCode,
} from '../models/api/StatusResponse';
import Topics from '../topics/Topics';

export abstract class BaseController {
  public client: AsyncMqttClient;
  public cache: ClientIDCacheService;

  constructor(client: AsyncMqttClient) {
    this.client = client;
    this.cache = ClientIDCacheService.getInstance();
  }

  abstract start(): void;

  public getWildcardFromTopic(
    wildcardname: string,
    topicWithWildcardname: string,
    topic: string
  ): string {
    const topicParameter: TopicParameters<string> | null = exec<string>(
      topicWithWildcardname,
      topic
    );

    const property: keyof typeof topicParameter =
      wildcardname as keyof typeof topicParameter;

    if (topicParameter === null) {
      return '';
    }

    return topicParameter[property] as string;
  }

  // generates ClientId which is needed to authenticate
  public getClientID(): void {
    const clientID = { clientID: this.cache.getID() };
    this.client.publish(Topics.client.response, JSON.stringify(clientID));
    Logger.log('ClientID: ' + clientID.clientID + ' wurde veröffentlicht');
  }

  protected getParams<P extends string>(
    pattern: P,
    topic: MqttTopic,
    responseTopic = 'errors/malformedTopic'
  ): TopicParameters<P> {
    const params = exec(pattern, topic);
    if (params === null) {
      const message = `Error parsing parameters from "${topic}". The topic might not be complient with the API specifications.`;
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.BAD_REQUEST,
          statusMessage: message,
        },
        responseTopic
      );
      throw new Error(message);
    }
    return params;
  }

  // checks if a given ClientId is registered in the ClientIdCache
  protected clientIdRegistered(responseTopic: string, clientId: string) {
    if (!this.cache.verifiyClientID(clientId)) {
      this.publishStatusCode(
        {
          statusCode: ResponseStatusCode.UNAUTHORIZED,
          statusMessage: `Client "${clientId}" not registered!`,
        },
        responseTopic
      );
      return false;
    } else return true;
  }

  public publishStatusCode(
    statusCode: StatusResponse,
    responseTopic: string
  ): void {
    this.client.publish(responseTopic, JSON.stringify(statusCode));
    Logger.trace(
      `Published status "${statusCode.statusCode} - ${statusCode.statusMessage}" to topic "${responseTopic}"`
    );
  }

  public publishState(topic: string, state: object): void {
    this.client.publish(topic, JSON.stringify(state));
    Logger.log(
      'State: ' + state + ' wurde über Topic: ' + topic + ' veröffentlicht'
    );
  }
}
