import type { LayoutRequest } from '@iron-auth/core/src/helpers';
import {
  getServerSideSession as getServerSideSessionOriginal,
  parseConfig,
} from '@iron-auth/core/src/helpers';
import type { IronAuthConfig, Session } from '@iron-auth/core/types';
import { getIronSession } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Get the session data from the request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param config - The Iron Auth configuration.
 *
 * @returns The session data.
 */
export const getServerSideSession = async (
  req: NextApiRequest | LayoutRequest,
  res: NextApiResponse,
  config: IronAuthConfig,
): Promise<Session> => {
  const parsedConfig = parseConfig(config, process.env);

  const session = await getIronSession(req as NextApiRequest, res, parsedConfig.iron);

  return getServerSideSessionOriginal(session);
};
