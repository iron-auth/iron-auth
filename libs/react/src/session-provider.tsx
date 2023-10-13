'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { getSession } from 'iron-auth/methods';
import type { EventShape } from 'iron-auth/methods/event-channel';
import { EventChannel } from 'iron-auth/methods/event-channel';
import { fetchDefaults } from 'iron-auth/methods/fetch-api-data';
import type { ValidSession } from 'iron-auth/types';

export type ISessionContext<HasSession extends boolean = false> = {
	loadingInitialSession: boolean;
	session: HasSession extends true ? ValidSession : ValidSession | undefined | null;
};

const SessionContext = createContext<ISessionContext<boolean>>({
	loadingInitialSession: false,
	session: undefined,
});

export const useSession = <HasSession extends boolean = false>() =>
	useContext<ISessionContext<HasSession>>(SessionContext);

type Props = {
	basePath?: string;
	children: React.ReactNode;
	session?: ValidSession | undefined | null;
	fetchOnLoad?: boolean;
	crossTabCommunication?: boolean;
};

/**
 * Session context provider for Iron Auth.
 *
 * @param props.basePath The base path of the API. Defaults to '/api/auth'.
 * @param props.children React children.
 * @param props.fetchOnLoad Whether to fetch the session on load - does not try fetching if a session is passed through. Defaults to false.
 * @param props.crossTabCommunication Whether to listen to cross-tab communication session updates. Defaults to true.
 * @param props.session The session data to use. If not provided, the session will be fetched from the API. Useful for passing in a session retrieved in server side rendering.
 */
export const SessionProvider = ({
	basePath = fetchDefaults.basePath,
	children,
	fetchOnLoad = false,
	crossTabCommunication = true,
	session: pageSession,
}: Props): JSX.Element => {
	const [loadingInitialSession, setLoadingInitialSession] = useState<boolean>(
		pageSession === undefined && fetchOnLoad,
	);
	const [session, setSession] = useState<ValidSession | undefined | null>(pageSession);

	const basePathRef = useRef<string>(basePath);

	const channel = useRef<EventChannel>(new EventChannel());
	const tabState = useRef({
		lastUpdate: pageSession ? Date.now() : 0,
		lastSession: pageSession,
	});

	/*
	 * Helper to fetch the session, update the state, and broadcast the event between tabs.
	 */
	const fetchSession = useCallback(async (fromEvent?: boolean) => {
		const newSession = await getSession({
			basePath: basePathRef.current,
			notifyOnSuccess: !fromEvent,
		});

		if (newSession) {
			setSession(newSession);

			tabState.current.lastUpdate = Date.now();
			tabState.current.lastSession = newSession;

			// we dont need to notify on success here as it will notify in the getSession method.
		} else {
			// TODO: Decide if we should notify on getSession request failure.
			// channel.current.notify({ event: 'no-session' });
		}
	}, []);

	/*
	 * Fetch session initially if no page session is provided.
	 */
	useEffect(() => {
		if (fetchOnLoad && pageSession === undefined && tabState.current.lastSession === undefined) {
			setLoadingInitialSession(true);
			// act as if this is being notified from an event so that we don't accidentally trigger a refetch on first page load.
			fetchSession(true).then(() => {
				setLoadingInitialSession(false);
				if (!tabState.current.lastSession) {
					setSession(null);
				}
			});
		}
	}, [fetchOnLoad, fetchSession, pageSession]);

	/*
	 * Listens for events from the update channel (through local storage) and handle them.
	 */
	useEffect(() => {
		if (!crossTabCommunication) {
			// eslint-disable-next-line no-console
			console.debug('Cross-tab communication for session updates is disabled.');
			return;
		}

		const chan = channel.current;

		const handleEvent = ({ event, userId }: EventShape) => {
			// eslint-disable-next-line no-console
			console.debug('Received cross-tab event:', { event, userId });
			switch (event) {
				case 'session-updated': {
					if (!!userId && tabState.current.lastSession?.user?.id !== userId) {
						fetchSession(true);
					}
					break;
				}
				case 'no-session': {
					if (tabState.current.lastSession) {
						setSession(null);
						tabState.current.lastSession = null;
						tabState.current.lastUpdate = Date.now();
					}
					break;
				}
				case 'sign-in': {
					if (!!userId && tabState.current.lastSession?.user?.id !== userId) {
						fetchSession(true);
					}
					break;
				}
				case 'sign-up': {
					if (!!userId && tabState.current.lastSession?.user?.id !== userId) {
						fetchSession(true);
					}
					break;
				}
				case 'sign-out': {
					if (tabState.current.lastSession) {
						setSession(null);
						tabState.current.lastSession = null;
						tabState.current.lastUpdate = Date.now();
					}
					break;
				}
				default: {
					// do nothing as it is not a valid event.
					// eslint-disable-next-line no-console
					console.debug('Invalid cross-tab event:', event);
				}
			}
		};

		chan.subscribe('session-provider', handleEvent);
		chan.open();

		// eslint-disable-next-line consistent-return
		return () => {
			chan.unsubscribe('session-provider');
			chan.close();
		};
	}, [crossTabCommunication, fetchSession]);

	const value = useMemo(
		() => ({ loadingInitialSession, session }),
		[loadingInitialSession, session],
	);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export type { Props as SessionProviderProps };
