// Bearbeitet von ***
import EventEmitter from 'events';
import { EventMap, EventKey, EventReceiver, Emitter } from './types';

/**
 * Generic base class to create classes which conform to the {@link Emitter}
 * interface based on the node EventEmitter implementation.
 */
export class GenericEmitter<T extends EventMap> implements Emitter<T> {
  private emitter = new EventEmitter();

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.on(eventName, fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.off(eventName, fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
    this.emitter.emit(eventName, params);
  }
}
