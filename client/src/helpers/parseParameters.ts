// Edited by: ***
import { MqttTopic, MqttTopicPattern, TopicParameters } from './types';
import { extractParameters } from './extractParameters';
import { matchesPattern } from './matchesPattern';

/**
 * Parse parameters from `topic` using the `pattern`.
 *
 * @param topic A MQTT topic the values of the parameters get extracted from
 * @param pattern A MQTT topic pattern providing the template for extracting
 * the parameter values
 *
 * @returns If the `topic` matches the `pattern`, return an object mapping the
 * parameter names specified in the `pattern` to the values extracted from the
 * `topic`, otherwise return `null`
 *
 * @example
 * const result = parseParameters(
 *   'john/goes/to/his/home',
 *   '+person/journeys/to/#destination'
 * );
 * console.log(result);
 * // { person: 'john', destination: [ 'his', 'home' ] }
 */
export function parseParameters<P extends MqttTopicPattern>(
  topic: MqttTopic,
  pattern: P
): TopicParameters<P> | null {
  return matchesPattern(topic, pattern)
    ? extractParameters(topic, pattern)
    : null;
}
