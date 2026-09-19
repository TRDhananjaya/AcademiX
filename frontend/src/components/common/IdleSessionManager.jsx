import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import favicon from '../../assets/favicon.png';

// Configuration: 30 minutes total idle time, 2 minutes warning countdown
const DEFAULT_TOTAL_IDLE_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING_MS = 2 * 60 * 1000;     // 2 minutes (120 seconds)

export default function IdleSessionManager() {
  const { user, setUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  const lastActivityRef = useRef(Date.now());
  const isWarningActiveRef = useRef(false);

  // Keep ref synchronized with state to avoid race conditions in event listeners
  useEffect(() => {
    isWarningActiveRef.current = showWarning;
  }, [showWarning]);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    isWarningActiveRef.current = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('logout_reason', 'inactivity');
    if (setUser) {
      setUser(null);
    }
    window.location.href = '/login';
  }, [setUser]);

  const handleStayLoggedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    isWarningActiveRef.current = false;
  }, []);

  // Track user activity (throttled to avoid CPU overhead)
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      // If warning modal is already active, don't silently dismiss on passive mouse movement;
      // Require explicit button click ("Stay Logged In") to confirm presence.
      if (isWarningActiveRef.current) return;

      const now = Date.now();
      // Throttle updates to at most once every 1.5 seconds
      if (now - lastActivityRef.current > 1500) {
        lastActivityRef.current = now;
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

  // Periodic heartbeat timer to check idle status every second
  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    // Allow override for debugging/testing via window variable if needed
    const totalIdleMs = window.__IDLE_TIMEOUT_MS__ || DEFAULT_TOTAL_IDLE_MS;
    const warningMs = window.__WARNING_MS__ || DEFAULT_WARNING_MS;
    const warningTriggerMs = totalIdleMs - warningMs;

    const interval = setInterval(() => {
      // Quiz protection: If current path is taking a quiz, do not interrupt student
      const currentPath = window.location.pathname;
      const isQuizPage = currentPath.includes('student/quizzes');
      
      // If actively in a quiz, keep bumping activity timestamp
      if (isQuizPage) {
        lastActivityRef.current = Date.now();
        if (isWarningActiveRef.current) {
          setShowWarning(false);
          isWarningActiveRef.current = false;
        }
        return;
      }

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= totalIdleMs) {
        // Session expired
        clearInterval(interval);
        handleLogout();
      } else if (elapsed >= warningTriggerMs) {
        // Show warning modal and update remaining seconds
        const remaining = Math.max(0, Math.ceil((totalIdleMs - elapsed) / 1000));
        setSecondsLeft(remaining);
        if (!isWarningActiveRef.current) {
          setShowWarning(true);
          isWarningActiveRef.current = true;
        }
      } else {
        if (isWarningActiveRef.current) {
          setShowWarning(false);
          isWarningActiveRef.current = false;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, handleLogout]);

  if (!user || !showWarning) return null;

  // Format MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ animation: 'idleFadeIn 0.25s ease-out' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-0 overflow-hidden outline-none border border-slate-100"
        style={{ animation: 'idleScaleIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="p-6 sm:p-8">
          {/* Pulsing Shield / Icon Header */}
          <div className="flex justify-center mb-5">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border border-amber-200/70 shadow-inner">
              <span
                className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-75"
                style={{ animationDuration: '2.5s' }}
              />
              <img
                src={favicon}
                alt="AcademiX"
                className="w-11 h-11 object-contain relative z-10 filter drop-shadow-sm"
              />
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-xl font-bold text-slate-800 text-center mb-1">
            Session Inactivity Warning
          </h3>
          <p className="text-xs text-slate-400 text-center font-medium uppercase tracking-wider mb-4">
            Security Auto-Logout
          </p>

          {/* Explanation */}
          <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
            You have been inactive for almost 30 minutes. For your security and privacy, you will be
            automatically logged out in:
          </p>

          {/* Countdown Clock Display */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900">
              <svg
                className="w-5 h-5 text-amber-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-mono text-2xl font-bold tracking-widest text-amber-700">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Log Out Now
            </button>
            <button
              type="button"
              onClick={handleStayLoggedIn}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes idleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes idleScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
