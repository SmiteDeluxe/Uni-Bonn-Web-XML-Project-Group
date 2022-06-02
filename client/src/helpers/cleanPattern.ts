// Edited by: *** ***
import { MqttTopic, MqttTopicPattern } from './types';
import { SEPARATOR } from './constants';
import { Wildcard } from './constants';

/**
 * Removes parameter names from `pattern` and thus create a MQTT topic which
 * can be subscribed to.
 *
 * **WARNING:** This function does not check wether the resulting topic is a
 * a valid topic conforming to the MQTT specification. It merely removes
 * parameter names.
 *
 * @param pattern A MQTT topic pattern.
 *
 * @returns A MQTT topic to which a MQTT client can subscribe to
 *
 * @example
 * const result = cleanPattern('+person/journeys/to/#destination');
 * console.log(result); // +/journeys/to/#
 */
export function cleanPattern(pattern: MqttTopicPattern): MqttTopic {
  const patternLevels = pattern.split(SEPARATOR);
  const patternLength = patternLevels.length;

  const cleanedLevels = [];

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternLevels[i];
    const patternChar = currentPattern[0];

    if (patternChar === Wildcard.MULTI) {
      cleanedLevels.push(Wildcard.MULTI);
    } else if (patternChar === Wildcard.SINGLE) {
      cleanedLevels.push(Wildcard.SINGLE);
    } else {
      cleanedLevels.push(currentPattern);
    }
  }

  return cleanedLevels.join('/');
}
