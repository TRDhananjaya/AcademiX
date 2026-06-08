export default function TopBar() {
  return (
    <header className="flex items-center justify-end gap-5 p-[12px_16px] md:p-[14px_40px] bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="flex items-center gap-2.5 bg-slate-100/70 rounded-lg p-[9px_16px] min-w-[160px] md:min-w-[260px] transition-all border-[1.5px] border-transparent focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-[3px] focus-within:ring-indigo-500/10">
        <svg
          className="text-slate-400 shrink-0"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search quizzes, questions, or bundles..."
          className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans placeholder-slate-400"
          id="search-resources"
        />
      </div>

      <div className="flex items-center gap-1.5">
        {/* Messages */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border-none bg-transparent text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-600 relative" id="btn-messages" aria-label="Messages">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 6C5 5.44772 5.44772 5 6 5H14C14.5523 5 15 5.44772 15 6V11C15 11.5523 14.5523 12 14 12H7.41421L5 14.4142V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border-none bg-transparent text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-600 relative" id="btn-notifications" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-[8px] right-[9px] w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white flex items-center justify-center text-[9px] text-white font-bold"></span>
        </button>

        {/* User Avatar */}
        <button 
          onClick={() => {
            window.history.pushState({}, '', '/teacher/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="flex items-center justify-center w-[38px] h-[38px] rounded-full border-2 border-slate-200 bg-slate-50 text-slate-500 cursor-pointer transition-all ml-1 hover:border-indigo-500 hover:text-indigo-500 p-0 overflow-hidden" 
          id="btn-user-profile" 
          aria-label="User profile"
        >
          <img src="https://i.pravatar.cc/150?img=47" alt="User Profile" className="w-full h-full object-cover" />
        </button>
        {/* Logout */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // To handle auth context and navigation properly we trigger a custom event or rely on App.js routing
              // Since useAuth is not currently imported here, let's just clear storage and redirect
              window.location.href = '/login';
            }
          }}
          className="hidden lg:flex items-center justify-center h-[38px] px-3 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-medium cursor-pointer transition-all ml-1 hover:border-red-500 hover:text-red-500"
          aria-label="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </header>
  );
}
