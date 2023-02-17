import { getIronSession } from 'iron-session';
import { createModifySession } from '../src/utils';
import type { IncomingRequest, LayoutRequest } from '../types';

/**
 * Update the user object in the session.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param config - The Iron Auth configuration.
 * @param data - The data to update in the session's user object.
 * @param props.env - The environment variables.
 * @param props.override - Whether to override the existing session data or merge it.
 *
 * @default props.override = false
 *
 * @returns The updated session data.
 */
export const modifySession = createModifySession<IncomingRequest | LayoutRequest>(getIronSession);
