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
	}

	public open() {
		window.addEventListener('storage', this.handleStorageEvent);
		document.addEventListener('notify-event-channel-local', this.handleCustomEvent, false);
	}

	public close() {
		window.removeEventListener('storage', this.handleStorageEvent);
		document.removeEventListener('notify-event-channel-local', this.handleCustomEvent, false);
	}

	private handleCustomEvent = (event: Event) => {
		this.handleStorageEvent((event as CustomEvent).detail);
	};

	private handleStorageEvent = (event: StorageEvent) => {
		if (event.key === this.name && typeof event.newValue === 'string') {
			this.receivers.forEach((cb) => cb(JSON.parse(event.newValue ?? '{}')));
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

		// the storage event is only handled in other tabs, not in the current tab, so we need to manually trigger it.
		this.handleStorageEvent(
			new StorageEvent('storage', { key: this.name, newValue: JSON.stringify(event) }),
		);
	};

	public static notify = (event: EventShape, name = defaultChannelName) => {
		localStorage.setItem(name, JSON.stringify(event));

		// the storage event is only handled in other tabs, not in the current tab, so we need to manually trigger it.
		document.dispatchEvent(
			new CustomEvent('notify-event-channel-local', {
				detail: new StorageEvent('storage', { key: name, newValue: JSON.stringify(event) }),
			}),
		);
	};
}
