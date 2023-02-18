import type { ProviderType, ValidSession } from 'iron-auth/types';
import type { SessionProviderProps } from '@iron-auth/react';
import { SessionProvider, useSession } from '@iron-auth/react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import { AccountBasket } from '@libs/test-utils';
import { getSession, signIn, signOut, signUp } from 'iron-auth/methods';
import type { PostAuthMethod } from 'iron-auth/methods/post-auth-method';
import type { WithFetchOptions } from 'iron-auth/methods/fetch-api-data';
import { useState } from 'react';
import type { SignInResponse, SignUpResponse } from 'iron-auth';
import { basePath, resetPrisma } from './helpers';

const SessionComponent = () => {
  const { session } = useSession();

  return <div>{session && <span data-testid="session">{JSON.stringify(session)}</span>}</div>;
};

const SignUpComponent = <T extends ProviderType>({
  postArgs,
}: {
  postArgs: Parameters<PostAuthMethod<T, false>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [response, setResponse] = useState<SignUpResponse | null>(null);

  const doSignUp = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await signUp(...postArgs);
      setResponse(res);

      if (!res) {
        setError('null response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" data-testid="sign-up_btn" onClick={doSignUp}>
        Sign Up
      </button>

      {loading && <span data-testid="sign-up_loading">Loading</span>}
      {error && <span data-testid="sign-up_error">{JSON.stringify(error)}</span>}
      {response && <span data-testid="sign-up_response">{JSON.stringify(response)}</span>}
    </>
  );
};

const SignInComponent = <T extends ProviderType>({
  postArgs,
}: {
  postArgs: Parameters<PostAuthMethod<T, false>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SignInResponse | null>(null);

  const doSignIn = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await signIn(...postArgs);
      setResponse(res);

      if (!res) {
        setError('null response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" data-testid="sign-in_btn" onClick={doSignIn}>
        Sign In
      </button>

      {loading && <span data-testid="sign-in_loading">Loading</span>}
      {error && <span data-testid="sign-in_error">{error}</span>}
      {response && <span data-testid="sign-in_response">{JSON.stringify(response)}</span>}
    </>
  );
};

const ProviderComponent = <T extends ProviderType>({
  postArgs,
  notifyOnSuccess,
  ...props
}: Omit<SessionProviderProps, 'children'> & {
  postArgs: Parameters<PostAuthMethod<T, false>>;
  notifyOnSuccess?: boolean;
}) => {
  const [, , opts] = postArgs;

  return (
    <>
      <SessionProvider {...props}>
        <SessionComponent />
      </SessionProvider>

      <SignInComponent postArgs={postArgs} />

      <SignUpComponent postArgs={postArgs} />

      <button
        type="button"
        data-testid="sign-out"
        onClick={() => signOut(opts as WithFetchOptions<{ data?: never }>)}
      >
        Sign Out
      </button>

      <button
        type="button"
        data-testid="get-session"
        onClick={() =>
          getSession({ ...opts, notifyOnSuccess } as WithFetchOptions<{
            notifyOnSuccess?: boolean;
          }>)
        }
      >
        Get Session
      </button>
    </>
  );
};

suite('React Session Provider', () => {
  const accounts = new AccountBasket();

  beforeAll(async () => {
    vi.clearAllMocks();
    await resetPrisma();
  });

  test('No session returns nothing for session', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign in with no account returns nothing for session', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByTestId('sign-in_btn'));

    expect(screen.queryByTestId('session')).toBeNull();
    await waitFor(() => expect(screen.queryByTestId('sign-in_error')).not.toBeNull());
    expect(screen.queryByTestId('sign-in_error')?.innerText).toEqual('Invalid credentials');
  });

  test('Does not load a new session when one is passed through', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
        // @ts-expect-error - Testing it's passed. structure doesn't matter
        session={{ user: { id: 'Random ID' } }}
      />,
    );

    expect(screen.queryByTestId('session')?.innerText).toEqual(
      JSON.stringify({ user: { id: 'Random ID' } }),
    );
  });

  test('Sign up succeeds and sets the session', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByTestId('sign-up_btn'));

    expect(await screen.findByTestId('sign-up_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-up_error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('sign-up_error')).toBeNull();

    const responseVal = JSON.parse(
      screen.getByTestId('sign-up_response').innerText || '',
    ) as SignUpResponse;
    expect(responseVal.email).toEqual(email);

    await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
    const sessionVal = JSON.parse(screen.getByTestId('session').textContent ?? '') as ValidSession;
    expect(sessionVal.user.email).toEqual(email);
  });

  // test('Sign out succeeds', async () => {
  //   const { email } = accounts.get('primary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignOutComponent />
  //     </SessionProvider>,
  //   );

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(await screen.findByTestId('session')).toBeDefined();
  //   expect(screen.getByTestId('session')).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

  //   await waitForElementToBeRemoved(() => screen.getByText(/Authenticated/));
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();
  // });

  // test('Sign up fails with already existing account', async () => {
  //   const { email, password } = accounts.get('primary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignUpComponent email={email} password={password} />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('authenticated')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(screen.getByTestId('error').textContent).toEqual('"Account already exists"');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();
  // });

  // test('Sign in fails with non-existent account', async () => {
  //   const { email, password } = accounts.get('secondary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignInComponent email={email} password={password} />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('authenticated')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(screen.getByTestId('error').textContent).toEqual('"Invalid credentials"');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();
  // });

  // test('Sign in fails with wrong password', async () => {
  //   const { email } = accounts.get('primary');
  //   const { password } = accounts.get('secondary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignInComponent email={email} password={password} />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('authenticated')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(screen.getByTestId('error').textContent).toEqual('"Invalid credentials"');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();
  // });

  // test('Sign out fails with no session', async () => {
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignOutComponent />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('authenticated')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(screen.getByTestId('error').textContent).toEqual('"Session not found"');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  // });

  // test('Sign in succeeds, sets the session, and redirects', async () => {
  //   const { email, password } = accounts.get('primary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <SignInComponent email={email} password={password} />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
  //   expect(screen.queryByTestId('loading')).toBeNull();
  //   expect(screen.queryByTestId('authenticated')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   expect(await screen.findByText(/Loading/)).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.queryByTestId('session')).toBeNull();

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(screen.getByTestId('error').textContent?.includes('/account failed')).toEqual(true);
  //   // expect(await screen.findByTestId('session')).toBeDefined();
  //   // expect(screen.getByTestId('session')).toBeDefined();
  //   // expect(screen.queryByTestId('error')).toBeNull();
  //   // expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
  // });

  // test('Fetch session returns the current session data', async () => {
  //   const { email } = accounts.get('primary');
  //   render(
  //     <SessionProvider basePath={basePath}>
  //       <FetchSessionComponent />
  //     </SessionProvider>,
  //   );

  //   await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
  //   expect(await screen.findByTestId('session')).toBeDefined();
  //   expect(screen.getByTestId('session')).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

  //   expect(await screen.findByTestId('result')).toBeDefined();
  //   expect(screen.getByTestId('session')).toBeDefined();
  //   expect(screen.queryByTestId('error')).toBeNull();
  //   expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
  //   expect(screen.getByTestId('result').textContent?.includes(email)).toEqual(true);
  //   expect(screen.getByTestId('result').textContent).toEqual(
  //     screen.getByTestId('session').textContent,
  //   );
  // });
});
