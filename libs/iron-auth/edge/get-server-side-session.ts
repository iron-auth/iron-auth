import { getIronSession } from 'iron-session/edge';
import { createGsss } from '../src/utils';
import type { EdgeRequest, LayoutRequest } from '../types';

/**
 * Get the session data from the request.
 *
 * @param req - The request object.
 * @param config - The Iron Auth configuration.
 * @param env - The environment variables.
 * @returns The session data.
 */
export const getServerSideSession = createGsss<EdgeRequest | LayoutRequest>(getIronSession);
