import type { Routes } from '../helpers';
import { csrfRoute } from './csrf';
import { sessionRoute } from './session';

// all of our routes for `GET` requests
export const routes = {
	session: ({ session }) => sessionRoute(session),
	csrf: ({ req, res, config }) => csrfRoute(req, res, config),
} satisfies Routes;
