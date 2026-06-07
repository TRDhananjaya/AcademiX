import { useState } from 'react';
import { navigate } from '../../App';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', result.data.token);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(result.data));
      }

      // Set user in AuthContext
      setUser(result.data);

      // Redirect based on role
      const dashboard = result.data.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(dashboard);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Master any<br />
            <span className="text-gradient">subject, faster.</span>
          </h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Join AcademiX to experience personalized, AI-driven learning pathways designed for modern minds.
          </p>

          {/* Study Assistant Card */}
          <div className="bg-white rounded-2xl p-4 shadow-md-custom mb-6">
            <div className="flex gap-3 mb-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h4 className="font-bold text-text-primary mb-1">AI Study Assistant Active</h4>
                <p className="text-sm text-text-tertiary">Analyzing learning patterns...</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full animate-pulse" style={{width: '65%'}}></div>
            </div>
          </div>

          {/* Community Goal Card */}
          <div className="bg-white rounded-2xl p-4 shadow-md-custom flex items-center gap-3">
            <img src="https://i.pravatar.cc/40?img=1" alt="user" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-text-primary">Community Goal Met</p>
              <p className="text-sm text-text-tertiary">+240 peers online now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="bg-white p-8 lg:p-12 flex items-center justify-center relative">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="AcademiX" className="h-20 w-auto mx-auto mb-6" />
          </div>

          <h2 className="text-4xl font-bold text-text-primary mb-2 text-center">Welcome</h2>
          <p className="text-text-secondary text-center mb-8 leading-relaxed">Log in or create an account to continue your learning journey.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-text-primary mb-2 text-left">User Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                <input
                  type="text"
                  id="username"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-light border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-text-primary">Password</label>
                <a href="/forgot" className="text-sm text-primary font-semibold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-bg-light border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-primary hover:opacity-70 transition-opacity font-bold"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '✕' : '✓'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-text-secondary font-medium cursor-pointer">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg-custom hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-xs text-text-tertiary text-center">
            By continuing, you agree to AcademiX's <a href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</a>.
          </p>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 text-text-secondary hover:text-primary mt-6 transition-colors group w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
