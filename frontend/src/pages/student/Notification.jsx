import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { FiSliders, FiCheck, FiArrowRight, FiPlay, FiBookOpen } from 'react-icons/fi';
import { TbRobot, TbFileText, TbCalendarEvent, TbBrain } from 'react-icons/tb';

export default function Notifications() {
  const [activeNav, setActiveNav] = useState('notifications');
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unread = notifications.filter(n => !n.isRead);
      for (const notif of unread) {
        await fetch(`/api/notifications/${notif._id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const filteredNotifications = activeFilter === 'All' 
    ? notifications 
    : notifications.filter(n => n.notificationType === activeFilter);

  const getIconForType = (type) => {
    switch(type) {
      case 'StudyPlanGenerated':
        return <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"><TbBrain className="w-5 h-5" /></div>;
      case 'AI Recommendations':
        return <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"><TbRobot className="w-5 h-5" /></div>;
      case 'Attendance':
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbCalendarEvent className="w-5 h-5" /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbFileText className="w-5 h-5" /></div>;
    }
  };

  // Stats for the Weekly Overview
  const stats = [
    { label: 'Quiz Average', value: '88%', percentage: 88, color: 'bg-indigo-600' },
    { label: 'Attendance', value: '95%', percentage: 95, color: 'bg-indigo-600' },
    { label: 'Tasks Completed', value: '12/15', percentage: 80, color: 'bg-teal-500' },
  ];

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Notifications</h1>
              <p className="text-slate-500 text-base max-w-2xl">
                Stay updated with your latest academic progress and alerts.
              </p>
            </div>
            
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[#3b28cc] hover:text-indigo-800 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <FiCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {['All', 'StudyPlanGenerated', 'Quiz Results', 'Attendance'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${activeFilter === filter
                    ? 'bg-[#3b28cc] text-white shadow-sm'
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                {filter === 'StudyPlanGenerated' ? 'Study Plans' : filter}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column (Notifications List) */}
            <div className="flex-1 space-y-4">
              {loading ? (
                <p className="text-slate-500">Loading notifications...</p>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`relative rounded-2xl p-6 border transition-all duration-200 bg-white
                      ${!notif.isRead
                        ? 'border-indigo-100 shadow-sm border-l-4 border-l-indigo-600'
                        : 'border-slate-100/70 shadow-sm opacity-90'
                      }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <span className="absolute top-6 right-6 w-2 h-2 rounded-full bg-cyan-500"></span>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon container */}
                      {getIconForType(notif.notificationType)}

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 mb-1">
                          <h3 className={`text-base font-bold leading-snug truncate
                            ${!notif.isRead ? 'text-slate-900' : 'text-slate-400'}`}>
                            {notif.title}
                          </h3>
                          <span className={`text-xs whitespace-nowrap
                            ${!notif.isRead ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className={`text-sm leading-relaxed mb-4
                          ${!notif.isRead ? 'text-slate-600' : 'text-slate-400/90'}`}>
                          {notif.message}
                        </p>

                        {/* Action Button */}
                        {notif.notificationType === 'StudyPlanGenerated' && (
                          <a href="/student/study-plans" className="bg-[#3b28cc] hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors inline-block">
                            Review Plan
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

            {/* Right Column (Widgets) */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
              
              {/* Weekly Overview Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg font-bold text-slate-900">Weekly Overview</h3>
                  
                  {/* Decorative circular progress (semi-donut representation) */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        strokeWidth="3.5"
                        strokeDasharray="88, 100"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-indigo-600">88%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {stats.map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500">{stat.label}</span>
                        <span className="text-slate-800">{stat.value}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`${stat.color} h-full rounded-full`} 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customize Alerts Card */}
              <div className="rounded-2xl p-6 bg-indigo-50 border border-indigo-100 shadow-sm relative overflow-hidden">
                {/* Background decorative circles */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm border border-indigo-50">
                    <FiSliders className="text-[#3b28cc] w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">Customize Alerts</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
                    Too noisy? Choose exactly what notifications you receive and when.
                  </p>
                  
                  <a 
                    href="#settings" 
                    className="text-[#3b28cc] hover:text-indigo-800 text-sm font-bold flex items-center gap-1.5 group transition-colors"
                  >
                    Notification Settings
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
