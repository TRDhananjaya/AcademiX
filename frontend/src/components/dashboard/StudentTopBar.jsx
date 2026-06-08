import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../App';

export default function StudentTopBar() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="flex items-center justify-between gap-5 p-[12px_16px] md:p-[14px_40px] bg-white border-b border-slate-100 sticky top-0 z-30">
      
      <div className="flex-1 flex max-w-[600px]">
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-full p-[9px_20px] w-full transition-all border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-[3px] focus-within:ring-indigo-500/10">
          <svg className="text-slate-400 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search courses, plans, community..."
            className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans placeholder-slate-400"
            id="search-resources"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Robot/AI Icon */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-none bg-transparent text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-600" aria-label="AI Assistant">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </button>

        {/* Notifications */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-none bg-transparent text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-600 relative" aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="absolute top-[8px] right-[9px] w-[8px] h-[8px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center"></span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center justify-center w-[40px] h-[40px] rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500 cursor-pointer transition-all hover:border-indigo-500 hover:text-indigo-500 p-0 overflow-hidden" aria-label="User profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Alex" className="w-full h-full object-cover" />
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="hidden lg:flex items-center justify-center h-[38px] px-3 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-medium cursor-pointer transition-all ml-1 hover:border-red-500 hover:text-red-500" 
          aria-label="Logout"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </header>
  );
}
