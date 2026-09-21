import { useState } from 'react';
import { navigate } from '../App';
import { forgotPassword, resetPassword } from '../services/authService';
import logoBlack from '../assets/logo_black.png';
import studentIllustration from '../assets/login_student.jpg';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = verify, 2 = reset, 3 = success
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email) {
      setError('Please enter both username and email');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(username, email);

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setResetToken(result.data.resetToken);
      setStep(2);
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(resetToken, newPassword);

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setStep(3);
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  // Step indicator dots
  const StepIndicator = () => (
    <div className="flex gap-2 justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all duration-500 ${
            s === step
              ? 'w-8 bg-indigo-600'
              : s < step
              ? 'w-2 bg-indigo-400'
              : 'w-2 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );

  // Password toggle eye icon
  const EyeIcon = ({ show, onClick }) => (
    <button
      type="button"
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      {show ? (
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
  );

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

          {/* Right Side: Exact Form Section */}
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

            <StepIndicator />

            {/* ─── STEP 1: Verify Identity ─── */}
            {step === 1 && (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">Forgot Password?</h2>
                <p className="text-slate-500 text-center mb-8 leading-relaxed text-sm">
                  Enter your username and email to verify your identity.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-semibold animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6 mb-6">
                  <div>
                    <label htmlFor="forgot-username" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">Username</label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="forgot-username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="forgot-email" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">Email Address</label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="forgot-email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {loading ? 'Verifying...' : 'Verify Identity →'}
                  </button>
                </form>
              </>
            )}

            {/* ─── STEP 2: Set New Password ─── */}
            {step === 2 && (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">Set New Password</h2>
                <p className="text-slate-500 text-center mb-8 leading-relaxed text-sm">
                  Choose a strong password with at least 6 characters.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-semibold animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-6 mb-6">
                  <div>
                    <label htmlFor="new-password" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">New Password</label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="new-password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                      />
                      <EyeIcon show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-[14px] font-medium text-slate-700 mb-2 text-left tracking-wide">Confirm Password</label>
                    <div className="relative group">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm-password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 placeholder-slate-400"
                      />
                      <EyeIcon show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                    {/* Password strength hint */}
                    {newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              newPassword.length < 6
                                ? 'w-1/4 bg-red-400'
                                : newPassword.length < 10
                                ? 'w-2/4 bg-amber-400'
                                : newPassword.length < 14
                                ? 'w-3/4 bg-emerald-400'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          newPassword.length < 6
                            ? 'text-red-500'
                            : newPassword.length < 10
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}>
                          {newPassword.length < 6 ? 'Too short' : newPassword.length < 10 ? 'Fair' : newPassword.length < 14 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {loading ? 'Resetting...' : 'Reset Password →'}
                  </button>
                </form>
              </>
            )}

            {/* ─── STEP 3: Success ─── */}
            {step === 3 && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Password Updated!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            )}

            {/* Back to Login link (steps 1 & 2) */}
            {step < 3 && (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group font-medium text-sm cursor-pointer justify-center w-full mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
