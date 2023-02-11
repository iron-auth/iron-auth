import { getIronSession } from 'iron-session';
import { createGsss } from '../src/helpers';
import type { IncomingRequest } from '../types';

/**
 * Get the session data from the request.
 *
 * @param req The request object.
 * @param config The Iron Auth configuration.
 * @param env The environment variables.
 * @returns The session data.
 */
export const getServerSideSession = createGsss<IncomingRequest>(getIronSession);
