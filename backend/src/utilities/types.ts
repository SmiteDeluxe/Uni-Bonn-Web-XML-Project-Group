// Bearbeitet von ***

/**
 * Maps the event of an {@link Emitter} to the type of the emitted data
 *
 * @example
 * interface SomeEventMap {
 *  foo: string;
 * }
 * // Will emit a `string` on event 'foo'
 * const fooEmitter: Emitter<SomeEventMap> = new EventEmitter();
 * fooEmitter.on('foo', str => { console.log(typeof str) })
 */
export type EventMap = Record<string, any>;

/**
 * Key of an {@link EventMap}
 */
export type EventKey<T extends EventMap> = string & keyof T;

/**
 * A callback function which get's registered using the `on` method of an {@link Emitter}
 */
export type EventReceiver<T> = (params: T) => void;

/**
 * Define typesafe Emitters using an {@link EventMap}.
 *
 * @example
 * interface SomeEventMap {
 *  foo: string;
 * }
 * // Will emit a `string` on event 'foo'
 * const fooEmitter: Emitter<SomeEventMap> = new EventEmitter();
 * fooEmitter.on('foo', str => { console.log(typeof str) })
 */
export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}
