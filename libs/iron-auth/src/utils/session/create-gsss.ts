import type { getIronSession } from 'iron-session/edge';
import type { IncomingRequest, IronAuthConfig, LayoutRequest, ValidSession } from '../../../types';
import { parseConfig } from '../config';
import { isValidSession } from './is-valid';

/**
 * Create a new getServerSideSession function.
 *
 * @param _getIronSession - getIronSession function to use.
 * @returns The getServerSideSession function to use.
 */
export const createGsss = <Req extends IncomingRequest | LayoutRequest = IncomingRequest>(
  _getIronSession: typeof getIronSession,
) => {
  return async (
    req: Req,
    config: IronAuthConfig,
    env?: Record<string, string | undefined>,
  ): Promise<ValidSession> => {
    const parsedConfig = parseConfig(config, env);

    const session = await _getIronSession(
      req as IncomingRequest,
      new Response(),
      parsedConfig.iron,
    );

    return isValidSession(session);
  };
};
