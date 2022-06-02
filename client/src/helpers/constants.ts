// Edited by: *** ***
/**
 * MQTT Wildcards:
 *
 *  - `#` As **multi level wildcard**, for more info see [this article on HiveMQ](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/#multi-level-35)
 *  - `+` As **single level wildcard**, for more info see [this article on HiveMQ](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/#single-level-)
 */
export enum Wildcard {
  MULTI = '#',
  SINGLE = '+',
}

/**
 * `/` Seperates levels of a MQTT topic
 */
export const SEPARATOR = '/';
