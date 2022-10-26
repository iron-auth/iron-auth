import { getIronSession } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';
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
  req: NextApiRequest,
  res: NextApiResponse,
  config: IronAuthConfig,
): Promise<Session> => {
  const parsedConfig = parseConfig(config, process.env);

  const session = await getIronSession(req, res, parsedConfig.iron);

  return getServerSideSessionOriginal(session);
};
