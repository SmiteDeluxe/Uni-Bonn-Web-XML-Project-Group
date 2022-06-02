// bearbeitet von ***

import IStatsAdapter from './interfaces/IStatsAdapter';
import fs from 'fs';
import config from '../config';
import { appendFile, readdir, readFile } from 'fs/promises';
import { DateTime } from 'luxon';
import { Logger } from '../utilities/Logger/Logger';

export default class StatsAdapter implements IStatsAdapter {
  folder: string = config.stats?.folder ?? './stats/';
  currentDate: string = `${DateTime.now().toISODate()}`;
  defaultFile: string = `${this.folder}${this.currentDate}-0.csv`;
  file?: string;
  fileSizeInMB: number = config.stats?.fileSize ?? 0.1;

  async update(deviceId: string, object: any): Promise<void> {
    // sets new date
    if (this.currentDate != `${DateTime.now().toISODate()}`) {
      this.updateDefaultFile();
    }

    // if directory doesnt exist -> create one
    if (!fs.existsSync(this.folder)) {
      fs.mkdirSync(this.folder);
    }

    // if file doesnt exist -> create one
    if (!fs.existsSync(this.defaultFile)) {
      await appendFile(this.defaultFile, 'datetime,deviceId,inputId,value');
    }

    const fileSizeInMB =
      fs.statSync(this.file ?? this.defaultFile).size / (1024 * 1024);

    // if size of file is increasing max filesize -> create new file
    if (fileSizeInMB > this.fileSizeInMB) {
      await this.createNewFile(this.file ?? this.defaultFile);
    }

    await appendFile(
      this.file ?? this.defaultFile,
      '\n' + this.convertJsonToCsv(object, deviceId)
    );
  }

  /* 
    converts an object into csv format

    { inputId: 'turn', value: 'on' } -> 2022-03-19T11:43:55.121+01:00,901244bd-52f2-487b-8e15-81b1256888cf,turn,on
  */
  convertJsonToCsv(object: any, deviceId: string): string {
    let returnString = `${DateTime.now()},${deviceId},`;
    Object.keys(object).forEach((property: any, index: number) => {
      if (index == 0) {
        returnString += object[property];
      } else {
        returnString += ',' + object[property];
      }
    });
    return returnString;
  }

  async read(entries: number): Promise<string> {
    // if no file exists -> create one
    if (!fs.existsSync(this.defaultFile)) {
      await appendFile(this.defaultFile, 'datetime,deviceId,inputId,value');
    }

    let file = await readFile(this.file ?? this.defaultFile, 'utf-8');
    let fileArray = file.split('\n');

    // if entries are higher than filelenght -> readout all files of the day
    if (entries < fileArray.length) {
      return fileArray.slice(-entries).join('\n');
    } else {
      fileArray = await this.readByDay(DateTime.now().toISODate().toString());
      return fileArray.slice(-entries).join('\n');
    }
  }

  async readByTimeIntervall(
    day: string,
    start: string,
    end: string
  ): Promise<string> {
    // if no file exists -> create one
    if (!fs.existsSync(this.defaultFile)) {
      await appendFile(this.defaultFile, 'datetime,deviceId,inputId,value');
    }

    let statsOfDay = await this.readByDay(day);
    let entry: any;
    let returnEntries: any = [];

    // filter the entries by given timeinterval
    for (let stat of statsOfDay) {
      entry = stat.split(',');
      if (
        DateTime.fromISO(entry[0]) >
          DateTime.fromISO(new Date(start).toISOString()) &&
        DateTime.fromISO(entry[0]) <
          DateTime.fromISO(new Date(end).toISOString())
      ) {
        returnEntries.push(entry);
      }
    }
    return returnEntries.join('\n');
  }

  async readByDay(day: string): Promise<string[]> {
    // if no file exists -> create one
    if (!fs.existsSync(this.defaultFile)) {
      await appendFile(this.defaultFile, 'datetime,deviceId,inputId,value');
    }

    const directoryContents = await readdir(this.folder);

    if (directoryContents === undefined) {
      Logger.warn(`Could not read content of log directory: ${this.folder}`);
      return [];
    }

    // reads out all files from the given day
    const files = directoryContents.filter((value: string) => {
      return value.includes(DateTime.fromJSDate(new Date(day)).toISODate());
    });

    let dayStats: string[] = [];
    let fileArray: any = [];
    for (let file of files) {
      fileArray = (await readFile(this.folder + file, 'binary'))
        .split('\n')
        .slice(1);
      dayStats = dayStats.concat(fileArray);
    }

    return dayStats;
  }

  private async createNewFile(filePath: string): Promise<void> {
    let counter = 1;
    let count = true;

    while (count) {
      if (
        !fs.existsSync(
          `${this.folder}${DateTime.now().toISODate()}-${counter}.csv`
        )
      ) {
        this.file = `${
          this.folder
        }${DateTime.now().toISODate()}-${counter}.csv`;
        await appendFile(this.file, 'datetime,deviceId,inputId,value');
        count = false;
      }

      counter++;
    }
  }

  private updateDefaultFile() {
    this.defaultFile = `${this.folder}${DateTime.now().toISODate()}-0.csv`;
  }
}
