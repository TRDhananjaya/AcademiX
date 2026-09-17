import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../App';
import ConfirmModal from '../common/ConfirmModal';
import propic from '../../assets/propic.png';
import favicon from '../../assets/favicon.png';

const studentNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/student/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'Lessons',
    path: '/student/lessons',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4V16C13 16.5523 12.5523 17 12 17H4C3.44772 17 3 16.5523 3 16V4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 5H15C15.5523 5 16 5.44772 16 6V18C16 18.5523 15.5523 19 15 19H7C6.44772 19 6 18.5523 6 18V17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    path: '/student/quizzes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v2M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'study-plans',
    label: 'Study Plans',
    path: '/student/study-plans',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5C2 3.89543 2.89543 3 4 3H16C17.1046 3 18 3.89543 18 5V15C18 16.1046 17.1046 17 16 17H4C2.89543 17 2 16.1046 2 15V5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 3V17" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7H14M10 11H14M10 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'community',
    label: 'Community',
    path: '/student/community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 16C2 13.2386 4.23858 11 7 11C9.76142 11 12 13.2386 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 14C12 12.3431 13.3431 11 15 11C16.6569 11 18 12.3431 18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/student/notifications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile Settings',
    path: '/student/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

export default function StudentTopBar() {
  const { user, setUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const currentPath = window.location.pathname;
  const avatarSrc = user?.profilePicture || propic;
  const avatarAlt = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Student';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Student';

  return (
    <>
      <header className="flex items-center justify-between p-[10px_16px] md:p-[14px_40px] bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        {/* Mobile Left: Hamburger Button & AcademiX Logo */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer active:scale-95 border border-slate-200/60"
            aria-label="Open Navigation Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div 
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img src={favicon} alt="AcademiX" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[17px] tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              AcademiX
            </span>
          </div>
        </div>

        {/* Desktop Spacer */}
        <div className="hidden md:block"></div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button 
            onClick={() => navigate('/student/notifications')}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-none bg-slate-50 text-slate-600 cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 relative" 
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-[10px] right-[10px] w-[8px] h-[8px] bg-indigo-600 rounded-full border border-white flex items-center justify-center animate-pulse"></span>
          </button>

          {/* User Avatar */}
          <button 
            onClick={() => navigate('/student/profile')}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-100 p-0 overflow-hidden active:scale-95" 
            aria-label="User profile"
          >
            <img src={avatarSrc} alt={avatarAlt} className="w-full h-full object-cover" />
          </button>

          {/* Logout */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center h-[38px] px-2.5 sm:px-3.5 rounded-full border border-red-200 bg-red-50/30 text-red-600 font-medium cursor-pointer transition-all duration-200 hover:border-red-400 hover:bg-red-50 active:scale-95 gap-1.5 shadow-xs" 
            aria-label="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="text-[13px] tracking-wide hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-in slide-in-from-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <img src={favicon} alt="AcademiX" className="w-8 h-8 object-contain" />
                <div>
                  <span className="font-bold text-[17px] text-slate-800 tracking-tight">AcademiX</span>
                  <span className="block text-[11px] font-semibold text-indigo-600">Student Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close Navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* User Profile Card */}
            <div 
              onClick={() => {
                navigate('/student/profile');
                setIsMobileMenuOpen(false);
              }}
              className="p-3.5 m-3 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/40 border border-indigo-100/70 flex items-center gap-3 cursor-pointer hover:border-indigo-200 transition-all"
            >
              <img src={avatarSrc} alt={fullName} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-slate-800 truncate">{fullName}</p>
                <p className="text-[12px] text-indigo-600 font-medium">{user?.email || 'Student'}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
              {studentNavItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-all text-left cursor-pointer border-none ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/40">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium text-[14px] transition-colors border border-red-200/60 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Stay"
        variant="danger"
      />
    </>
  );
}
