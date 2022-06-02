import Automation from './Automation';
import { ConfigCategory } from './ConfigCategory';
import Device from './Device';
import Group from './Group';
import User from './User';

export type ConfigType<C extends ConfigCategory> =
  C extends ConfigCategory.DEVICES
    ? Device
    : C extends ConfigCategory.GROUPS
    ? Group
    : C extends ConfigCategory.USERS
    ? User
    : C extends ConfigCategory.AUTOMATIONS
    ? Automation
    : never;
