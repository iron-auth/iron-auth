import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountBasket, apiUrl, mockApi } from '@libs/test-utils';
import type { SignUpResponse } from 'iron-auth';
import type { EventTypes } from 'iron-auth/methods/event-channel';
import { EventChannel } from 'iron-auth/methods/event-channel';
import type { ValidSession } from 'iron-auth/types';
import { afterAll, beforeAll, expect, suite, test, vi } from 'vitest';

import { ProviderComponent } from './test-components';

suite('React Session Provider', async () => {
	const basePath = apiUrl;
	const accounts = new AccountBasket();

	const server = await mockApi();

	const mockedConsoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => null);

	beforeAll(() => server.start());
	afterAll(() => {
		server.stop();
		mockedConsoleDebug.mockRestore();
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
		const user = userEvent.setup();

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

		await act(() => user.click(screen.getByTestId('sign-in_btn')));

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
		const user = userEvent.setup();

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

		await user.click(screen.getByTestId('sign-up_btn'));

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
		const user = userEvent.setup();

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

		await user.click(screen.getByTestId('sign-out_btn'));

		expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
		expect(screen.queryByTestId('sign-out_error')).toBeNull();

		await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

		expect(screen.queryByTestId('session')).not.toBeNull();
		expect(screen.getByTestId('session').textContent).toEqual('null');
		expect(screen.queryByTestId('sign-out_error')).toBeNull();
	});

	test('Sign in succeeds and redirects (per the config)', async () => {
		const { email, password } = accounts.get('primary');
		const user = userEvent.setup();

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

		const locationReplaceMock = vi.spyOn(window.location, 'replace').mockImplementation(() => null);

		await user.click(screen.getByTestId('sign-in_btn'));

		expect(await screen.findByTestId('sign-in_loading')).toBeDefined();
		expect(screen.queryByTestId('sign-in_error')).toBeNull();
		expect(screen.queryByTestId('session')).toBeNull();

		await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

		expect(locationReplaceMock).toHaveBeenCalled();
		locationReplaceMock.mockRestore();
	});

	test('Get session returns current session data', async () => {
		const { email, password } = accounts.get('primary');
		const user = userEvent.setup();

		render(
			<ProviderComponent
				basePath={basePath}
				fetchOnLoad={false}
				postArgs={[
					'credentials',
					'email-pass-provider',
					{ data: { email, password }, basePath, rejects: true },
				]}
				notifyOnSuccess
			/>,
		);

		expect(screen.queryByTestId('session')).toBeNull();

		await user.click(screen.getByTestId('get-session_btn'));

		expect(await screen.findByTestId('get-session_loading')).toBeDefined();
		await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

		expect(screen.queryByTestId('get-session_error')).toBeNull();
		expect(screen.queryByTestId('get-session_response')).not.toBeNull();
		expect(screen.getByTestId('get-session_response').textContent?.includes(email)).toEqual(true);

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Received cross-tab event:', {
			event: 'session-updated',
			userId: 1,
		});

		await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
		expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);
	});

	test('Simulate cross-tab events', async () => {
		const { email, password } = accounts.get('primary');

		render(
			<ProviderComponent
				basePath={basePath}
				fetchOnLoad={false}
				postArgs={[
					'credentials',
					'email-pass-provider',
					{ data: { email, password }, basePath, rejects: true },
				]}
			/>,
		);

		expect(screen.queryByTestId('session')).toBeNull();

		// simulate sign in from another tab:
		act(() => {
			EventChannel.notify({ event: 'sign-in', userId: 1 });
		});

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Received cross-tab event:', {
			event: 'sign-in',
			userId: 1,
		});

		await waitFor(() => expect(screen.queryByTestId('session')).not.toBeNull());
		expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

		// simulate sign out from another tab:
		act(() => {
			EventChannel.notify({ event: 'sign-out' });
		});

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Received cross-tab event:', {
			event: 'sign-out',
		});

		expect(screen.queryByTestId('session')?.textContent).toEqual(JSON.stringify(null));

		// simulate sign up from another tab:
		act(() => {
			EventChannel.notify({ event: 'sign-up', userId: 1 });
		});

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Received cross-tab event:', {
			event: 'sign-up',
			userId: 1,
		});

		await waitFor(() =>
			expect(screen.queryByTestId('session')?.textContent).not.toEqual(JSON.stringify(null)),
		);
		expect(screen.getByTestId('session').textContent?.includes(email)).toEqual(true);

		// simulate no session from another tab:
		act(() => {
			EventChannel.notify({ event: 'no-session' });
		});

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Received cross-tab event:', {
			event: 'no-session',
		});

		expect(screen.queryByTestId('session')?.textContent).toEqual(JSON.stringify(null));

		// simulate invalid event from another tab:
		EventChannel.notify({ event: 'invalid-event' as EventTypes });

		expect(mockedConsoleDebug).toHaveBeenLastCalledWith('Invalid cross-tab event: invalid-event');
	});

	test('Sign in with wrong password returns error', async () => {
		const { email } = accounts.get('primary');
		const { password } = accounts.get('secondary');
		const user = userEvent.setup();

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

		await user.click(screen.getByTestId('sign-out_btn'));

		expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
		expect(screen.queryByTestId('sign-out_error')).toBeNull();

		await waitForElementToBeRemoved(() => screen.getByText(/Loading/));
		expect(screen.queryByTestId('sign-out_error')).toBeNull();

		// this test's logic:

		expect(screen.queryByTestId('session')).toBeNull();

		await user.click(screen.getByTestId('sign-in_btn'));

		await waitFor(() => expect(screen.queryByTestId('sign-in_error')).not.toBeNull());
		expect(screen.queryByTestId('sign-in_error')?.innerText).toEqual('Invalid credentials');
		expect(screen.queryByTestId('session')).toBeNull();
	});

	test('Sign up fails with an already existing account', async () => {
		const { email } = accounts.get('primary');
		const { password } = accounts.get('secondary');
		const user = userEvent.setup();

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

		await user.click(screen.getByTestId('sign-up_btn'));

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
		const user = userEvent.setup();

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

		await user.click(screen.getByTestId('sign-out_btn'));

		expect(await screen.findByTestId('sign-out_loading')).toBeDefined();
		expect(screen.queryByTestId('sign-out_error')).toBeNull();

		await waitForElementToBeRemoved(() => screen.getByText(/Loading/));

		expect(screen.queryByTestId('sign-out_error')).toBeDefined();
		expect(screen.getByTestId('sign-out_error').textContent).toEqual('Session not found');
	});

	test('Session provider renders with default base path', async () => {
		const { email, password } = accounts.get('primary');

		render(
			<ProviderComponent
				fetchOnLoad={false}
				postArgs={[
					'credentials',
					'email-pass-provider',
					{ data: { email, password }, basePath, rejects: true },
				]}
			/>,
		);

		expect(screen.queryByTestId('session')).toBeNull();
	});
});
