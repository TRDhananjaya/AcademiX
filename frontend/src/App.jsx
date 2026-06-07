import { useState, useEffect } from 'react';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import CreateQuiz from './pages/create-quiz';
import QuizReport from './pages/quiz-report';

// Shared navigate helper — use this instead of <a href>
export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function App() {
  const getPage = () => window.location.pathname.replace('/', '') || 'home';
  const [currentPage, setCurrentPage] = useState(getPage);

  useEffect(() => {
    const onRouteChange = () => setCurrentPage(getPage());
    window.addEventListener('popstate', onRouteChange);
    return () => window.removeEventListener('popstate', onRouteChange);
  }, []);

  if (currentPage === 'login') return <Login />;
  if (currentPage === 'dashboard') return <Dashboard />;
  if (currentPage === 'create-quiz') return <CreateQuiz />;
  if (currentPage === 'quiz-report') return <QuizReport />;
  return <Home />;
}

export default App;
