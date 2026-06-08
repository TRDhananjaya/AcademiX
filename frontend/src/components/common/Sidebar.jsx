import { useState } from 'react';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'Resources',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4V16C13 16.5523 12.5523 17 12 17H4C3.44772 17 3 16.5523 3 16V4Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 5H15C15.5523 5 16 5.44772 16 6V18C16 18.5523 15.5523 19 15 19H7C6.44772 19 6 18.5523 6 18V17" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="6" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 9.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 13L13 14L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'quiz-report',
    label: 'Quiz Report',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 7H17" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 3V7" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="9.5" width="3" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1"/>
        <rect x="11" y="9.5" width="3" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1"/>
        <rect x="6" y="13.5" width="3" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 7L11 11L8 8L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="15" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="11" cy="11" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'community',
    label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 16C2 13.2386 4.23858 11 7 11C9.76142 11 12 13.2386 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 14C12 12.3431 13.3431 11 15 11C16.6569 11 18 12.3431 18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function Sidebar({ activeItem = 'quizzes', onNavigate }) {
  return (
    <aside className="fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex-col z-40 overflow-y-auto hidden md:flex md:w-[72px] lg:w-[240px]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 p-[20px_12px_16px] md:justify-center lg:p-[24px_24px_20px] lg:justify-start">
        <img src="/logo.png" alt="AcademiX" className="w-auto h-7 lg:h-9" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 lg:p-[8px_12px] flex-1">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`flex items-center gap-3 rounded-[10px] bg-transparent cursor-pointer text-[14.5px] transition-all relative text-left w-full p-[11px] md:justify-center lg:justify-start lg:p-[11px_16px]
                ${isActive 
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold before:content-[""] before:absolute before:left-[-8px] lg:before:left-[-12px] before:top-1.5 before:bottom-1.5 before:w-[3.5px] before:rounded-r-md before:bg-indigo-500' 
                  : 'font-medium text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600'
                }
              `}
              onClick={() => {
                if (item.id === 'quiz-report') {
                  window.history.pushState({}, '', '/quiz-report');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                } else if (item.id === 'quizzes') {
                  window.history.pushState({}, '', '/teacher/dashboard');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                } else if (item.id === 'analytics') {
                  window.history.pushState({}, '', '/analytics');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
                onNavigate?.(item.id);
              }}
              id={`nav-${item.id}`}
            >
              <span className="flex items-center justify-center w-[22px] h-[22px] shrink-0">{item.icon}</span>
              <span className="whitespace-nowrap hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100 flex items-center gap-3 justify-center lg:p-[20px_24px] lg:justify-start">
        <img src="https://i.pravatar.cc/150?img=44" alt="Dr. Sarah Jenkins" className="w-10 h-10 rounded-full" />
        <div className="flex-col hidden lg:flex">
          <span className="text-[14px] font-semibold text-slate-800">Dr. Sarah Jenkins</span>
          <span className="text-[12px] text-slate-500">Department Head</span>
        </div>
      </div>
    </aside>
  );
}
