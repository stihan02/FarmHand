import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthForm: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, loading, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">{isSignUp ? 'Sign Up' : 'Sign In'} to HerdWise</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
          disabled={submitting || loading}
        >
          {submitting ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      <button
        onClick={handleGoogle}
        className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
        disabled={submitting || loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 6.5 28.1 4 22 4 11.5 4 3 12.5 3 23s8.5 19 19 19c10.5 0 18.5-7.5 18.5-18 0-1.2-.1-2.1-.3-3z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 6.5 28.1 4 22 4c-7.2 0-13.2 4.1-16.2 10.7z" fill="#FF3D00"/><path d="M24 44c5.6 0 10.3-1.8 13.7-4.9l-6.3-5.2C29.8 36 27 37 24 37c-5.7 0-10.5-3.8-12.2-9.1l-7 5.4C7.8 41.1 15.3 44 24 44z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.7 7.5-11.7 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 6.5 28.1 4 22 4 11.5 4 3 12.5 3 23s8.5 19 19 19c10.5 0 18.5-7.5 18.5-18 0-1.2-.1-2.1-.3-3z" fill="none"/></g></svg>
        Sign in with Google
      </button>
      <div className="mt-4 text-center">
        <button
          className="text-emerald-600 hover:underline text-sm"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}; 