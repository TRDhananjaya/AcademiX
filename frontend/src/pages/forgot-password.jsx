import { useState } from 'react';
import { navigate } from '../App';
import { forgotPassword, resetPassword } from '../services/authService';
import logoBlack from '../assets/logo_black.png';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen select-none">
      {/* Left Section — Gradient Info Panel */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 p-8 lg:p-16 flex items-center justify-center relative overflow-hidden">
        {/* Floating Ambient Glowing Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl animate-drift"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl animate-drift-slow"></div>

        <div className="w-full max-w-md z-10 animate-fade-in-up">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Reset your<br />
            <span className="text-gradient">password safely.</span>
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Don't worry — it happens to the best of us. Verify your identity and you'll be back on track in no time.
          </p>

          {/* Security Info Card */}
          <div className="bg-white/75 backdrop-blur-lg rounded-2xl p-5 border border-white/60 shadow-md-custom mb-6 animate-float hover:scale-[1.02] transition-transform duration-300">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">Secure Verification</h4>
                <p className="text-[13px] text-slate-500">Your identity is verified using your username and registered email.</p>
              </div>
            </div>
          </div>

          {/* Step Info Card */}
          <div className="bg-white/75 backdrop-blur-lg rounded-2xl p-5 border border-white/60 shadow-md-custom animate-float-delayed hover:scale-[1.02] transition-transform duration-300">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner font-bold text-lg">
                {step}/3
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-[15px] mb-0.5">
                  {step === 1 && 'Step 1: Verify Identity'}
                  {step === 2 && 'Step 2: Set New Password'}
                  {step === 3 && 'Done! Password Updated'}
                </p>
                <p className="text-[13px] text-slate-500">
                  {step === 1 && 'Enter your username and email to proceed.'}
                  {step === 2 && 'Choose a strong new password.'}
                  {step === 3 && 'You can now log in with your new password.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section — Form Panel */}
      <div className="bg-white p-8 lg:p-16 flex items-center justify-center relative border-l border-slate-100">
        <div className="w-full max-w-sm z-10 animate-fade-in-up flex flex-col justify-center">
          {/* Brand Logo */}
          <div className="mb-8 flex justify-center">
            <img src={logoBlack} alt="AcademiX" className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300 mx-auto" />
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
  );
}
