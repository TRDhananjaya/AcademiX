import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../App';
import ConfirmModal from '../common/ConfirmModal';
import propic from '../../assets/propic.png';

export default function StudentTopBar() {
  const { user, setUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const avatarSrc = user?.profilePicture || propic;
  const avatarAlt = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Student';

  return (
    <>
      <header className="flex items-center justify-end gap-5 p-[12px_16px] md:p-[14px_40px] bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
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
            className="flex items-center justify-center w-[40px] h-[40px] rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-100 p-0 overflow-hidden active:scale-95" 
            aria-label="User profile"
          >
            <img src={avatarSrc} alt={avatarAlt} className="w-full h-full object-cover" />
          </button>

          {/* Logout */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center h-[38px] px-3.5 rounded-full border border-red-200 bg-red-50/30 text-red-600 font-medium cursor-pointer transition-all duration-200 ml-1 hover:border-red-400 hover:bg-red-50 active:scale-95 gap-1.5 shadow-sm" 
            aria-label="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="text-[13px] tracking-wide">Logout</span>
          </button>
        </div>
      </header>

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
