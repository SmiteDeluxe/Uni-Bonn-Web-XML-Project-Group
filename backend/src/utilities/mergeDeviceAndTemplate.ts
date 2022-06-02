import { DeviceResponse } from '../models/api/DeviceModels';
import DeviceConfig from '../models/config/DeviceConfig';
import TemplateConfig from '../models/config/TemplateConfig';
import Device from '../models/internal/Device';
import { fillAllTemplatePlaceholderStrings } from './fillAllTemplatePlaceholderStrings';

export default function mergeDeviceAndTemplate(
  device: DeviceConfig,
  template: TemplateConfig
): Device {
  const filledTemplate = fillAllTemplatePlaceholderStrings(
    template,
    device.placeholders
  );
  const mergedDevice: DeviceResponse = {
    ...device,
    template: filledTemplate,
  };
  return mergedDevice;
}
