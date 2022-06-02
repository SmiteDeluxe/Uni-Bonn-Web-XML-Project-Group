import TemplateConfig from '../models/config/TemplateConfig';
import { clone } from './clone';
import Logger from './Logger';
import { fillPlaceholders, PlaceholderString } from './placeholderStringTools';

export function fillAllTemplatePlaceholderStrings(
  template: TemplateConfig,
  placeholderValues: Record<string, string>
) {
  const clonedTemplate = clone(template);
  try {
    for (const action of clonedTemplate.actions) {
      action.topic = fillPlaceholders(
        action.topic as PlaceholderString,
        placeholderValues
      );
    }
    for (const listener of clonedTemplate.listeners) {
      listener.topic = fillPlaceholders(
        listener.topic as PlaceholderString,
        placeholderValues
      );
    }
  } catch (err) {
    const message = `Error filling placeholder strings in template ${clonedTemplate.id}: ${err}`;
    Logger.error(message);
  }
  return clonedTemplate;
}
