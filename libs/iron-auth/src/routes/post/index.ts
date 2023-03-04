import type { Routes } from '../helpers';
import { linkAccountRoute } from './link-account';
import { signinRoute } from './signin';
import { signoutRoute } from './signout';
import { signupRoute } from './signup';

// all of our routes for `POST` requests
export const routes = {
  signup: ({ req, config, session }) => signupRoute(req, config, session),
  signin: ({ req, res, config, session }) => signinRoute(req, res, config, session),
  signout: ({ session }) => signoutRoute(session),
  linkaccount: ({ req, config, session }) => linkAccountRoute(req, config, session),
} satisfies Routes;

export type { LinkAccountResponse } from './link-account';
export type { SignInResponse } from './signin';
export type { SignUpResponse } from './signup';
export type { SignOutResponse } from './signout';
