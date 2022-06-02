// Edited by: ***
import { MqttTopic, MqttTopicPattern, TopicParameters } from './types';
import { SEPARATOR, Wildcard } from './constants';

/**
 * Extract parameters from `topic` using the `pattern`. **WARNING:** This
 * function doesn't check wether `topic` matches the `pattern`. To avoid
 * unexpected results, please use {@link parseParameters}.
 *
 * @param topic A MQTT topic the values of the parameters get extracted from
 * @param pattern A MQTT topic pattern providing the template for extracting
 * the parameter values
 *
 * @returns An object mapping the parameter names to the values extracted from the topic
 *
 * @example
 * const result = extractParameters(
 *   'john/goes/to/his/home',
 *   '+person/journeys/to/#destination'
 * );
 * console.log(result);
 * // { person: 'john', destination: [ 'his', 'home' ] }
 */
export function extractParameters<P extends MqttTopicPattern>(
  topic: MqttTopic,
  pattern: P
): TopicParameters<P> {
  const params: Record<string, string | string[]> = {};
  const patternLevels = pattern.split(SEPARATOR);
  const topicLevels = topic.split(SEPARATOR);

  const patternLength = patternLevels.length;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternLevels[i];
    const patternChar = currentPattern[0];

    if (currentPattern.length === 1) continue;

    if (patternChar === Wildcard.MULTI) {
      params[currentPattern.slice(1)] = topicLevels.slice(i);
      break;
    } else if (patternChar === Wildcard.SINGLE) {
      params[currentPattern.slice(1)] = topicLevels[i];
    }
  }

  return params as TopicParameters<P>;
}
