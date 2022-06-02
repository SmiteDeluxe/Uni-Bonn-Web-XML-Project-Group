// Bearbeitet von ***
import config from '../../config';
import ConfigContent from '../../models/config/ConfigContent';
import parse from '../parse';
import { WatchedFSEmitter } from './WatchedFSEmitter';

class WatchedConfigEmitter extends WatchedFSEmitter<ConfigContent> {
  protected async parser(source: string) {
    return (await parse(source)) as ConfigContent;
  }

  public async getConfig() {
    return await this.parser(this.source);
  }
}

export const watchedConfigEmitter = new WatchedConfigEmitter(
  config.configFile ?? './config/config.yaml'
);