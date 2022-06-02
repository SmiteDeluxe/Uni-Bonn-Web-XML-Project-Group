// Bearbeitet von *** & ***
import 'dotenv/config';
import BackendConfig from './models/internal/BackendConfig';
import { LogLevel, LogMode } from './utilities/Logger/constants';

const env = process.env.NODE_ENV as string;
const storageMedium = 'yaml';

if (env === undefined)
  throw new Error(
    'No NODE_ENV defined. Please `export NODE_ENV=[environment]` in your shell before executing this program'
  );

const dev: BackendConfig = {
  configFile: './config/config.yaml',
  templateDir: './templates',
  reloadConfigFileOnChange: true,
  storageMedium: storageMedium,
  mongoPath: 'mongodb://localhost:27017/projektgruppe',
  broker: {
    host: process.env.DEV_BROKER_HOST || 'localhost',
    port: parseInt(process.env.DEV_BROKER_PORT as string) || 1883,
    clientOptions: {
      keepalive: 1000,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 4000,
      clientId: 'mqttjs_node_' + Math.random().toString(16).substr(2, 8),
      // username: 'mosquitto', //process.env.DEV_BROKER_USERNAME as string,
      //password: 'test', //process.env.DEV_BROKER_PASSWORD as string
    },
  },
  logger: {
    level: LogLevel.TRACE,
    mode: LogMode.CONSOLE_AND_FILE,
    folder: './logs/',
    suffix: 'mqtt-backend.log',
  },
  stats: {
    folder: './stats/',
    file: 'statusStats.csv',
    fileSize: 0.1, //in mb
  },
  state: {
    timeout: 500, //in ms
  },
};

const production: BackendConfig = {
  configFile: (process.env.CONFIG_FILE as string) ?? './config/config.yaml',
  templateDir: (process.env.TEMPLATE_FOLDER as string) ?? './templates',
  reloadConfigFileOnChange: false,
  storageMedium: storageMedium,
  mongoPath: 'mongodb://localhost:27017/projektgruppe',
  broker: {
    host: process.env.BROKER_HOST ?? 'localhost',
    port: parseInt(process.env.BROKER_PORT as string) || 1883,
    clientOptions: {
      keepalive: 1000,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 4000,
      clientId: 'mqttjs_node_' + Math.random().toString(16).substr(2, 8),
      username: (process.env.BROKER_USERNAME as string) ?? undefined,
      password: (process.env.BROKER_PASSWORD as string) ?? undefined,
    },
  },
  logger: {
    level: LogLevel.INFO,
    mode: LogMode.CONSOLE_AND_FILE,
    folder: (process.env.LOG_FOLDER as `${string}/`) ?? './logs/',
    suffix: (process.env.LOG_SUFFIX as `${string}.log`) ?? 'mqtt-backend.log',
  },
  stats: {
    folder: (process.env.STATS_FOLDER as string) ?? './stats/',
    file: (process.env.STATS_FILE as string) ?? 'statusStats.csv',
    fileSize: parseFloat(process.env.STAT_MAX_FILESIZE as string) || 0.1,
  },
  state: {
    timeout: parseFloat(process.env.OFFLINE_DETECTION_TIMEOUT as string) || 500,
  },
};

const configs: {
  [key: string]: BackendConfig;
} = {
  dev,
  production,
};

export default configs[env];
