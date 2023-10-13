import type { ParsedIronAuthConfig } from '../../../types';

export const getIronOptions = (config: ParsedIronAuthConfig) => ({
	...config.cookies.session,
	cookieName: config.cookies.session.name,
	password: config.secrets.ironPassword,
});
