// Bearbeitet von ***

import GenericValidator from './Validator';
import { AvailableJSONSchema } from './constants';

export const TemplateValidator = new GenericValidator(
  AvailableJSONSchema.TEMPLATE
);
