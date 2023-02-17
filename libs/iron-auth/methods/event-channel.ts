import type { ValidSession } from '../types';

export type EventTypes = 'sign-in' | 'sign-up' | 'sign-out' | 'session-updated' | 'no-session';
export type EventShape = { event: EventTypes; userId?: ValidSession['user']['id'] };

const defaultChannelName = 'iron-auth.update';

/*
 * This is a custom version of a broadcast channel as the browser support is only around ~93.8%, while the storage API event is around ~96.8%.
 *
 * The storage API is used to communicate between tabs.
 */
export class EventChannel {
  private receivers: Map<string, (event: EventShape) => void>;

  private name: string;

  constructor(name = defaultChannelName) {
    this.name = name;
    this.receivers = new Map<string, (event: EventShape) => void>();

    window.addEventListener('storage', this.handleStorageEvent);
  }

  public close() {
    window.removeEventListener('storage', this.handleStorageEvent);
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === this.name && !!event.newValue) {
      this.receivers.forEach((cb) => cb(JSON.parse(event.newValue as string)));
    }
  };

  public subscribe = (key: string, cb: (ev: EventShape) => void) => {
    this.receivers.set(key, cb);
  };

  public unsubscribe = (key: string) => {
    this.receivers.delete(key);
  };

  public notify = (event: EventShape) => {
    localStorage.setItem(this.name, JSON.stringify(event));
  };

  public static notify = (event: EventShape, name = defaultChannelName) => {
    localStorage.setItem(name, JSON.stringify(event));
  };
}
