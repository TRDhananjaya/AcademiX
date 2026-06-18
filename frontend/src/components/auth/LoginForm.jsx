import { useState } from 'react';
import { navigate } from '../../App';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import logoBlack from '../../assets/logo_black.png';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

      // Store token and user data in localStorage
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));

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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen select-none">
      {/* Left Section (Gradient Info & Marketing) */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 p-8 lg:p-16 flex items-center justify-center relative overflow-hidden">
        {/* Floating Ambient Glowing Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl animate-drift"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl animate-drift-slow"></div>

        <div className="w-full max-w-md z-10 animate-fade-in-up">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Master ICT<br />
            <span className="text-gradient">smartly & faster.</span>
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Join AcademiX to experience personalized, AI-driven learning pathways designed for modern minds.
          </p>

          {/* Study Assistant Card */}
          <div className="bg-white/75 backdrop-blur-lg rounded-2xl p-5 border border-white/60 shadow-md-custom mb-6 animate-float hover:scale-[1.02] transition-transform duration-300">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                AI
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">AI Study Plans</h4>
                <p className="text-[13px] text-slate-500">Analyzing your learning patterns...</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
          </div>

          {/* Community Goal Card */}
          <div className="bg-white/75 backdrop-blur-lg rounded-2xl p-5 border border-white/60 shadow-md-custom animate-float-delayed hover:scale-[1.02] transition-transform duration-300 flex items-center gap-4">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=33" alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://i.pravatar.cc/100?img=12" alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://i.pravatar.cc/100?img=47" alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-[15px] mb-0.5">Active Study Community</p>
              <p className="text-[13px] text-slate-500">+240 peers online now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section (Login Form - Clean White Space) */}
      <div className="bg-white p-8 lg:p-16 flex items-center justify-center relative border-l border-slate-100">
        <div className="w-full max-w-sm z-10 animate-fade-in-up flex flex-col justify-center">
          {/* Brand Logo - Centered */}
          <div className="mb-8 flex justify-center">
            <img src={logoBlack} alt="AcademiX" className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 mx-auto" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-center mb-8 leading-relaxed text-sm">Log in to continue your learning journey.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-6">
            <div>
              <label htmlFor="username" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">Username</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-[14px] font-medium text-slate-700 tracking-wide">Password</label>
                <a href="/forgot" className="text-[13px] text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
            By continuing, you agree to AcademiX's <a href="/terms" className="text-indigo-600 hover:underline font-medium">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:underline font-medium">Privacy Policy</a>.
          </p>

          {/* Back Button - Centered */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group font-medium text-sm cursor-pointer justify-center w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
