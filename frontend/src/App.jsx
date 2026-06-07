import { useState, useEffect } from 'react';
import Home from './pages/home';
import Login from './pages/login';

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

  return currentPage === 'login' ? <Login /> : <Home />;
}

export default App;
