// Bearbeitet von *** & ***
import { appendFile } from 'fs/promises';
import fs from 'fs';
import { DateTime } from 'luxon';
import getEnumKeyByValue from '../getEnumKeyByValue';
import { LogLevel, LogMode } from './constants';
import config from '../../config';
import { LogFolderPath, LogFileSuffix } from './types';

export class Logger {
  private static level: LogLevel = config.logger?.level ?? LogLevel.INFO;
  private static mode: LogMode = config.logger?.mode ?? LogMode.CONSOLE;
  private static folder: LogFolderPath = config.logger?.folder ?? './logs/';
  private static suffix: LogFileSuffix =
    config.logger?.suffix ?? 'mqtt-backend.log';

  public static log(message: string, messageLevel: LogLevel = LogLevel.INFO) {
    // If the application is run in silent mode, do nothing.
    if (Logger.mode === LogMode.SILENT) return;
    // If the message log level is below the application log level, do nothing
    if (messageLevel < Logger.level) return;

    const now = DateTime.now();
    const formattedMessage = this.formatMessage(now, message, messageLevel);

    if (
      Logger.mode === LogMode.CONSOLE ||
      Logger.mode === LogMode.CONSOLE_AND_FILE
    ) {
      console.log(formattedMessage);
    }

    try {
      if (!fs.existsSync(Logger.folder)) {
        fs.mkdirSync(Logger.folder);
      }

      appendFile(
        `${Logger.folder}${DateTime.now().toISODate()}-${Logger.suffix}`,
        formattedMessage + '\r\n'
      );
    } catch (e) {
      if (e instanceof Error) {
        console.log(
          Logger.formatMessage(DateTime.now(), e.message, LogLevel.ERROR)
        );
      } else {
        console.log(
          Logger.formatMessage(DateTime.now(), String(e), LogLevel.ERROR)
        );
      }
    }
  }

  public static trace(message: string) {
    this.log(message, LogLevel.TRACE);
  }

  public static debug(message: string) {
    this.log(message, LogLevel.DEBUG);
  }

  public static info(message: string) {
    this.log(message, LogLevel.INFO);
  }

  public static warn(message: string) {
    this.log(message, LogLevel.WARN);
  }

  public static error(message: string) {
    this.log(message, LogLevel.ERROR);
  }

  public static fatal(message: string) {
    this.log(message, LogLevel.FATAL);
  }

  private static formatMessage(
    now: DateTime,
    message: string,
    messageLevel: LogLevel
  ) {
    return `${now.toISO()} - ${Logger.getLogLevelKey(
      messageLevel
    )} - ${message}`;
  }

  private static getLogLevelKey(level: number) {
    return getEnumKeyByValue(LogLevel, level);
  }
}
