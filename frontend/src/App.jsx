import { useState, useEffect } from 'react';
import Home from './pages/home';
import Login from './pages/login';
import StudentDashboard from './pages/student/dashboard';
import Lessons from './pages/student/Lessons';
import TakeQuiz from './pages/student/TakeQuiz';
import StudyPlans from './pages/student/StudyPlans';
import TeacherDashboard from './pages/teacher/dashboard';
import CreateQuiz from './pages/teacher/create-quiz';
import QuizReport from './pages/teacher/quiz-report';
import { useAuth } from './context/AuthContext';


import Analytics from './pages/teacher/Analytics';
import ExamPrediction from './pages/teacher/ExamPrediction';

// Shared navigate helper — use this instead of <a href>
export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function App() {
  const getPage = () => window.location.pathname.replace(/^\//, '') || 'home';
  const [currentPage, setCurrentPage] = useState(getPage);
  const { user } = useAuth();

  useEffect(() => {
    const onRouteChange = () => setCurrentPage(getPage());
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

// Route rendering
  switch (currentPage) {
    case 'login':
      return <Login />;
    case 'student/dashboard':
      return <StudentDashboard />;
    case 'teacher/dashboard':
      return <TeacherDashboard />;
    case 'create-quiz':
      return <CreateQuiz />;
    case 'quiz-report':
      return <QuizReport />;  
    case 'analytics':
      return <Analytics />;
    case 'student/lessons':
      return <Lessons />;
    case 'student/quizzes':
      return <TakeQuiz />;
    case 'student/study-plans':
      return <StudyPlans />;
    case 'exam-prediction':
      return <ExamPrediction />;
    default:
      return <Home />;
  }
}  

export default App;
