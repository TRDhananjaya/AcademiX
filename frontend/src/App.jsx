import { useState, useEffect } from 'react';
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


import Analytics from './pages/teacher/Analytics';
import ExamPrediction from './pages/teacher/ExamPrediction';

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
  const { user } = useAuth();

  const teacherRoutes = [
    'teacher/dashboard', 'teacher/resources', 'teacher/quizzes', 'teacher/quiz-report',
    'teacher/notifications', 'teacher/community', 'teacher/attendance', 'teacher/profile',
    'teacher/students', 'create-quiz', 'analytics', 'exam-prediction'
  ];
  const studentRoutes = [
    'student/dashboard', 'student/lessons', 'student/quizzes', 'student/study-plans',
    'student/community', 'student/notifications', 'student/profile'
  ];

  const isTeacherRoute = teacherRoutes.includes(currentPage);
  const isStudentRoute = studentRoutes.includes(currentPage);

  useEffect(() => {
    const onRouteChange = () => setCurrentPage(getPage());
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

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
      return <CreateQuiz />;

    case 'analytics':
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
      return <ExamPrediction />;
    default:
      return <Home />;
  }
}

export default App;
