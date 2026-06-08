import { useState } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { TbAlertTriangle, TbFileText, TbMessageShare, TbCalendarStats } from 'react-icons/tb';

export default function TeacherNotifications() {
  const [activeFilter, setActiveFilter] = useState('All');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      category: 'Academic Alerts',
      badgeLabel: 'Academic Alert',
      badgeClass: 'bg-red-50 text-red-600',
      time: '10 mins ago',
      title: '5 Students at risk in Physics 101',
      body: 'Recent midterm scores for 5 students have fallen below the 60% threshold. Intervention is recommended.',
      actionLabel: 'View Student Profiles',
      unread: true,
      icon: (
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <TbAlertTriangle className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 2,
      category: 'Student Activity',
      badgeLabel: 'Student Activity',
      badgeClass: 'bg-purple-50 text-purple-600',
      time: '1 hour ago',
      title: 'Quiz results for Module 3 available',
      body: 'The automated grading for Module 3 Quiz is complete. The class average is 82%.',
      actionLabel: 'View Analytics',
      unread: true,
      icon: (
        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
          <TbFileText className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 3,
      category: 'Student Activity',
      badgeLabel: 'Student Activity',
      badgeClass: 'bg-slate-100 text-slate-600',
      time: '3 hours ago',
      title: 'New question in Community Hub',
      body: 'Sarah Jenkins posted a new question regarding the upcoming assignment criteria in the Advanced Calculus hub.',
      actionLabel: 'Reply to Thread',
      unread: false,
      icon: (
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <TbMessageShare className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 4,
      category: 'Academic Alerts',
      badgeLabel: 'Academic Alert',
      badgeClass: 'bg-[#e0f2f1] text-[#00695c]',
      time: 'Yesterday',
      title: 'Class attendance low today',
      body: 'Attendance for Intro to Computer Science dropped below 70% during today\'s morning lecture.',
      unread: false,
      icon: (
        <div className="w-10 h-10 rounded-full bg-[#e0f2f1] text-[#00695c] flex items-center justify-center shrink-0">
          <TbCalendarStats className="w-5 h-5" />
        </div>
      )
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifications = activeFilter === 'All'
    ? notifications
    : notifications.filter((n) => n.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notification Center</h1>
          <p className="text-slate-500 text-base">
            Manage your academic alerts and system updates.
          </p>
        </div>
        
        {notifications.some((n) => n.unread) && (
          <button 
            onClick={handleMarkAllRead}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FiCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1">
        {['All', 'Academic Alerts', 'Student Activity', 'System Updates'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
              ${activeFilter === filter
                ? 'bg-[#3b28cc] text-white shadow-sm'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notification Items */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative rounded-2xl p-6 border transition-all duration-200 bg-white shadow-sm
                ${notif.unread
                  ? 'border-indigo-100 shadow-sm bg-indigo-50/5'
                  : 'border-slate-100/70'
                }`}
            >
              {/* Blue dot for unread status */}
              {notif.unread && (
                <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              )}

              <div className="flex items-start gap-4">
                {notif.icon}

                <div className="flex-1 pr-6">
                  {/* Badge & Time Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${notif.badgeClass}`}>
                      {notif.badgeLabel}
                    </span>
                    <span className="text-slate-400 text-xs">{notif.time}</span>
                  </div>

                  {/* Title & Body */}
                  <h3 className={`text-xl font-bold mb-2 leading-snug
                    ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3">
                    {notif.body}
                  </p>

                  {/* Action Link */}
                  {notif.actionLabel && (
                    <a 
                      href="#" 
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 group transition-colors"
                    >
                      {notif.actionLabel}
                      <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center shadow-sm">
            <p className="text-slate-500 text-sm">No notifications found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
