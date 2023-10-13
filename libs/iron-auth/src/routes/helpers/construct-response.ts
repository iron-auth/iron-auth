import type { IronAuthResponse } from '../../utils';
import { IronAuthError } from '../../utils';
import type { RouteResponse } from './types';

export const constructRouteResponse = (
	route: IronAuthResponse['routeName'],
	response: RouteResponse,
): IronAuthResponse => {
	if (!response.data) {
		throw new IronAuthError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' });
	}

	if (response.isRedirectUrl) {
		return {
			routeName: route,
			code: 'TEMPORARY_REDIRECT',
			data: response.data,
			redirect: response.data as string,
		};
	}

	return {
		routeName: route,
		code: 'OK',
		data: response.data,
	};
};
