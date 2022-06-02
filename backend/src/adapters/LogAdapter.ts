// bearbeitet von ***
import { readdir, readFile } from 'fs/promises';
import config from '../config';
import Logger from '../utilities/Logger';
import { LogFolderPath } from '../utilities/Logger/types';
import ILogAdapter from './interfaces/ILogAdapter';

export default class LogAdapter implements ILogAdapter {
  private folder: LogFolderPath = config.logger?.folder ?? './logs/';

  async readFileNames(): Promise<string[]> {
    return this.getLogPaths(this.folder);
  }

  // reads out every logfile in given directory and returns the filenames in a list
  async getLogPaths(dirPath: string): Promise<string[]> {
    const directoryContents = readdir(dirPath);
    if (directoryContents === undefined) {
      Logger.warn(`Could not read content of log directory: ${dirPath}`);
      return [];
    }
    return directoryContents;
  }

  // reads out specific log
  async getLog(logId: string): Promise<string> {
    let file = await readFile(this.folder + logId, 'utf-8');
    return file;
  }
}
