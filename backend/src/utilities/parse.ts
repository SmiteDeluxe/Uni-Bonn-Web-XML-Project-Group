// Bearbeitet von ***

import { readFile } from 'fs/promises';
import { handle } from '.';
import Logger from './Logger';
import { LogLevel } from './Logger/constants';
import YAML from 'yaml';

export enum SerializedData {
  YAML = 'YAML',
  JSON = 'JSON',
}

/**
 * Try asynchronously parsing a YAML file, but fall back on parsing a JSON.
 * Also, provide log messages about any errors that may occur.
 *
 * @param path - Path of the YAML to parse
 * @returns An `Promise` which resolves to a Javascript object if parsing the
 * file was successfull and otherwise resolves to undefined.
 */
export default async function parse(
  path: string,
  parser: SerializedData = SerializedData.YAML
): Promise<unknown> {
  const backupParser = SerializedData.YAML ? 'JSON' : 'YAML';
  const [fileContent, readErr] = await handle(
    readFile(path, { encoding: 'utf-8' })
  );
  if (readErr || !fileContent) {
    Logger.log(
      `Can't parse data from ${path} because on an Error reading the file: ${
        (readErr as Error).message ?? readErr
      }`,
      LogLevel.ERROR
    );
    throw readErr instanceof Error ? readErr : new Error(`${readErr}`);
  }
  try {
    const result =
      parser === SerializedData.YAML
        ? YAML.parse(fileContent)
        : JSON.parse(fileContent);
    return result;
  } catch (parseErr) {
    Logger.warn(
      `Can't parse ${path} as ${parser}: ${
        (parseErr as Error).message ?? parseErr
      }. Trying to parse ${backupParser} instead.`
    );
    try {
      const result = SerializedData.YAML
        ? JSON.parse(fileContent)
        : YAML.parse(fileContent);
      return result;
    } catch (backupErr) {
      Logger.warn(
        `Error parsing ${path} as ${backupParser}: ${
          (backupErr as Error).message ?? backupErr
        }`
      );
      throw new Error(`Can't parse data from content's of "${path}"`);
    }
  }
}
