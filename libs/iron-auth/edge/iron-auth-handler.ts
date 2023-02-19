import { getIronSession } from 'iron-session/edge';
import { createHandler } from '../src/handlers';
import type { EdgeHandler } from '../src/handlers/create-handler';

export const ironAuthHandler: EdgeHandler = (config, req, env) =>
  createHandler(getIronSession)(config, req, undefined, env);
