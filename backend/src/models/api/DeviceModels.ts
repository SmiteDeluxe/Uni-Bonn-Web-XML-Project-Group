import DeviceConfig from '../config/DeviceConfig';
import TemplateConfig from '../config/TemplateConfig';

export interface DeviceResponse extends Omit<DeviceConfig, 'template'> {
  template: TemplateConfig;
}

export type DeviceUpdate = DeviceConfig;
export type DeviceCreate = DeviceConfig;
