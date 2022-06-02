// Bearbeitet von ***
import { PlaceholderString, PlaceholderValues } from './types';

export function fillPlaceholders<S extends PlaceholderString>(
  placeholderString: S,
  placeholderValues: PlaceholderValues<S> | undefined
) {
  if (placeholderValues === undefined) return placeholderString;
  let result = '';
  let captureId = false;
  let currentId = '';
  for (let i = 0; i < placeholderString.length; i++) {
    const previousChar = i - 1 >= 0 ? placeholderString[i - 1] : undefined;
    const currentChar = placeholderString[i];
    const nextChar =
      i + 1 < placeholderString.length ? placeholderString[i + 1] : undefined;

    if (captureId) {
      if (currentChar === '}') {
        result +=
          (placeholderValues as Record<string, string>)[currentId] ??
          `\${${currentId}}`;
        captureId = false;
        currentId = '';
      } else if (nextChar === undefined) {
        result += `\${${currentId}`;
      } else {
        currentId = currentId.concat(currentChar);
      }
      continue;
    }
    if (currentChar === '{' && previousChar === '$') {
      captureId = true;
      continue;
    }
    if (currentChar === '$') {
      continue;
    }
    result += currentChar;
  }
  return result;
}
