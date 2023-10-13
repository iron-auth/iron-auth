import { signIn, signOut } from 'iron-auth/methods';
import { getServerSideSession } from 'iron-auth/node';
import type { GetServerSideProps } from 'next';
import { useCallback, useState } from 'react';
import { getIronAuthOptions } from '../api/auth/[...ironauth]';

const Page = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [credentials, setCredentials] = useState<{ email: string; password: string }>({
		email: '',
		password: '',
	});

	const handleClick = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			await signIn('credentials', 'email-pass-provider', { data: credentials, rejects: true });
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	}, [credentials]);

	const handleSignOut = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			await signOut({ rejects: true });
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<div className="flex flex-col space-y-4 items-center">
			<h1>Sign In</h1>

			{error && <p>{error}</p>}

			<input
				className="bg-slate-100 px-3 py-1.5 rounded-md"
				placeholder="Email"
				value={credentials.email}
				onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
			/>
			<input
				className="bg-slate-100 px-3 py-1.5 rounded-md"
				placeholder="Password"
				value={credentials.password}
				onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
			/>

			<div className="flex flex-row space-x-2">
				<button
					className="bg-slate-100 px-3 py-1.5 rounded-md"
					type="button"
					onClick={() => handleClick()}
					disabled={loading}
				>
					{loading ? 'Loading...' : 'Sign In'}
				</button>

				<button
					className="bg-slate-100 px-3 py-1.5 rounded-md"
					type="button"
					onClick={() => handleSignOut()}
					disabled={loading}
				>
					Sign Out
				</button>
			</div>
		</div>
	);
};

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
