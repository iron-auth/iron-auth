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
import type {
  CredentialsPreCheckResponse,
  SigninResponse,
  SignupResponse,
  LinkAccountResponse,
} from '../src';
import { fetchApiData } from '../src/helpers';
import type { ProviderType, Session } from '../types';

export type ISessionContext<DefinedSession extends boolean = false> = {
  authenticated: boolean;
  clearError: () => void;
  error: string | undefined;
  /**
   * Fetch a user's session.
   *
   * @param props.rejects - Whether the promise should reject on an error. By default, it sets the error state but does not throw the error.
   *
   * @returns The user's session, or null if no response was received.
   */
  fetchSession: (props?: FetchSessionProps) => Promise<Session | null>;
  /**
   * Link a new account to an existing user account.
   *
   * For providers that require account information, like with credentials providers, the relevant information should also be provided.
   *
   * @param props.type - The type of provider to link.
   * @param props.provider - The ID of the provider.
   * @param props.data - Optional data to send to the provider. This is useful for providers that require you to post the newly linked account's information to them, like credentials providers.
   * @param props.rejects - Whether the promise should reject on an error. By default, it sets the error state but does not throw the error.
   *
   * @returns The link account response from the provider, or null if no response was received.
   */
  linkAccount: <T extends ProviderType>(
    props: LinkAccountProps<T>,
  ) => Promise<LinkAccountResponse | null>;
  loading: boolean;
  loadingInitial: boolean;
  session: DefinedSession extends true ? Session : Session | undefined | null;
  /**
   * Sign in with a specific provider that is activated in your Iron Auth options.
   *
   * For providers that require account information, like with credentials providers, the relevant information should also be provided.
   *
   * @param props.type - The type of provider to sign in with.
   * @param props.provider - The ID of the provider.
   * @param props.data - Optional data to send to the provider. This is useful for providers that require you to post the sign in information to them, like credentials providers.
   * @param props.rejects - Whether the promise should reject on an error. By default, it sets the error state but does not throw the error.
   *
   * @returns The sign in response from the provider, or null if no response was received.
   */
  signIn: <T extends ProviderType>(props: SigninProps<T>) => Promise<SigninResponse | null>;
  /**
   * Sign up with a specific provider that is activated in your Iron Auth options.
   *
   * For providers that require account information, like with credentials providers, the relevant information should also be provided.
   *
   * @param props.type - The type of provider to sign up with.
   * @param props.provider - The ID of the provider.
   * @param props.data - Optional data to send to the provider. This is useful for providers that require you to post the registration information to them, like credentials providers.
   * @param props.rejects - Whether the promise should reject on an error. By default, it sets the error state but does not throw the error.
   *
   * @returns The sign up response from the provider, or null if no response was received.
   */
  signUp: <T extends ProviderType>(props: SignupProps<T>) => Promise<SignupResponse | null>;
  /**
   * Sign a user out and destroy the session.
   *
   * @param props.rejects - Whether the promise should reject on an error. By default, it sets the error state but does not throw the error.
   *
   * @returns A boolean indicating whether the session was destroyed and the user was signed out.
   */
  signOut: (props?: SignoutProps) => Promise<boolean>;
};

const SessionContext = createContext<ISessionContext<boolean>>({
  authenticated: false,

  /**
   * Clear the error state.
   */
  clearError: () => {},
  error: undefined,
  fetchSession: async () => null,
  linkAccount: async () => null,
  loading: true,
  loadingInitial: true,
  session: undefined,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => false,
});

export const useSession = <DefinedSession extends boolean = false>() =>
  useContext<ISessionContext<DefinedSession>>(SessionContext);

type Props = {
  basePath?: string;
  children: React.ReactNode;
  session?: Session | undefined | null;
};

/**
 * Session provider for Iron Auth.
 *
 * @param props.basePath - The base path of the API. Defaults to '/api/auth'.
 * @param props.children - React children.
 * @param props.session - The session data to use. If not provided, the session will be fetched from the API. Useful for passing in a session retrieved in server side rendering.
 */
