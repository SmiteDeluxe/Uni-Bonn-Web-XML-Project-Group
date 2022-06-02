// Bearbeitet von *** & ***
import MQTT from 'async-mqtt';
import config from './config';
import ConfigService from './services/ConfigService';
import MongoAdapter from './adapters/MongoAdapter';
import StateService from './services/StateService';
import { StateController } from './controllers/StateController';
import { Schema } from 'mongoose';
import { StateHandler } from './handlers/StateHandler';
import StateCacheService from './services/StateCacheService';
import { DeviceController } from './controllers/DeviceController';
import { GroupController } from './controllers/GroupController';
import YamlAdapter from './adapters/YamlAdapter';
import TemplateAdapter from './adapters/TemplateAdapter';
import { AutomationService } from './services/AutomationService';
import BroadcastController from './controllers/BroadcastController';
import StatsAdapter from './adapters/StatsAdapter';
import StatsController from './controllers/StatsController';
import LogAdapter from './adapters/LogAdapter';
import LogService from './services/LogService';
import LogController from './controllers/LogController';
import StatsService from './services/StatsService';
import { UserController } from './controllers/UserController';
import { ConfigCategory } from './models/internal/ConfigCategory';
import { AutomationController } from './controllers/AutomationController';
import { TemplateController } from './controllers/TemplateController';

export const client = MQTT.connect(
  `tcp://${config.broker.host}:${config.broker.port}`,
  config.broker.clientOptions
);

client.setMaxListeners(200);
let deviceAdapter;
let groupAdapter;
let automationAdapter;

/* 
  if u want to use mongodb change config property storageMedium in mongo
  
  connectionurl is specified in property mognoPath at config file

  the default is yaml 
*/
if (config.storageMedium == 'mongo') {
  const schemaDevice = new Schema({
    id: String,
    name: String,
    icon: String,
    groups: Array,
    template: String,
    placeholders: Object,
    metadata: {},
  });

  schemaDevice.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  });

  deviceAdapter = new MongoAdapter<ConfigCategory.DEVICES>(
    schemaDevice,
    'device'
  );

  const schemaGroup = new Schema({
    name: String,
    icon: String,
    type: String,
    id: String,
  });

  schemaGroup.set('toJSON', {
    virtuals: false,
    versionKey: false,
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  });

  groupAdapter = new MongoAdapter<ConfigCategory.GROUPS>(schemaGroup, 'group');

  const schemaAuto = new Schema({
    name: String,
    id: String,
    active: Boolean,
    startDate: String,
    endDate: String,
    actions: Array,
  });

  schemaAuto.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  });

  automationAdapter = new MongoAdapter<ConfigCategory.AUTOMATIONS>(
    schemaAuto,
    'automation'
  );
} else {
  deviceAdapter = new YamlAdapter(ConfigCategory.DEVICES);
  groupAdapter = new YamlAdapter(ConfigCategory.GROUPS);
  automationAdapter = new YamlAdapter(ConfigCategory.AUTOMATIONS);
}

const userAdapter = new YamlAdapter(ConfigCategory.USERS);

const statsAdapter = new StatsAdapter();
const templateAdapter = new TemplateAdapter();
const broadcastController = new BroadcastController(client);
const statsService = new StatsService(statsAdapter);
const connection = new ConfigService(
  deviceAdapter,
  groupAdapter,
  userAdapter,
  automationAdapter,
  templateAdapter,
  broadcastController,
  statsService
);

const groupController = new GroupController(connection, client);

const statsController = new StatsController(client, statsService);
const stateCacheService = StateCacheService.getInstance(
  statsService,
  broadcastController
);

const stateHandler = new StateHandler(
  client,
  connection,
  stateCacheService,
  connection
);

const deviceController = new DeviceController(
  connection,
  client,
  stateCacheService
);

const stateService = StateService.getInstance(
  stateCacheService,
  connection,
  broadcastController,
  stateHandler
);

const stateController = new StateController(client, stateService);
const userController = new UserController(connection, client);
const automationController = new AutomationController(connection, client);
const templateController = new TemplateController(connection, client);

templateController.start();
userController.start();
stateHandler.start();
stateController.start();
deviceController.start();
automationController.start();
groupController.start();
statsController.start();

const automationService = new AutomationService(connection, client);
automationService.start();

const logAdapter = new LogAdapter();
const logService = new LogService(logAdapter);
const logController = new LogController(client, logService);

logController.start();

setTimeout(() => {
  if (process.connected) {
    console.log('Server started!');
  }
}, 1000);
