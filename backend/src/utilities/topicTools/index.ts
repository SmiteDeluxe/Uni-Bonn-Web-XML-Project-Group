// Bearbeitet von ***
import { MqttTopicPattern, MqttTopic, TopicParameters } from './types';
export { MqttTopicPattern, MqttTopic, TopicParameters };

const SEPARATOR = '/';
const SINGLE = '+';
const ALL = '#';

export function exec<P extends MqttTopicPattern>(
  pattern: P,
  topic: MqttTopic
): TopicParameters<P> | null {
  return matches(pattern, topic) ? extract(pattern as P, topic) : null;
}

export function matches(pattern: MqttTopicPattern, topic: MqttTopic) {
  const patternSegments = pattern.split(SEPARATOR);
  const topicSegments = topic.split(SEPARATOR);

  const patternLength = patternSegments.length;
  const topicLength = topicSegments.length;
  const lastIndex = patternLength - 1;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];
    const currentTopic = topicSegments[i];

    if (!currentTopic && !currentPattern) continue;

    if (!currentTopic && currentPattern !== ALL) return false;

    // Only allow # at end
    if (patternChar === ALL) return i === lastIndex;
    if (patternChar !== SINGLE && currentPattern !== currentTopic) return false;
  }

  return patternLength === topicLength;
}

export function fill<P extends MqttTopicPattern>(
  pattern: P,
  params: TopicParameters<P>
): MqttTopic {
  const patternSegments = pattern.split(SEPARATOR);
  const patternLength = patternSegments.length;
  const result: string[] = [];

  const tParams = params as Record<string, string | string[]>;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];
    const patternParam = currentPattern.slice(1);
    const paramValue = tParams[patternParam];

    if (patternChar === ALL) {
      // Check that it isn't undefined
      if (paramValue !== undefined) {
        if (typeof paramValue === 'string') {
          result.push(paramValue);
        } else {
          result.push(paramValue.join(SEPARATOR));
        }
      }
      // Since # wildcards are always at the end, break out of the loop
      break;
    } else if (patternChar === SINGLE) {
      // Coerce param into a string, missing params will be undefined
      result.push(String(paramValue));
    } else {
      result.push(currentPattern);
    }
  }

  return result.join(SEPARATOR);
}

export function extract<P extends MqttTopicPattern>(
  pattern: P,
  topic: MqttTopic
): TopicParameters<P> {
  const params: Record<string, string | string[]> = {};
  const patternSegments = pattern.split(SEPARATOR);
  const topicSegments = topic.split(SEPARATOR);

  const patternLength = patternSegments.length;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];

    if (currentPattern.length === 1) continue;

    if (patternChar === ALL) {
      params[currentPattern.slice(1)] = topicSegments.slice(i);
      break;
    } else if (patternChar === SINGLE) {
      params[currentPattern.slice(1)] = topicSegments[i];
    }
  }

  return params as TopicParameters<P>;
}

export function clean(pattern: MqttTopicPattern): MqttTopic {
  const patternSegments = pattern.split(SEPARATOR);
  const patternLength = patternSegments.length;

  const cleanedSegments: string[] = [];

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];

    if (patternChar === ALL) {
      cleanedSegments.push(ALL);
    } else if (patternChar === SINGLE) {
      cleanedSegments.push(SINGLE);
    } else {
      cleanedSegments.push(currentPattern);
    }
  }

  return cleanedSegments.join('/');
}
