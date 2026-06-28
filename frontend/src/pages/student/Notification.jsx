import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { useAuth } from '../../context/AuthContext';
import { FiSliders, FiCheck, FiArrowRight, FiPlay, FiBookOpen } from 'react-icons/fi';
import { TbRobot, TbFileText, TbCalendarEvent } from 'react-icons/tb';

export default function Notifications() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('notifications');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedNotifs, setExpandedNotifs] = useState({});

  const toggleExpand = (id) => {
    setExpandedNotifs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sample notifications data matching the mockup exactly
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'AI Recommendations',
      icon: <TbRobot className="w-5 h-5 text-indigo-600" />,
      title: 'New Learning Path Generated',
      body: 'Based on your recent quiz scores, we\'ve adjusted your calculus study plan to focus on derivatives. Our AI has curated 3 new micro-lessons for you.',
      time: 'Just now',
      unread: true,
      category: 'AI Recommendations',
      actionLabel: 'Review Plan',
      actionClass: 'bg-[#3b28cc] hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors',
    },
    {
      id: 2,
      type: 'Quiz Results',
      icon: <TbFileText className="w-5 h-5 text-indigo-600" />,
      title: 'Physics Midterm Graded',
      body: 'Your results are in. You scored 92%. Great job on the kinematics section, but review fluid dynamics.',
      time: '2 hours ago',
      unread: true,
      category: 'Quiz Results',
      actionLabel: 'View Result',
      actionClass: 'border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors',
    },
    {
      id: 3,
      type: 'Attendance',
      icon: <TbCalendarEvent className="w-5 h-5 text-slate-400" />,
      title: 'Missed Lecture Alert',
      body: 'You missed "Intro to Computer Science: Data Structures" today at 10:00 AM.',
      time: 'Yesterday',
      unread: false,
      category: 'Attendance',
      actionLabel: 'Watch Recording',
      actionIcon: <FiPlay className="w-3.5 h-3.5 mr-1.5" />,
      actionClass: 'border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg flex items-center transition-colors',
    },
    {
      id: 4,
      type: 'Study Plans',
      icon: <FiBookOpen className="w-5 h-5 text-slate-400" />,
      title: 'Upcoming Deadline',
      body: 'Your "Literature Review Essay Draft" is due in 2 days. You have completed 60% of the required reading.',
      time: 'Oct 24',
      unread: false,
      category: 'Study Plans',
      progress: 60,
      actionLabel: 'Go to Assignment',
      actionClass: 'border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors',
    }
  ]);

  useEffect(() => {
    const studentId = user?.username || 'student1';
    fetch(`/api/quiz-results/student/${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const quizNotifs = data.map(item => ({
            id: `quiz-res-${item._id}`,
            isQuizResult: true,
            type: 'Quiz Results',
            category: 'Quiz Results',
            icon: <TbFileText className="w-5 h-5 text-indigo-600" />,
            title: `Quiz Completed: ${item.quizTitle || item.quizId}`,
            details: `You scored ${item.percentage}% (${item.correctAnswers ?? item.score}/${item.totalQuestions} correct). Time taken: ${item.timeTaken || 'N/A'}.`,
            time: item.submittedAt ? new Date(item.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently',
            unread: true,
            actionLabel: 'Quiz Details',
            actionClass: 'border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer',
          }));
          setNotifications(prev => {
            const staticNotifs = prev.filter(n => typeof n.id !== 'string' || !n.id.startsWith('quiz-res-'));
            return [...quizNotifs, ...staticNotifs];
          });
        }
      })
      .catch(err => console.error('Error fetching student quiz results:', err));
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const filteredNotifications = activeFilter === 'All' 
    ? notifications 
    : notifications.filter(n => n.category === activeFilter);

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
            
            {notifications.some(n => n.unread) && (
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
            {['All', 'Quiz Results', 'Attendance', 'Study Plans', 'AI Recommendations'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
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

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column (Notifications List) */}
            <div className="flex-1 space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`relative rounded-2xl p-6 border transition-all duration-200 bg-white
                      ${notif.unread
                        ? 'border-indigo-100 shadow-sm border-l-4 border-l-indigo-600'
                        : 'border-slate-100/70 shadow-sm opacity-90'
                      }`}
                  >
                    {/* Unread indicator dot */}
                    {notif.unread && (
                      <span className="absolute top-6 right-6 w-2 h-2 rounded-full bg-cyan-500"></span>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon container */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${notif.unread ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                        {notif.icon}
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 mb-1">
                          <h3 className={`text-base font-bold leading-snug truncate
                            ${notif.unread ? 'text-slate-900' : 'text-slate-400'}`}>
                            {notif.title}
                          </h3>
                          <span className={`text-xs whitespace-nowrap
                            ${notif.unread ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                            {notif.time}
                          </span>
                        </div>

                        {notif.body && (
                          <p className={`text-sm leading-relaxed mb-4
                            ${notif.unread ? 'text-slate-600' : 'text-slate-400/90'}`}>
                            {notif.body}
                          </p>
                        )}

                        {/* Progress bar if present */}
                        {notif.progress !== undefined && (
                          <div className="max-w-md mb-5">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#3b28cc] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${notif.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Action Button / Details Toggle */}
                        {notif.isQuizResult ? (
                          <div className="mt-3 space-y-3">
                            <button 
                              onClick={() => toggleExpand(notif.id)}
                              className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {notif.actionIcon}
                              {expandedNotifs[notif.id] ? 'Hide Quiz Details' : 'Quiz Details'}
                              <FiArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedNotifs[notif.id] ? 'rotate-90' : ''}`} />
                            </button>

                            {expandedNotifs[notif.id] && (
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 animate-fadeIn">
                                <p className="text-sm font-semibold text-slate-700">{notif.details}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className={notif.actionClass}>
                            {notif.actionIcon}
                            {notif.actionLabel}
                          </button>
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
