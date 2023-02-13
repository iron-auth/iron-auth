import type { getIronSession } from 'iron-session/edge';
import type {
  IncomingRequest,
  IncomingResponse,
  IronAuthConfig,
  LayoutRequest,
  Session,
} from '../../../types';
import { parseConfig } from '../config';
import { IronAuthError } from '../iron-auth-error';

type Props<Override extends boolean> = {
  override?: Override;
};

export const createModifySession = <Req extends IncomingRequest | LayoutRequest = IncomingRequest>(
  _getIronSession: typeof getIronSession,
) => {
  return async <Override extends boolean = false>(
    req: Req,
    res: IncomingResponse,
    config: IronAuthConfig,
    data: Override extends true ? Session['user'] : Partial<Session['user']>,
    { env, override }: Props<Override> & { env?: Record<string, string | undefined> } = {},
  ): Promise<Session> => {
    const parsedConfig = parseConfig(config, env);

    const session = await _getIronSession(req as IncomingRequest, res, parsedConfig.iron);

    if (session && session.user) {
      // eslint-disable-next-line no-param-reassign
      session.user = override ? (data as Session['user']) : { ...session.user, ...data };
      await session.save();

      return session;
    }

    throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
  };
};

export type { Props as ModifySessionProps };
