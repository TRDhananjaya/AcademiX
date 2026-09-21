import { useState, useEffect, useRef } from 'react';
import Home from './pages/home';
import About from './pages/about';
import Contact from './pages/contact';
import Login from './pages/login';
import StudentDashboard from './pages/student/dashboard';
import Lessons from './pages/student/Lessons';
import TakeQuiz from './pages/student/TakeQuiz';
import StudyPlans from './pages/student/StudyPlans';
import TeacherDashboard from './pages/teacher/dashboard';
import CreateQuiz from './pages/teacher/create-quiz';

import { useAuth } from './context/AuthContext';
import IdleSessionManager from './components/common/IdleSessionManager';
import ConfirmModal from './components/common/ConfirmModal';


import Analytics from './pages/teacher/Analytics';
import ExamPrediction from './pages/teacher/ExamPrediction';
import ExamPredictionStudentDetail from './pages/teacher/ExamPredictionStudentDetail';

import CommunityHub from './pages/student/CommunityHub';
import StudentNotifications from './pages/student/Notification';
import TeacherNotifications from './pages/teacher/Notification';
import ProfileSettings from './pages/student/ProfileSettings';
import TeacherProfileSettings from './pages/teacher/ProfileSettings';
import StudentManagement from './pages/teacher/StudentManagement';
import ForgotPassword from './pages/forgot-password';

const rawPushState = typeof window !== 'undefined' ? window.history.pushState.bind(window.history) : null;
const rawReplaceState = typeof window !== 'undefined' ? window.history.replaceState.bind(window.history) : null;

let currentAuthDepth = 0;

if (typeof window !== 'undefined' && !window.__academiX_history_wrapped) {
  window.__academiX_history_wrapped = true;

  window.history.pushState = function (state, unused, url) {
    const authSession = sessionStorage.getItem('academiX_auth_session');
    if (authSession) {
      currentAuthDepth += 1;
      const taggedState = {
        ...(state && typeof state === 'object' ? state : {}),
        _authSession: authSession,
        _authDepth: currentAuthDepth
      };
      return rawPushState(taggedState, unused, url);
    }
    return rawPushState(state, unused, url);
  };

  window.history.replaceState = function (state, unused, url) {
    const authSession = sessionStorage.getItem('academiX_auth_session');
    if (authSession) {
      const taggedState = {
        ...(state && typeof state === 'object' ? state : {}),
        _authSession: authSession,
        _authDepth: currentAuthDepth
      };
      return rawReplaceState(taggedState, unused, url);
    }
    return rawReplaceState(state, unused, url);
  };
}

