// Edited by: ***
import { MqttTopicPattern, TopicParameters, MqttTopic } from './types';
import { SEPARATOR, Wildcard } from './constants';

/**
 * Fills parameter values in place of named wildcards in the pattern
 *
 * @param params An object mapping the parameter names specified in the `pattern`
 * to values which will be filled in the respective locations of the pattern
 * @param pattern A MQTT topic pattern.
 * @returns A MQTT topic to which does not contain any wildcards
 *
 * @example
 * const result = fillPattern(
 *   {
 *     person: 'john',
 *     destination: ['his', 'home'],
 *   },
 *   '+person/goes/to/#destination'
 * );
 * console.log(result); // john/goes/to/his/home
 */
export function fillPattern<P extends MqttTopicPattern>(
  params: TopicParameters<P>,
  pattern: P
): MqttTopic {
  const patternLevels = pattern.split(SEPARATOR);
  const patternLength = patternLevels.length;

  const result = [];

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternLevels[i];
    const patternChar = currentPattern[0];
    const patternParam = currentPattern.slice(1);
    const paramValue = (params as Record<string, string | string[]>)[
      patternParam
    ];

    if (patternChar === Wildcard.MULTI) {
      // Check that it isn't undefined
      if (paramValue !== undefined)
        result.push(([] as string[]).concat(paramValue).join(SEPARATOR));
      // # wildcards are always at the end, hence:
      break;
    } else if (patternChar === Wildcard.SINGLE) {
      // Coerce param into a string, missing params will be undefined
      result.push('' + paramValue);
    } else {
      result.push(currentPattern);
    }
  }
  return result.join(SEPARATOR);
}
