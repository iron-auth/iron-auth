import { SessionProvider } from '@iron-auth/react';
import type { AppProps } from 'next/app';
import { Topbar } from '../components';

import './global.css';

const App = ({ Component, pageProps }: AppProps) => (
	<SessionProvider fetchOnLoad session={pageProps.session}>
		<Topbar />

		<main className="flex flex-col flex-grow justify-center items-center -mt-20">
			<Component {...pageProps} />
		</main>
	</SessionProvider>
);

export default App;
