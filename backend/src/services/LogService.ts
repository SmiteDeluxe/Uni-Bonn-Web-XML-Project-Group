//bearbeitet von ***

import ILogAdapter from '../adapters/interfaces/ILogAdapter';

export default class LogService {
  constructor(private logAdapter: ILogAdapter) {}

  async getFileNames(): Promise<string[]> {
    return this.logAdapter.readFileNames();
  }

  async getLog(logId: string): Promise<string> {
    return this.logAdapter.getLog(logId);
  }
}
