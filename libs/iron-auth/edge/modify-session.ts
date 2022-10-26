import { getIronSession } from 'iron-session/edge';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ModifySessionProps } from '../src/helpers';
import { parseConfig, modifySession as modifySessionOriginal } from '../src/helpers';
import type { EdgeRequest, EdgeResponse, IronAuthConfig, Session } from '../types';

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
export const modifySession = async <Override extends boolean = false>(
  req: NextApiRequest | EdgeRequest,
  res: NextApiResponse | EdgeResponse,
  config: IronAuthConfig,
  data: Override extends true ? Session['user'] : Partial<Session['user']>,
  {
    env,
    override,
  }: ModifySessionProps<Override> & { env?: Record<string, string | undefined> } = {},
): Promise<Session> => {
  const parsedConfig = parseConfig(config, env);

  const session = await getIronSession(req, res, parsedConfig.iron);

  return modifySessionOriginal(session, data, { override });
};
