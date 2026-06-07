import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../App';

export default function StudentDashboard() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Student Dashboard
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
              Welcome back, {user?.firstName || user?.username || 'Student'}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#64748b', textAlign: 'center' }}>
            📚 Student dashboard content coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
