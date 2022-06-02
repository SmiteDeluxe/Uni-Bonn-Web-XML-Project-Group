// Bearbeitet von *** & ***
import { IClientOptions } from 'async-mqtt';
import { LogLevel, LogMode } from '../../utilities/Logger/constants';
import { LogFolderPath, LogFileSuffix } from '../../utilities/Logger/types';

export default interface BackendConfig {
  broker: {
    host: string;
    port: number;
    clientOptions: IClientOptions;
  };
  storageMedium: string;
  mongoPath: string;
  logger?: {
    level?: LogLevel;
    mode?: LogMode;
    folder?: LogFolderPath;
    suffix?: LogFileSuffix;
  };
  jsonSchemaDir?: string;
  templateDir: string;
  configFile?: string;
  reloadConfigFileOnChange?: boolean;
  debugValidation?: boolean;
  stats?: {
    folder: string;
    file: string;
    fileSize: number;
  };
  state?: {
    timeout: number;
  };
}
