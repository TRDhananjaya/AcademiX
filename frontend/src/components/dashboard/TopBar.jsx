import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../App';
import ConfirmModal from '../common/ConfirmModal';

export default function TopBar() {
  const { user, setUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const avatarSrc = user?.profilePicture || 'https://i.pravatar.cc/150?img=47';

  return (
    <>
      <header className="flex items-center justify-end gap-5 p-[12px_16px] md:p-[14px_40px] bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            onClick={() => navigate('/teacher/notifications')}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-none bg-slate-50 text-slate-600 cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 relative" 
            id="btn-notifications" 
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="absolute top-[10px] right-[10px] w-[8px] h-[8px] bg-indigo-600 rounded-full border border-white flex items-center justify-center animate-pulse"></span>
          </button>

          {/* User Avatar */}
          <button 
            onClick={() => navigate('/teacher/profile')}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-100 p-0 overflow-hidden active:scale-95" 
            id="btn-user-profile" 
            aria-label="User profile"
          >
            <img src={avatarSrc} alt="User Profile" className="w-full h-full object-cover" />
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
