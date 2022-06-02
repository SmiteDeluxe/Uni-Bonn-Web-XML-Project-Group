//bearbeitet von ***
import { randomUUID } from 'crypto';
export default class ClientIDCacheService {
  private static _instance: ClientIDCacheService;

  private clientIds: string[] = [
    'clientId',
    'automation',
    'commandline',
    'broadcastClient',
  ];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // requests for a new clientId
  public getID(): string {
    const id: string = randomUUID();
    this.clientIds.push(id);
    return id;
  }

  //checks if the given id is registered
  public verifiyClientID(id: string): boolean {
    return this.clientIds.includes(id);
  }

  //singleton getInstance function
  public static getInstance(): ClientIDCacheService {
    return this._instance || (this._instance = new this());
  }
}