// Shared navigate helper — use this instead of <a href>
export function navigate(path, state = {}, replace = false) {
  if (replace) {
    window.history.replaceState(state, '', path);
  } else {
    window.history.pushState(state, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
}

function App() {
  const getPage = () => window.location.pathname.replace(/^\//, '') || 'home';
  const [currentPage, setCurrentPage] = useState(getPage);
  const { user, setUser } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const showLogoutConfirmRef = useRef(showLogoutConfirm);
  useEffect(() => {
    showLogoutConfirmRef.current = showLogoutConfirm;
  }, [showLogoutConfirm]);

  const teacherRoutes = [
    'teacher/dashboard', 'teacher/resources', 'teacher/quizzes', 'teacher/quiz-report',
    'teacher/notifications', 'teacher/community', 'teacher/attendance', 'teacher/profile',
    'teacher/students', 'teacher/analytics', 'teacher/create-quiz', 'teacher/exam-prediction',
    'create-quiz', 'analytics', 'exam-prediction'
  ];
  const studentRoutes = [
    'student/dashboard', 'student/lessons', 'student/quizzes', 'student/study-plans',
    'student/community', 'student/notifications', 'student/profile'
  ];

  const isTeacherRoute = teacherRoutes.includes(currentPage);
  const isStudentRoute = studentRoutes.includes(currentPage);

  // Initialize and synchronize session history depth tracking
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem('academiX_auth_session');
      currentAuthDepth = 0;
      return;
    }

    let sessionId = sessionStorage.getItem('academiX_auth_session');
    if (!sessionId) {
      sessionId = 'ax_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('academiX_auth_session', sessionId);
      currentAuthDepth = 0;
      if (rawReplaceState) {
        rawReplaceState({ ...window.history.state, _authSession: sessionId, _authDepth: 0 }, '', window.location.pathname);
      }
    } else {
      if (window.history.state && window.history.state._authSession === sessionId && typeof window.history.state._authDepth === 'number') {
        currentAuthDepth = window.history.state._authDepth;
      } else {
        currentAuthDepth = 0;
        if (rawReplaceState) {
          rawReplaceState({ ...window.history.state, _authSession: sessionId, _authDepth: 0 }, '', window.location.pathname);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const onRouteChange = (e) => {
      const state = e?.state || window.history.state;
      const currentUser = userRef.current;
      const session = sessionStorage.getItem('academiX_auth_session');

      if (currentUser && session) {
        // If logout confirmation popup is already visible and user clicks browser Back:
        // Prevent going to login page or leaving, push safePath and stay on dashboard
        if (showLogoutConfirmRef.current && e.isTrusted) {
          const fallbackPath = currentUser.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
          const safePath = (window.location.pathname.startsWith('/teacher') || window.location.pathname.startsWith('/student'))
            ? window.location.pathname
            : fallbackPath;

          currentAuthDepth = 0;
          if (rawPushState) {
            rawPushState({ _authSession: session, _authDepth: 0 }, '', safePath);
          }
          setCurrentPage(currentUser.role === 'teacher' ? 'teacher/dashboard' : 'student/dashboard');
          return;
        }

        const isSessionEntry = state && state._authSession === session && typeof state._authDepth === 'number';

        if (isSessionEntry) {
          // Valid in-app navigation (routes or internal component views like Lessons/Modules)
          currentAuthDepth = state._authDepth;
          setCurrentPage(getPage());
          return;
        }

        // Trusted event leaving the active session (e.g. browser Back to /login or external site)
        if (e.isTrusted) {
          const fallbackPath = currentUser.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
          const currentPath = window.location.pathname;
          const safePath = (currentPath.startsWith('/teacher') || currentPath.startsWith('/student'))
            ? currentPath
            : fallbackPath;

          currentAuthDepth = 0;
          if (rawPushState) {
            rawPushState({ _authSession: session, _authDepth: 0 }, '', safePath);
          }
          setCurrentPage(getPage());
          setShowLogoutConfirm(true);
          return;
        }
      }

      setCurrentPage(getPage());
    };

    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    sessionStorage.removeItem('academiX_auth_session');
    if (setUser) setUser(null);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
    const session = sessionStorage.getItem('academiX_auth_session');
    const safePath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
    if (rawPushState && session) {
      rawPushState({ _authSession: session, _authDepth: 0 }, '', safePath);
    }
  };

  useEffect(() => {
    if (!user) {
      if (isTeacherRoute || isStudentRoute) {
        navigate('/login', {}, true);
      }
    } else {
      if (user.role === 'teacher') {
        if (isStudentRoute || currentPage === 'login') {
          navigate('/teacher/dashboard', {}, true);
        }
      } else if (user.role === 'student') {
        if (isTeacherRoute || currentPage === 'login') {
          navigate('/student/dashboard', {}, true);
        }
      }
    }
  }, [currentPage, user, isTeacherRoute, isStudentRoute]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Helper to render the active page component
  const renderContent = () => {
    // Route rendering guards to prevent flashing protected content before redirect
    if (!user && (isTeacherRoute || isStudentRoute)) {
      return <Login />;
    }
    if (user && (currentPage === 'login' || currentPage === 'home')) {
      return user.role === 'teacher' ? <TeacherDashboard activeTab="dashboard" /> : <StudentDashboard />;
    }
    if (user && user.role === 'student' && isTeacherRoute) {
      return <StudentDashboard />;
    }
    if (user && user.role === 'teacher' && isStudentRoute) {
      return <TeacherDashboard activeTab="dashboard" />;
    }

    // Route rendering
    switch (currentPage) {
      case 'login':
        return <Login />;
      case 'forgot':
        return <ForgotPassword />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'student/dashboard':
        return <StudentDashboard />;
      case 'teacher/dashboard':
        return <TeacherDashboard activeTab="dashboard" />;
      case 'teacher/resources':
        return <TeacherDashboard activeTab="lessons" />;
      case 'teacher/quizzes':
        return <TeacherDashboard activeTab="quizzes" />;
      case 'teacher/quiz-report':
        return <TeacherDashboard activeTab="quiz-report" />;
      case 'create-quiz':
      case 'teacher/create-quiz':
        return <CreateQuiz />;

      case 'analytics':
      case 'teacher/analytics':
        return <Analytics />;
      case 'student/lessons':
        return <Lessons />;
      case 'student/quizzes':
        return <TakeQuiz />;
      case 'student/study-plans':
        return <StudyPlans />;
      case 'student/community':
        return <CommunityHub />;
      case 'student/notifications':
        return <StudentNotifications activeTab="notifications" />;
      case 'teacher/notifications':
        return <TeacherDashboard activeTab="notifications" />;
      case 'teacher/community':
        return <TeacherDashboard activeTab="community" />;
      case 'teacher/attendance':
        return <TeacherDashboard activeTab="attendance" />;
      case 'teacher/profile':
        return <TeacherProfileSettings />;
      case 'teacher/students':
        return <StudentManagement />;
      case 'student/profile':
        return <ProfileSettings />;
      case 'exam-prediction':
      case 'teacher/exam-prediction':
        return <ExamPrediction />;
      default:
        if (currentPage.startsWith('exam-prediction/student/')) {
          const parts = currentPage.split('/');
          if (parts.length === 3) {
            return <ExamPredictionStudentDetail studentId={parts[2]} />;
          }
        }
        return <Home />;
    }
  };

  return (
    <>
      <IdleSessionManager />
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Stay"
        variant="danger"
      />
      {renderContent()}
    </>
  );
}

export default App;
