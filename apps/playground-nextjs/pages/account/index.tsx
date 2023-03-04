import { getServerSideSession } from 'iron-auth/node';
import type { GetServerSideProps } from 'next';
import { getIronAuthOptions } from '../api/auth/[...ironauth]';

const Page = () => (
  <div className="flex flex-col space-y-4 items-center">
    <h1>Account</h1>
  </div>
);

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  let session;
  try {
    session = await getServerSideSession(req, await getIronAuthOptions(true));
  } catch (err) {
    session = null;
  }

  return {
    props: {
      session,
    },
  };
};

export default Page;
