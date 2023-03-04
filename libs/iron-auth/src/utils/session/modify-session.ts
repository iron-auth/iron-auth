import { getIronSession } from 'iron-session/edge';
import type { IncomingRequest, IronAuthConfig, Session } from '../../../types';
import { parseConfig } from '../config';
import { getIronOptions } from '../encryption';
import { IronAuthError } from '../iron-auth-error';

type Args<Override extends boolean> = {
  override?: Override;
};

// TODO: Need edge runtime tests to check that this actually modifies the session cookie or not.
// TODO: Change args.

/**
 * Update the user object in the session.
 *
 * @param req - The request object.
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
  req: IncomingRequest,
  config: IronAuthConfig,
  data: Override extends true ? Session['user'] : Partial<Session['user']>,
  { env, override }: Args<Override> & { env?: Record<string, string | undefined> } = {},
): Promise<Response> => {
  const parsedConfig = parseConfig(config, env);

  const internalResponse = new Response();

  const session = await getIronSession(req, internalResponse, getIronOptions(parsedConfig));

  if (session && session.user) {
    // eslint-disable-next-line no-param-reassign
    session.user = override ? (data as Session['user']) : { ...session.user, ...data };
    await session.save();

    return internalResponse;
  }

  throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
};

export type { Args as ModifySessionArgs };
