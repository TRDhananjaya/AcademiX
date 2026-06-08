import { useState } from 'react';
import { navigate } from '../../../App';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
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
    badge: '3',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2C7.23858 2 5 4.23858 5 7V10.5858L3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13V14C3 14.5523 3.44772 15 4 15H16C16.5523 15 17 14.5523 17 14V13C17 12.7348 16.8946 12.4804 16.7071 12.2929L15 10.5858V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeItem = 'dashboard', onNavigate }) {
  return (
    <aside className="fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex-col z-40 overflow-y-auto hidden md:flex md:w-[72px] lg:w-[240px]">
      {/* Logo */}
      <div className="flex items-center gap-2 p-[20px_12px_16px] md:justify-center lg:p-[28px_24px_24px] lg:justify-start">
        <img src="/src/assets/favicon.png" alt="AcademiX" className="w-8 h-8 object-contain" />
        <img src="/src/assets/logo_black.png" alt="AcademiX" className="h-[64px] object-contain hidden lg:block" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 lg:p-[8px_12px] flex-1">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`flex items-center justify-between rounded-[10px] bg-transparent cursor-pointer text-[14.5px] transition-all relative text-left w-full p-[11px] md:justify-center lg:justify-start lg:p-[11px_16px]
                ${isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold before:content-[""] before:absolute before:left-[-8px] lg:before:left-[-12px] before:top-1.5 before:bottom-1.5 before:w-[3.5px] before:rounded-r-md before:bg-indigo-600'
                  : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }
              `}
              onClick={() => {
                if (item.id === 'dashboard') {
                  navigate('/student/dashboard');
                } else if (item.id === 'study-plans') {
                  navigate('/student/study-plans');
                } else if (item.id === 'lessons') {
                  navigate('/student/lessons');
                } else if (item.id === 'quizzes') {
                  navigate('/student/quizzes');
                }
                onNavigate?.(item.id);
              }}
              id={`nav-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-[22px] h-[22px] shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap hidden lg:block">{item.label}</span>
              </div>
              {item.badge && (
                <span className="hidden lg:flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
