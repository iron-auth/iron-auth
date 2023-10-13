import type { ParsedIronAuthConfig } from '../../types';
import type { IronAuthResponse } from '../utils';
import { IronAuthError } from '../utils';

/**
 * @param data Data for callback
 * @param val Callback or string
 * @returns Relative URL to redirect to
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cbResp = (_url: string, data: unknown, val: string | ((data: any) => string)) => {
	const value = typeof val === 'function' ? val(data) : val;
	// If redirect is not relative, return to `/` to avoid open redirects.
	// TODO: Should have some way to support whitelisted external urls.
	return !value.startsWith('/') ? '/' : value;
};

const joinParams = (url: string, params: URLSearchParams) => `${url}?${params.toString()}`;

export const processCallback = (
	config: ParsedIronAuthConfig,
	data: IronAuthError | IronAuthResponse,
): IronAuthResponse => {
	const { redirects } = config;

	if (data instanceof IronAuthError) {
		if (redirects?.error) {
			const params = new URLSearchParams({
				error: data.code,
				message: data.message,
			});

			const url = joinParams(cbResp(config.url, data, redirects.error), params);

			return {
				routeName: 'unknown',
				code: 'TEMPORARY_REDIRECT',
				data: url,
				redirect: url,
			};
		}

		return {
			routeName: 'unknown',
			code: data.code,
			data: data.message,
			err: data,
		};
	}

	if (data.redirect) {
		return data;
	}

	// check if there is a redirect in the config to use for this route
	const redirectFromConfig = redirects?.[data.routeName as keyof typeof redirects];

	if (redirectFromConfig) {
		return {
			routeName: data.routeName,
			code: 'TEMPORARY_REDIRECT',
			data: data.data,
			redirect: cbResp(config.url, data.data, redirectFromConfig),
		};
	}

	return data;
};
