import type { ValidSession } from 'iron-auth/types';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import { AccountBasket } from '@libs/test-utils';
import type { SignUpResponse } from 'iron-auth';
import { basePath, resetPrisma } from '../helpers';
import { ProviderComponent } from './test-components';

suite('React Session Provider', () => {
  const accounts = new AccountBasket();

  beforeAll(async () => {
    vi.clearAllMocks();
    await resetPrisma();
  });

  test('No session passed or loaded returns nothing for session', async () => {
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

  test('Fetch session on load with no session returns null', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        fetchOnLoad
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    expect(screen.queryByTestId('session')).toBeNull();
    expect(await screen.findByTestId('session_loading')).toBeDefined();

    await waitForElementToBeRemoved(() => screen.getByText(/Grabbing Initial Session/));

    await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
    expect(screen.getByTestId('session').textContent).toEqual('null');
  });

  test('Sign in with invalid account returns error', async () => {
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

    fireEvent.click(screen.getByTestId('sign-in_btn'));

    await waitFor(() => expect(screen.queryByTestId('sign-in_error')).not.toBeNull());
    expect(screen.queryByTestId('sign-in_error')?.innerText).toEqual('Invalid credentials');
    expect(screen.queryByTestId('session')).toBeNull();
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

    expect(screen.queryByTestId('session')).toBeNull();

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

  test('Fetch session on load', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        fetchOnLoad
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    expect(screen.queryByTestId('session')).toBeNull();
    expect(await screen.findByTestId('session_loading')).toBeDefined();

    await waitForElementToBeRemoved(() => screen.getByText(/Grabbing Initial Session/));

    await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
    const sessionVal = JSON.parse(screen.getByTestId('session').textContent ?? '') as ValidSession;
    expect(sessionVal.user.email).toEqual(email);
  });

  test('Sign out succeeds and clears session', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        fetchOnLoad
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    expect(screen.queryByTestId('session')).toBeNull();
    expect(await screen.findByTestId('session_loading')).toBeDefined();

    await waitForElementToBeRemoved(() => screen.getByText(/Grabbing Initial Session/));

    await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
    const sessionVal = JSON.parse(screen.getByTestId('session').textContent ?? '') as ValidSession;
    expect(sessionVal.user.email).toEqual(email);

    fireEvent.click(screen.getByTestId('sign-out_btn'));

    expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-out_error')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('session')).not.toBeNull();
    expect(screen.getByTestId('session').textContent).toEqual('null');
    expect(screen.queryByTestId('sign-out_error')).toBeNull();
  });

  test('Sign in succeeds and redirects (per the config)', async () => {
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

    fireEvent.click(screen.getByTestId('sign-in_btn'));

    expect(await screen.findByTestId('sign-in_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-in_error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.getByTestId('sign-in_error').textContent?.includes('/account failed')).toEqual(
      true,
    );
  });

  test('Get session returns current session data', async () => {
    const { email, password } = accounts.get('primary');

    render(
      <ProviderComponent
        basePath={basePath}
        fetchOnLoad
        postArgs={[
          'credentials',
          'email-pass-provider',
          { data: { email, password }, basePath, rejects: true },
        ]}
      />,
    );

    expect(screen.queryByTestId('session')).toBeNull();

    fireEvent.click(screen.getByTestId('get-session_btn'));

    expect(await screen.findByTestId('get-session_loading')).toBeDefined();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('get-session_error')).toBeNull();
    expect(screen.queryByTestId('get-session_response')).not.toBeNull();
    expect(screen.getByTestId('get-session_response').textContent?.includes(email)).toEqual(true);

    expect(screen.queryByTestId('session')).not.toBeNull();
    expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
  });

  test('Sign in with wrong password returns error', async () => {
    const { email } = accounts.get('primary');
    const { password } = accounts.get('secondary');

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

    // sign out to clear the session created by the previous test:

    fireEvent.click(screen.getByTestId('sign-out_btn'));

    expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-out_error')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
    expect(screen.queryByTestId('sign-out_error')).toBeNull();

    // this test's logic:

    expect(screen.queryByTestId('session')).toBeNull();

    fireEvent.click(screen.getByTestId('sign-in_btn'));

    await waitFor(() => expect(screen.queryByTestId('sign-in_error')).not.toBeNull());
    expect(screen.queryByTestId('sign-in_error')?.innerText).toEqual('Invalid credentials');
    expect(screen.queryByTestId('session')).toBeNull();
  });

  test('Sign up fails with an already existing account', async () => {
    const { email } = accounts.get('primary');
    const { password } = accounts.get('secondary');

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

    fireEvent.click(screen.getByTestId('sign-up_btn'));

    expect(await screen.findByTestId('sign-up_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-up_error')).toBeNull();
    expect(screen.queryByTestId('session')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('sign-up_error')).not.toBeNull();

    expect(screen.getByTestId('sign-up_error').textContent?.includes('already exists')).toEqual(
      true,
    );
  });

  test('Sign out fails with no session', async () => {
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

    fireEvent.click(screen.getByTestId('sign-out_btn'));

    expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
    expect(screen.queryByTestId('sign-out_error')).toBeNull();

    await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

    expect(screen.queryByTestId('sign-out_error')).toBeDefined();
    expect(screen.getByTestId('sign-out_error').textContent).toEqual('Session not found');
  });
});
