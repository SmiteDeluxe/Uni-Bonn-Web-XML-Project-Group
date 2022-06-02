import { AvailableJSONSchema } from './constants';
import GenericValidator from './Validator';

export const AutomationUpdateValidator = new GenericValidator(
  AvailableJSONSchema.AUTOMATION_UPDATE
);
