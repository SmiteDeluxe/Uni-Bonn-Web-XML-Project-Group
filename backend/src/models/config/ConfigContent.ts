import DeviceConfig from './DeviceConfig';
import GroupConfig from './GroupConfig';
import AutomationConfig from './AutomationConfig';
import UserConfig from './UserConfig';

export default interface ConfigContent {
  devices?: DeviceConfig[];
  groups?: GroupConfig[];
  automations?: AutomationConfig[];
  users?: UserConfig[];
}
