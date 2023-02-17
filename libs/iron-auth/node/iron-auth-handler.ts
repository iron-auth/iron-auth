import { getIronSession } from 'iron-session';
import { createHandler } from '../src/handlers';
import { getCrypto } from '../src/utils';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
getCrypto(require('crypto').webcrypto);

export const ironAuthHandler = createHandler(getIronSession);
