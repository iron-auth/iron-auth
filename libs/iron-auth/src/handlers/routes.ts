import {
  csrfRoute,
  linkAccountRoute,
  sessionRoute,
  signinRoute,
  signoutRoute,
  signupRoute,
} from '../routes';
import { validateCsrfToken } from '../utils';
import type { Routes } from './request-router';
import { getCallback, postCallback } from './request-router';

export const routes: Routes = {
  GET: {
    before: undefined,
    routes: {
      session: {
        handler: ({ session }) => sessionRoute(session),
        callback: getCallback,
      },
      csrf: {
        handler: ({ req, res, config }) => csrfRoute(req, res, config),
        callback: getCallback,
      },
    },
  },
  POST: {
    before: validateCsrfToken,
    routes: {
      signup: {
        handler: ({ req, config, session }) => signupRoute(req, config, session),
        callback: postCallback('signUp'),
      },
      signin: {
        handler: ({ req, config, session }) => signinRoute(req, config, session),
        callback: postCallback('signIn'),
      },
      signout: {
        handler: ({ session }) => signoutRoute(session),
        callback: postCallback('signOut'),
      },
      linkaccount: {
        handler: ({ req, config, session }) => linkAccountRoute(req, config, session),
        callback: postCallback('linkAccount'),
      },
    },
  },
};
