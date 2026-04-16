import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/lib/axiosInstance';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/login', {
        username,
        password,
      });

      const { token, role } = response.data;

      Cookies.set('token', token, { expires: 1 });
      Cookies.set('role', role, { expires: 1 });

      router.push('/wizard/step1');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="w-full max-w-md">
        <div className="bg-surface_container_lowest px-6 py-8 rounded-lg shadow-sm border border-outline_variant border-opacity-20">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">
            Fleetify Logistics
          </h1>
          <h2 className="text-lg font-semibold text-on_surface mb-8 text-center">
            Invoice Generator
          </h2>

          {error && (
            <div className="bg-error_container text-on_error_container px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on_surface mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-outline_variant border-opacity-20 rounded bg-surface_container_lowest focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <p className="text-xs text-on_surface_variant mt-1">Demo: admin or kerani</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on_surface mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-outline_variant border-opacity-20 rounded bg-surface_container_lowest focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <p className="text-xs text-on_surface_variant mt-1">Demo: admin123 or kerani123</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 mt-6 bg-gradient-to-r from-primary to-primary_container text-on_primary rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
