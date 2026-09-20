import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

// ─── Session Constants ────────────────────────────────────────────────────────
const SESSION_TIMEOUT_MS  = 30 * 60 * 1000;  // 30-minute idle timeout
const LAST_ACTIVITY_KEY   = 'lastActivity';
const SESSION_COOKIE_NAME = 'acad_session';

/**
 * Checks whether the browser session cookie exists.
 * Session cookies have NO Expires or Max-Age:
 * - They SURVIVE tab closes as long as the web browser process is running.
 * - They are DESTROYED by the browser engine the moment the web browser is closed.
 */
function hasSessionCookie() {
  return document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}

function setSessionCookie() {
  // Session cookie (no Expires/Max-Age) is tied to the browser process lifecycle
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; SameSite=Lax`;
}

function removeSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * How session state is evaluated on page load:
 *
 * 1. If localStorage has no 'user' or 'token' -> Not logged in ('no_user').
 * 2. If 'user' exists in localStorage BUT 'acad_session' cookie is missing:
 *    -> The web browser was closed! (Browser process terminated & wiped session cookies).
 *    -> Action: Clear storage immediately, return 'browser_closed' to show login screen.
 * 3. If 'acad_session' cookie is present:
 *    -> The web browser was NOT closed (e.g. page refreshed, or a tab was closed and reopened,
 *       or another tab remained open).
 *    -> Check the 30-minute idle inactivity timeout.
 *       - If elapsed > 30 minutes -> return 'expired'.
 *       - If elapsed <= 30 minutes -> return 'valid'.
 */
function evaluateSessionOnLoad() {
  const lsUser  = localStorage.getItem('user');
  const lsToken = localStorage.getItem('token');
  if (!lsUser || !lsToken) return 'no_user';

  // Browser close check: session cookie dies with the browser process
  if (!hasSessionCookie()) {
    return 'browser_closed';
  }

  // Idle inactivity check: 30 minutes
  const la = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (la && Date.now() - parseInt(la, 10) > SESSION_TIMEOUT_MS) {
    return 'expired';
  }

  return 'valid';
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem('pendingLogout');
  sessionStorage.removeItem('ss_token');
  removeSessionCookie();
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const lsUser = localStorage.getItem('user');
    if (!lsUser) return null;

    const result = evaluateSessionOnLoad();

    if (result === 'browser_closed') {
      clearSession();
      return null;
    }
    if (result === 'expired') {
      clearSession();
      sessionStorage.setItem('logout_reason', 'inactivity');
      return null;
    }

    // Session is valid: ensure session cookie is present
    setSessionCookie();
    try {
      return JSON.parse(lsUser);
    } catch {
      return null;
    }
  });

  // Keep session cookie alive on mount if user is logged in
  useEffect(() => {
    if (user) {
      setSessionCookie();
    }
  }, [user]);

  // ── setUser: called on login and logout ───────────────────────────────────
  const setUser = useCallback((newUser) => {
    if (newUser) {
      const now = String(Date.now());
      localStorage.setItem(LAST_ACTIVITY_KEY, now);
      setSessionCookie();
    } else {
      clearSession();
    }
    setUserState(newUser);
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
