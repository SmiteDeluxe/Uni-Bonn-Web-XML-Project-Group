import DeviceConfig from '../config/DeviceConfig';
import TemplateConfig from '../config/TemplateConfig';

export default interface Device extends Omit<DeviceConfig, 'template'> {
  template: TemplateConfig;
}
