import chokidar from 'chokidar';
import { Stats } from 'fs';
import { stat } from 'fs/promises';
import { GenericEmitter, handle } from '..';
import Logger from '../Logger';
import { ValidationError } from '../validation/Validator';

export abstract class WatchedFSEmitter<T> extends GenericEmitter<{
  initialData: T;
  updatedData: T;
  data: T;
  error: Error | ValidationError;
}> {
  private watcher: chokidar.FSWatcher;
  public ready: Promise<void>;

  protected abstract parser(path: string): Promise<T>;

  constructor(
    protected source: string,
    private watchOptions?: chokidar.WatchOptions
  ) {
    super();
    this.ready = this.init();
    this.watcher = chokidar.watch(this.source, this.watchOptions);
    this.watcher.on('all', async () => {
      const [data, parseErr] = await handle<T>(this.parser(this.source));
      if (parseErr || data === undefined) {
        if (
          !(parseErr instanceof Error) ||
          !(parseErr instanceof ValidationError)
        ) {
          this.emit('error', new Error(`${parseErr}`));
        } else {
          this.emit('error', parseErr);
        }
      } else {
        Logger.trace(`WatchedFSEmitter registered update on watched file "${this.source}" emitting "updatedData" event now`)
        this.emit('updatedData', data);
        this.emit('data', data);
      }
    });
  }

  private async init() {
    const [sourceStats, readErr] = await handle<Stats>(stat(this.source));
    if (readErr || sourceStats === undefined) {
      const message = `Error getting stats of ${this.source}: ${
        readErr instanceof Error ? readErr.message : readErr
      }`;
      Logger.fatal(message);
      throw new Error(message);
    }
    const data = await this.parser(this.source);
    Logger.trace(
      `WatchedFSEmitter finished parsing "${this.source}", emitting "initialData" event now`
    );
    this.emit('initialData', data);
    this.emit('data', data);
  }
}
