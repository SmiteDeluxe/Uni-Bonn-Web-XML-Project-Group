// Edited by: ***
import { MqttTopic, MqttTopicPattern } from './types';
import { SEPARATOR, Wildcard } from './constants';

/**
 * Check if `topic` matches the `pattern`.
 *
 * @param topic A MQTT topic
 * @param pattern  A MQTT topic pattern optionally containing (named) wildcards
 * @returns `true` if the topic matches the `pattern`, else `false`
 */
export function matchesPattern(
  topic: MqttTopic,
  pattern: MqttTopicPattern
): boolean {
  const patternLevels = pattern.split(SEPARATOR);
  const topicLevels = topic.split(SEPARATOR);

  const patternLength = patternLevels.length;
  const topicLength = topicLevels.length;
  const lastIndex = patternLength - 1;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternLevels[i];
    const patternChar = currentPattern[0];
    const currentTopic = topicLevels[i];

    if (!currentTopic && !currentPattern) continue;

    if (!currentTopic && currentPattern !== Wildcard.MULTI) return false;

    // Only allow # at the end of the pattern
    if (patternChar === Wildcard.MULTI) return i === lastIndex;
    if (patternChar !== Wildcard.SINGLE && currentPattern !== currentTopic)
      return false;
  }

  return patternLength === topicLength;
}
