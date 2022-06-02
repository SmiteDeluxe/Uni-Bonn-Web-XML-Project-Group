import { AvailableJSONSchema } from './constants';
import GenericValidator from './Validator';

export const DeviceStateValidator = new GenericValidator(
  AvailableJSONSchema.DEVICE_STATE
);
