import Link from 'next/link';

import { useSession } from '@iron-auth/react';

export const Topbar = () => {
	const { loadingInitialSession, session } = useSession();

	return (
		<div className="flex flex-row justify-between max-w-4xl w-full my-4 text-lg font-medium">
			<h1>
				<Link href="/">Home</Link>
			</h1>

			<div className="flex flex-row space-x-8">
				<Link href="/signup">Sign Up</Link>
				<Link href="/signin">Sign In</Link>
				{/* eslint-disable-next-line no-nested-ternary */}
				{loadingInitialSession ? (
					<p>Loading...</p>
				) : session ? (
					<p>Logged in as #{session.user.id}</p>
				) : (
					<p>Not logged in</p>
				)}
			</div>
		</div>
	);
};
