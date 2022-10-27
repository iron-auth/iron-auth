import { getIronSession } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { LayoutRequest } from '../src/helpers';
import { getServerSideSession as getServerSideSessionOriginal, parseConfig } from '../src/helpers';
import type { IronAuthConfig, Session } from '../types';

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
