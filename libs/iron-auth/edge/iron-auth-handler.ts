import { getIronSession } from 'iron-session/edge';
import { createHandler } from '../src/handlers';

export const ironAuthHandler = createHandler(getIronSession);
