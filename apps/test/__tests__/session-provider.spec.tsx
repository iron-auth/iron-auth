import { useEffect, useState } from 'react';
import type { Session } from 'iron-auth/types';
import { SessionProvider, useSession } from '@iron-auth/react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import { AccountBasket, basePath, resetPrisma } from './helpers';

const GeneralComponent = () => {
  const { session, loading, error, authenticated } = useSession();

  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{JSON.stringify(error)}</span>}
      {authenticated && <span data-testid="authenticated">Authenticated</span>}
      {session && <span data-testid="session">{JSON.stringify(session)}</span>}
    </div>
  );
};

const SignUpComponent = (data: { email: string; password: string }) => {
  const { session, loading, error, authenticated, signUp } = useSession();

  useEffect(() => {
    const timeout = setTimeout(() => {
      signUp({ type: 'credentials', provider: 'email-pass-provider', data });
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [data, signUp]);

  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{JSON.stringify(error)}</span>}
      {authenticated && <span data-testid="authenticated">Authenticated</span>}
      {session && <span data-testid="session">{JSON.stringify(session)}</span>}
    </div>
  );
};

const SignInComponent = (data: { email: string; password: string }) => {
  const { session, loading, error, authenticated, signIn } = useSession();

  useEffect(() => {
    const timeout = setTimeout(() => {
      signIn({ type: 'credentials', provider: 'email-pass-provider', data });
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [data, signIn]);

  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{JSON.stringify(error)}</span>}
      {authenticated && <span data-testid="authenticated">Authenticated</span>}
      {session && <span data-testid="session">{JSON.stringify(session)}</span>}
    </div>
  );
};

const SignOutComponent = () => {
  const { session, loading, error, authenticated, signOut } = useSession();

  useEffect(() => {
    const timeout = setTimeout(() => {
      signOut();
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [signOut]);

  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{JSON.stringify(error)}</span>}
      {authenticated && <span data-testid="authenticated">Authenticated</span>}
      {session && <span data-testid="session">{JSON.stringify(session)}</span>}
    </div>
  );
};

const FetchSessionComponent = () => {
  const { session, loading, error, authenticated, fetchSession } = useSession();

  const [result, setResult] = useState<Session | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const res = await fetchSession();

      setResult(res);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [fetchSession]);

  return (
    <div>
      {loading && <span data-testid="loading">Loading</span>}
      {error && <span data-testid="error">{JSON.stringify(error)}</span>}
      {authenticated && <span data-testid="authenticated">Authenticated</span>}
      {session && <span data-testid="session">{JSON.stringify(session)}</span>}
      {result && <span data-testid="result">{JSON.stringify(result)}</span>}
    </div>
  );
};

suite('React Session Provider', () => {
  const accounts = new AccountBasket();

  beforeAll(async () => {
    vi.clearAllMocks();
    await resetPrisma();
  });

  test('No session returns session not found', async () => {
    render(
      <SessionProvider basePath={basePath}>
        <GeneralComponent />
      </SessionProvider>,
    );

    expect(screen.getByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('loading')).toBeNull();
    // expect(screen.getByTestId('error').textContent).toEqual('"Session not found"');
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Does not load a new session when one is passed through', async () => {
    render(
      // @ts-expect-error - not necessary to put all info for testing purposes.
      <SessionProvider session={{ user: { id: 'Random ID' } }} basePath={basePath}>
        <GeneralComponent />
      </SessionProvider>,
    );

    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByText(/Authenticated/)).toBeDefined();
    expect(screen.queryByText(/Random ID/)).toBeDefined();
  });

  test('Sign up succeeds and sets the session', async () => {
    const { email, password } = accounts.get('primary');
    render(
      <SessionProvider basePath={basePath}>
        <SignUpComponent email={email} password={password} />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(await screen.findByTestId('session')).toBeDefined();
    expect(screen.getByTestId('session')).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
  });

  test('Sign out succeeds', async () => {
    const { email } = accounts.get('primary');
    render(
      <SessionProvider basePath={basePath}>
        <SignOutComponent />
      </SessionProvider>,
    );

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(await screen.findByTestId('session')).toBeDefined();
    expect(screen.getByTestId('session')).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

    await waitForElementToBeRemoved(() => screen.getByText(/Authenticated/));
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign up fails with already existing account', async () => {
    const { email, password } = accounts.get('primary');
    render(
      <SessionProvider basePath={basePath}>
        <SignUpComponent email={email} password={password} />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.getByTestId('error').textContent).toEqual('"Account already exists"');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign in fails with non-existent account', async () => {
    const { email, password } = accounts.get('secondary');
    render(
      <SessionProvider basePath={basePath}>
        <SignInComponent email={email} password={password} />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.getByTestId('error').textContent).toEqual('"Invalid credentials"');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign in fails with wrong password', async () => {
    const { email } = accounts.get('primary');
    const { password } = accounts.get('secondary');
    render(
      <SessionProvider basePath={basePath}>
        <SignInComponent email={email} password={password} />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.getByTestId('error').textContent).toEqual('"Invalid credentials"');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign out fails with no session', async () => {
    render(
      <SessionProvider basePath={basePath}>
        <SignOutComponent />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.getByTestId('error').textContent).toEqual('"Session not found"');
    expect(screen.queryByTestId('loading')).toBeNull();
  });

  test('Sign in succeeds, sets the session, and redirects', async () => {
    const { email, password } = accounts.get('primary');
    render(
      <SessionProvider basePath={basePath}>
        <SignInComponent email={email} password={password} />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    // expect(screen.getByTestId('error').textContent).toEqual('Session not found');
    expect(screen.queryByTestId('loading')).toBeNull();
    expect(screen.queryByTestId('authenticated')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    expect(await screen.findByText(/Loading/)).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.getByTestId('error').textContent?.includes('/account failed')).toEqual(true);
    // expect(await screen.findByTestId('session')).toBeDefined();
    // expect(screen.getByTestId('session')).toBeDefined();
    // expect(screen.queryByTestId('error')).toBeNull();
    // expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
  });

  test('Fetch session returns the current session data', async () => {
    const { email } = accounts.get('primary');
    render(
      <SessionProvider basePath={basePath}>
        <FetchSessionComponent />
      </SessionProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(await screen.findByTestId('session')).toBeDefined();
    expect(screen.getByTestId('session')).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

    expect(await screen.findByTestId('result')).toBeDefined();
    expect(screen.getByTestId('session')).toBeDefined();
    expect(screen.queryByTestId('error')).toBeNull();
    expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
    expect(screen.getByTestId('result').textContent?.includes(email)).toEqual(true);
    expect(screen.getByTestId('result').textContent).toEqual(
      screen.getByTestId('session').textContent,
    );
  });
});
