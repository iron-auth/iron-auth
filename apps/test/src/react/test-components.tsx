import type { SessionProviderProps } from '@iron-auth/react';
import { SessionProvider, useSession } from '@iron-auth/react';
import type { SignUpResponse, SignInResponse, SignOutResponse } from 'iron-auth';
import { getSession, signIn, signOut, signUp } from 'iron-auth/methods';
import type { WithFetchOptions } from 'iron-auth/methods/fetch-api-data';
import type { GetAuthMethod } from 'iron-auth/methods/get-auth-method';
import type { PostAuthMethod } from 'iron-auth/methods/post-auth-method';
import type { ProviderType, ValidSession } from 'iron-auth/types';
import { useState } from 'react';

export const SessionComponent = () => {
	const { loadingInitialSession, session } = useSession();

	return (
		<div>
			{loadingInitialSession && <span data-testid="session_loading">Grabbing Initial Session</span>}
			{session !== undefined && <span data-testid="session">{JSON.stringify(session)}</span>}
		</div>
	);
};

export const SignUpComponent = <T extends ProviderType>({
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

export const SignInComponent = <T extends ProviderType>({
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

export const SignOutComponent = <T extends ProviderType>({
	postArgs,
}: {
	postArgs: Parameters<PostAuthMethod<T, true>>;
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [response, setResponse] = useState<SignOutResponse | null>(null);

	const doSignOut = async () => {
		setLoading(true);
		setError(null);
		setResponse(null);

		try {
			const res = await signOut(...postArgs);
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
			<button type="button" data-testid="sign-out_btn" onClick={doSignOut}>
				Sign Out
			</button>

			{loading && <span data-testid="sign-out_loading">Loading</span>}
			{error && <span data-testid="sign-out_error">{error}</span>}
			{response && <span data-testid="sign-out_response">{JSON.stringify(response)}</span>}
		</>
	);
};

export const GetSessionComponent = <T extends ProviderType>({
	postArgs,
}: {
	postArgs: Parameters<
		GetAuthMethod<
			T,
			{
				notifyOnSuccess?: boolean;
			}
		>
	>;
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [response, setResponse] = useState<ValidSession | null>(null);

	const doGetSession = async () => {
		setLoading(true);
		setError(null);
		setResponse(null);

		try {
			const res = await getSession(...postArgs);
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
			<button type="button" data-testid="get-session_btn" onClick={doGetSession}>
				Get Session
			</button>

			{loading && <span data-testid="get-session_loading">Loading</span>}
			{error && <span data-testid="get-session_error">{error}</span>}
			{response && <span data-testid="get-session_response">{JSON.stringify(response)}</span>}
		</>
	);
};

export const ProviderComponent = <T extends ProviderType>({
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

			<SignOutComponent postArgs={[opts as WithFetchOptions<{ data?: never }>]} />

			<GetSessionComponent
				postArgs={[
					{ ...opts, notifyOnSuccess } as WithFetchOptions<{
						notifyOnSuccess?: boolean;
					}>,
				]}
			/>
		</>
	);
};
