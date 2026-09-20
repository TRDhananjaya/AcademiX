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

// Shared navigate helper — use this instead of <a href>
export function navigate(path, state = {}) {
  window.history.pushState(state, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
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

  // Maintain a guard history entry while logged in so browser Back can be intercepted
  useEffect(() => {
    if (!user) return;

    // Push initial guard
    window.history.pushState({ appGuard: true }, '', window.location.pathname);

    // Re-push on user interaction so Chromium attaches user activation to the history entry
    let armed = false;
    const armOnGesture = () => {
      if (!armed) {
        armed = true;
        window.history.pushState({ appGuard: true }, '', window.location.pathname);
      }
    };

    window.addEventListener('pointerdown', armOnGesture, { capture: true, passive: true });
    window.addEventListener('keydown', armOnGesture, { capture: true, passive: true });
    window.addEventListener('click', armOnGesture, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', armOnGesture, { capture: true });
      window.removeEventListener('keydown', armOnGesture, { capture: true });
      window.removeEventListener('click', armOnGesture, { capture: true });
    };
  }, [user, currentPage]);

  useEffect(() => {
    const onRouteChange = (e) => {
      // If user is logged in and presses browser Back or Forward button, ask confirmation
      if (e.isTrusted && userRef.current) {
        window.history.pushState({ appGuard: true }, '', window.location.pathname);
        setShowLogoutConfirm(true);
        return;
      }
      setCurrentPage(getPage());
    };
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    if (setUser) setUser(null);
    window.location.href = '/login';
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
    window.history.pushState({ appGuard: true }, '', window.location.pathname);
  };

  useEffect(() => {
    if (!user) {
      if (isTeacherRoute || isStudentRoute) {
        navigate('/login');
      }
    } else {
      if (user.role === 'teacher') {
        if (isStudentRoute) {
          navigate('/teacher/dashboard');
        }
      } else if (user.role === 'student') {
        if (isTeacherRoute) {
          navigate('/student/dashboard');
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
