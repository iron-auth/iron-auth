import { signOut, signUp } from 'iron-auth/methods';
import { useCallback, useState } from 'react';

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
      await signUp('credentials', 'email-pass-provider', { data: credentials, rejects: true });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  return (
    <div className="flex flex-col space-y-4 items-center">
      <h1>Sign Up</h1>

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
          {loading ? 'Loading...' : 'Sign Up'}
        </button>

        <button
          className="bg-slate-100 px-3 py-1.5 rounded-md"
          type="button"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Page;
