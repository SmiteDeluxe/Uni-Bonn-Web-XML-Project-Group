import { AvailableJSONSchema } from './constants';
import GenericValidator from './Validator';

export const AutomationCreateValidator = new GenericValidator(
  AvailableJSONSchema.AUTOMATION_CREATE
);
