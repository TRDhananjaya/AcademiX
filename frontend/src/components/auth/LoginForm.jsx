import { useState, useEffect } from 'react';
import { navigate } from '../../App';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import logoBlack from '../../assets/logo_black.png';
import studentIllustration from '../../assets/login_student.jpg';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState(false);
  const [browserClosedNotice, setBrowserClosedNotice] = useState(false);
  const { setUser } = useAuth();

  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason');
    if (reason === 'inactivity') {
      setInactivityNotice(true);
    } else if (reason === 'browser_closed') {
      setBrowserClosedNotice(true);
    }
    if (reason) sessionStorage.removeItem('logout_reason');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (!result.ok) {
        setError(result.message || 'Invalid credentials');
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
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-slate-50 to-purple-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">

      {/* Subtle Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top-Left Flowing Curved Waves & Arcs (matching user reference) */}
      <svg
        className="absolute -top-16 -left-16 w-[620px] h-[620px] text-indigo-300/40 pointer-events-none stroke-current"
        viewBox="0 0 600 600"
        fill="none"
      >
        <path d="M-80,60 C80,140 200,240 320,440 C400,580 520,600 620,620" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M-40,20 C120,100 240,200 360,400 C440,540 560,560 660,580" strokeWidth="2" opacity="0.7" />
        <path d="M0,-20 C160,60 280,160 400,360 C480,500 600,520 700,540" strokeWidth="2.5" opacity="0.9" />
        <circle cx="160" cy="160" r="180" strokeWidth="1" opacity="0.3" />
        <circle cx="160" cy="160" r="280" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />
      </svg>

      {/* Bottom-Right Flowing Waves */}
      <svg
        className="absolute -bottom-20 -right-20 w-[560px] h-[560px] text-purple-300/35 pointer-events-none stroke-current"
        viewBox="0 0 550 550"
        fill="none"
      >
        <path d="M580,20 C460,120 340,240 220,380 C140,480 40,520 -20,540" strokeWidth="2" opacity="0.7" />
        <path d="M620,60 C500,160 380,280 260,420 C180,520 80,560 20,580" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5" />
        <circle cx="420" cy="420" r="200" strokeWidth="1" opacity="0.25" />
      </svg>

      {/* Ambient Glowing Blobs */}
      <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl animate-drift pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full bg-purple-300/25 blur-3xl animate-drift-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />

      {/* Outer Card Container matching reference frame */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-2xl shadow-indigo-950/10 w-full max-w-5xl overflow-hidden p-8 sm:p-12 lg:p-14 transition-all relative z-10">

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left Side: Student Illustration on Indigo Arch (Bigger) */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[480px] lg:max-w-[520px] aspect-square flex items-center justify-center group">
              <img
                src={studentIllustration}
                alt="Student studying with AcademiX"
                className="w-full h-full object-contain rounded-2xl drop-shadow-lg group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Side: Exact Login Form Section */}
          <div className="w-full max-w-sm mx-auto flex flex-col justify-center">

            {/* AcademiX Logo (Bigger) */}
            <div className="mb-1 flex justify-center">
              <img
                src={logoBlack}
                alt="AcademiX"
                className="h-18 sm:h-24 w-auto object-contain mx-auto hover:opacity-90 transition-all hover:scale-105 duration-300 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>

            {/* Header */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-center mb-8 leading-relaxed text-sm">
              Log in to continue your learning journey.
            </p>

            {/* Browser Closed Notice Banner */}
            {browserClosedNotice && (
              <div className="mb-6 p-3.5 bg-blue-50/90 border border-blue-200/80 text-blue-900 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Session ended</p>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">Your session was cleared when the browser closed. Please log in again to continue.</p>
                </div>
              </div>
            )}

            {/* Inactivity Notice Banner */}
            {inactivityNotice && (
              <div className="mb-6 p-3.5 bg-amber-50/90 border border-amber-200/80 text-amber-900 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Logged out due to inactivity</p>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">For your account security, your session timed out after 30 minutes. Please log in again.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-semibold animate-shake">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-6">
              <div>
                <label htmlFor="username" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">
                  Username
                </label>
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-[14px] font-medium text-slate-700 tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot')}
                    className="text-[13px] text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium"
                  >
                    Forgot password?
                  </button>
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
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>

            {/* Help / Support Note */}
            <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
              Having trouble signing in?{' '}
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
              >
                Contact Support
              </button>
            </p>

            {/* Back to Home Button */}
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
    </div>
  );
}


