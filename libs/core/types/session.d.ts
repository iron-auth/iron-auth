// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as IronSession from 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    user?: Session['user'];
  }
}

export type Session = {
  user?: {
    // TODO: Type properly for release??
    id: number;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};
