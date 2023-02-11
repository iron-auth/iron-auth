import { createGsss } from '@iron-auth/core/src/helpers';
import type { LayoutRequest } from '@iron-auth/core/types';
import { getIronSession } from 'iron-session';
import type { NextApiRequest } from 'next';

/**
 * Get the session data from the request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param config - The Iron Auth configuration.
 * @returns The session data.
 */
export const getServerSideSession = createGsss<NextApiRequest | LayoutRequest>(getIronSession);
