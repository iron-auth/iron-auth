import type { IncomingResponse, InternalRequest, ParsedIronAuthConfig } from '../../../types';
import { hash, setCookie } from '../../utils';

export const callbackRoute = async (
	_req: InternalRequest,
	res: IncomingResponse,
	config: ParsedIronAuthConfig,
) => {
	// Generate a random string to use as a CSRF token
	const csrfToken = crypto.randomUUID().replace(/-/g, '');

	const hashed = await hash(`${csrfToken}${config.secrets.csrf}`);
	const token = `${csrfToken}_${hashed}`;

	setCookie(res, { name: config.cookies.csrf.name, value: token }, config.cookies.csrf);

	return { data: csrfToken };
};
