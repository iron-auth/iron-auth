import { getIronSession } from 'iron-session/edge';
import { getServerSideSession as getServerSideSessionOriginal, parseConfig } from '../src/helpers';
import type { EdgeRequest, IronAuthConfig, Session } from '../types';

/**
 * Get the session data from the request.
 *
 * @param req - The request object.
 * @param config - The Iron Auth configuration.
 * @param env - The environment variables.
 *
 * @returns The session data.
 */
export const getServerSideSession = async (
  req: EdgeRequest,
  config: IronAuthConfig,
  env?: Record<string, string | undefined>,
): Promise<Session> => {
  const parsedConfig = parseConfig(config, env);

  const session = await getIronSession(req, new Response(), parsedConfig.iron);

  return getServerSideSessionOriginal(session);
};
