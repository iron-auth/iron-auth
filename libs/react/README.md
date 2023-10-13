# @iron-auth/react

This package contains the React components for Iron Auth.

## Installation

Add the following packages to your project.

```bash
npm install iron-auth @iron-auth/react
```

## Usage

Wrap your application in the session provider.

```tsx
import { createRoot } from 'react-dom/client';
import { SessionProvider } from '@iron-auth/react';

const root = createRoot(document.getElementById('app') as HTMLElement);

root.render(
	<React.StrictMode>
		<SessionProvider fetchOnLoad>{/* Your app */}</SessionProvider>
	</React.StrictMode>,
);
```

Then, use the `useSession` hook to get the session and sign in/out, etc.

```tsx
import { useSession } from '@iron-auth/react';

export const SignInComponent = () => {
	const { session } = useSession();

	return <div>{session?.user?.email}</div>;
};
```
