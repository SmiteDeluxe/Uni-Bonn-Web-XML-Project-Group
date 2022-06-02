// Bearbeitet von ***
type SINGLE_LEVEL_WILDCARD = '+';
type MULTI_LEVEL_WILDCARD = '#';

type SingleParameterUnion<P extends MqttTopicPattern> =
  P extends `${SINGLE_LEVEL_WILDCARD}${infer Param}/${infer Rest}`
    ? Param | SingleParameterUnion<Rest>
    : P extends `${SINGLE_LEVEL_WILDCARD}${infer Param}`
    ? Param
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    P extends `${infer Prefix}${SINGLE_LEVEL_WILDCARD}${infer Rest}`
    ? SingleParameterUnion<`${SINGLE_LEVEL_WILDCARD}${Rest}`>
    : never;

type MultiParameterUnion<P extends MqttTopicPattern> =
  P extends `${MULTI_LEVEL_WILDCARD}${infer Param}/${infer Rest}`
    ? Param | MultiParameterUnion<Rest>
    : P extends `${MULTI_LEVEL_WILDCARD}${infer Param}`
    ? Param
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    P extends `${infer Prefix}${MULTI_LEVEL_WILDCARD}${infer Rest}`
    ? MultiParameterUnion<`${MULTI_LEVEL_WILDCARD}${Rest}`>
    : never;

/**
 * Generates a typed object with the keys beeing literal types
 * from the arguments of a MQTT pattern and values being of
 * type `string | string[]`
 *
 * @example
 * type Generated = TopicArguments<'some/+test/pattern/#here'>
 * // Is equivalent to
 * type Manual = {
 *  test: string,
 *  here: string[]
 * }
 */
export type TopicParameters<T extends MqttTopicPattern> = {
  [k in
    | SingleParameterUnion<T>
    | MultiParameterUnion<T>]: k extends SingleParameterUnion<T>
    ? string
    : string[];
};

/**
 * Type alias for a MQTT topic
 *
 * @example
 * const topic = 'myhome/groundFloor/kitchen/freezer/temperature'
 */
export type MqttTopic = string;

/**
 * Type alias for a MQTT topic pattern
 * @example
 *
 * const topic = 'myhome/+floor/kitchen/+device/#messages'
 */
export type MqttTopicPattern = string;