export const SessionProvider = ({
  basePath = '/api/auth',
  children,
  session: pageSession,
}: Props): JSX.Element => {
  const [authenticated, setAuthenticated] = useState<boolean>(!!pageSession);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!pageSession);
  const [session, setSession] = useState<Session | undefined | null>(pageSession);

  const [loadingInitial, setLoadingInitial] = useState<boolean>(!pageSession);

  const basePathRef = useRef<string>(basePath);

  const clearError = useCallback(() => setError(undefined), []);

  /**
   * Fetch a CSRF token to use for post requests.
   *
   * Throws an error if the request fails.
   *
   * @returns A new CSRF token.
   */
  const fetchCsrfToken = useCallback(async () => {
    return fetchApiData<string>('/csrf', undefined, {
      basePath: basePathRef.current,
      name: 'csrf token',
    })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }, []);

  const fetchSession = useCallback(async ({ initial, rejects }: FetchSessionProps = {}) => {
    setError(undefined);
    setLoading(true);

    if (initial) {
      setLoadingInitial(true);
    }

    return fetchApiData<Session>('/session', undefined, {
      basePath: basePathRef.current,
      name: 'session',
    })
      .then((data) => {
        setAuthenticated(true);
        setSession(data);
        return data;
      })
      .catch((err) => {
        setAuthenticated(false);
        setSession(null);

        if (!(initial && err === 'Session not found')) {
          setError(err);
          if (rejects) throw new Error(err);
          else return null;
        } else return null;
      })
      .finally(() => {
        setLoading(false);

        if (initial) {
          setLoadingInitial(false);
        }
      });
  }, []);

  // Fetch session initially if no page session is provided
  useEffect(() => {
    if (typeof pageSession === 'undefined') {
      fetchSession({ initial: true });
    }
  }, [fetchSession, pageSession]);

  const signIn = useCallback(
    async <T extends ProviderType>({ type, provider, data, rejects }: SigninProps<T>) => {
      setError(undefined);
      setLoading(true);

      const params = new URLSearchParams({ type, providerId: provider });
      let csrfToken: string | undefined;

      try {
        csrfToken = await fetchCsrfToken();
      } catch (err) {
        setError(err as string);
        setLoading(false);
        if (rejects) throw new Error(err as string);
        return null;
      }

      return fetchApiData<SigninResponse>(
        `/signin?${params.toString()}`,
        {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...data, csrfToken }),
        },
        {
          basePath: basePathRef.current,
          name: 'signin',
        },
      )
        .then((respData) => {
          setAuthenticated(true);
          setSession({ user: respData });
          return respData;
        })
        .catch((err) => {
          setAuthenticated(false);
          setSession(null);
          setError(err);
          if (rejects) throw new Error(err);
          else return null;
        })
        .finally(() => setLoading(false));
    },
    [fetchCsrfToken],
  );

  const signUp = useCallback(
    async <T extends ProviderType>({ type, provider, data, rejects }: SignupProps<T>) => {
      setError(undefined);
      setLoading(true);

      const params = new URLSearchParams({ type, providerId: provider });
      let csrfToken: string | undefined;

      try {
        csrfToken = await fetchCsrfToken();
      } catch (err) {
        setError(err as string);
        setLoading(false);
        if (rejects) throw new Error(err as string);
        return null;
      }

      return fetchApiData<SigninResponse>(
        `/signup?${params.toString()}`,
        {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...data, csrfToken }),
        },
        {
          basePath: basePathRef.current,
          name: 'signup',
        },
      )
        .then((respData) => {
          setAuthenticated(true);
          setSession({ user: respData });
          return respData;
        })
        .catch((err) => {
          setAuthenticated(false);
          setSession(null);
          setError(err);
          if (rejects) throw new Error(err);
          else return null;
        })
        .finally(() => setLoading(false));
    },
    [fetchCsrfToken],
  );

  const linkAccount = useCallback(
    async <T extends ProviderType>({ type, provider, data, rejects }: LinkAccountProps<T>) => {
      setError(undefined);
      setLoading(true);

      const params = new URLSearchParams({ type, providerId: provider });
      let csrfToken: string | undefined;

      try {
        csrfToken = await fetchCsrfToken();
      } catch (err) {
        setError(err as string);
        setLoading(false);
        if (rejects) throw new Error(err as string);
        return null;
      }

      return fetchApiData<LinkAccountResponse>(
        `/linkaccount?${params.toString()}`,
        {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ...data, csrfToken }),
        },
        {
          basePath: basePathRef.current,
          name: 'link account',
        },
      )
        .then((respData) => {
          return respData;
        })
        .catch((err) => {
          setError(err);
          if (rejects) throw new Error(err);
          else return null;
        })
        .finally(() => setLoading(false));
    },
    [fetchCsrfToken],
  );

  const signOut = useCallback(
    async ({ rejects }: SignoutProps = {}) => {
      setError(undefined);
      setLoading(true);

      let csrfToken: string | undefined;

      try {
        csrfToken = await fetchCsrfToken();
      } catch (err) {
        setError(err as string);
        setLoading(false);
        if (rejects) throw new Error(err as string);
        return false;
      }

      return fetchApiData<boolean>(
        `/signout`,
        {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ csrfToken }),
        },
        {
          basePath: basePathRef.current,
          name: 'signout',
        },
      )
        .then((respData) => {
          setAuthenticated(false);
          setSession(null);
          return respData;
        })
        .catch((err) => {
          setAuthenticated(false);
          setSession(null);
          setError(err);
          if (rejects) throw new Error(err);
          else return false;
        })
        .finally(() => setLoading(false));
    },
    [fetchCsrfToken],
  );

  const value = useMemo(
    () => ({
      authenticated,
      clearError,
      error,
      fetchSession,
      linkAccount,
      loading,
      loadingInitial,
      session,
      signIn,
      signUp,
      signOut,
    }),
    [
      authenticated,
      clearError,
      error,
      fetchSession,
      linkAccount,
      loading,
      loadingInitial,
      session,
      signIn,
      signOut,
      signUp,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

type SigninProps<T extends ProviderType> = {
  type: T;
  provider: string;
  rejects?: boolean;
} & (T extends 'credentials' ? { data: CredentialsPreCheckResponse } : { data?: never });

type SignupProps<T extends ProviderType> = SigninProps<T>;
type SignoutProps = { rejects?: boolean };
type LinkAccountProps<T extends ProviderType> = SigninProps<T>;

type FetchSessionProps = {
  rejects?: boolean;
  initial?: boolean;
};

export type { Props as SessionProviderProps };
