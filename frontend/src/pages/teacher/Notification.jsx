import { useState, useEffect } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { TbAlertTriangle, TbFileText, TbMessageShare, TbCalendarStats, TbBrain } from 'react-icons/tb';
import { navigate } from '../../App';

export default function TeacherNotifications() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [expandedNotifs, setExpandedNotifs] = useState({});

  const toggleExpand = (id) => {
    setExpandedNotifs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch dynamic notifications from /api/notifications
      const res1 = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let notifs1 = [];
      if (res1.ok) {
        notifs1 = await res1.json();
      }

      // Fetch dynamic quiz results (from main branch)
      let notifs2 = [];
      const res2 = await fetch('/api/quiz-results');
      if (res2.ok) {
        const data = await res2.json();
        if (Array.isArray(data)) {
          notifs2 = data.map(item => ({
            _id: `quiz-result-${item._id}`,
            isQuizResult: true,
            notificationType: 'Quiz Results',
            badgeLabel: 'Quiz Result',
            badgeClass: item.percentage >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
            createdAt: item.submittedAt || new Date().toISOString(),
            title: `${item.studentName} completed ${item.quizTitle || item.quizId}`,
            message: `Student ID: ${item.studentId} • Score: ${item.percentage}% (${item.correctAnswers ?? item.score}/${item.totalQuestions} correct) • Time: ${item.timeTaken || 'N/A'}`,
            actionLabel: 'Quiz Details',
            actionPath: '/teacher/quiz-report',
            isRead: false
          }));
        }
      }

      // Add static notifications for presentation
      const staticNotifs = [
        {
          _id: 'static-1',
          notificationType: 'Academic Alerts',
          badgeLabel: 'Academic Alert',
          badgeClass: 'bg-red-50 text-red-600',
          createdAt: new Date(Date.now() - 10*60000).toISOString(),
          title: '5 Students at risk in Physics 101',
          message: 'Recent midterm scores for 5 students have fallen below the 60% threshold. Intervention is recommended.',
          actionLabel: 'View Student Profiles',
          actionPath: '/teacher/students',
          isRead: false,
        },
        {
          _id: 'static-3',
          notificationType: 'Student Activity',
          badgeLabel: 'Student Activity',
          badgeClass: 'bg-slate-100 text-slate-600',
          createdAt: new Date(Date.now() - 3*3600000).toISOString(),
          title: 'New question in Community Hub',
          message: 'Sarah Jenkins posted a new question regarding the upcoming assignment criteria in the Advanced Calculus hub.',
          actionLabel: 'Reply to Thread',
          actionPath: '/teacher/community',
          isRead: true,
        },
      ];

      setNotifications([...notifs1, ...notifs2, ...staticNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unread = notifications.filter(n => !n.isRead && !n.isQuizResult && !n._id.startsWith('static-'));
      for (const notif of unread) {
        if (notif._id) {
          await fetch(`/api/notifications/${notif._id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      setApproving(id);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(notifications.map((n) => 
          n._id === id ? { ...n, status: 'Approved', isRead: true } : n
        ));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving study plan:', error);
      alert('Error approving study plan');
    } finally {
      setApproving(null);
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'StudyPlanApproval':
        return <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"><TbBrain className="w-5 h-5" /></div>;
      case 'Academic Alerts':
        return <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0"><TbAlertTriangle className="w-5 h-5" /></div>;
      case 'Student Activity':
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbMessageShare className="w-5 h-5" /></div>;
      case 'Quiz Results':
        return <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><TbFileText className="w-5 h-5" /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbFileText className="w-5 h-5" /></div>;
    }
  };

  const filteredNotifications = activeFilter === 'All'
    ? notifications
    : notifications.filter((n) => n.notificationType === activeFilter);

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
        
        {notifications.some((n) => !n.isRead) && (
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
        {['All', 'StudyPlanApproval', 'Quiz Results', 'Academic Alerts', 'Student Activity', 'System Updates'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
              ${activeFilter === filter
                ? 'bg-[#3b28cc] text-white shadow-sm'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            {filter === 'StudyPlanApproval' ? 'Approvals' : filter}
          </button>
        ))}
      </div>

      {/* Notification Items */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500">Loading notifications...</p>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`relative rounded-2xl p-6 border transition-all duration-200 bg-white shadow-sm
                ${!notif.isRead
                  ? 'border-indigo-100 shadow-sm bg-indigo-50/5'
                  : 'border-slate-100/70'
                }`}
            >
              {/* Blue dot for unread status */}
              {!notif.isRead && (
                <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              )}

              <div className="flex items-start gap-4">
                {getIconForType(notif.notificationType)}

                <div className="flex-1 pr-6">
                  {/* Badge & Time Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${notif.badgeClass || 'bg-indigo-50 text-indigo-600'}`}>
                      {notif.badgeLabel || notif.notificationType}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Title & Body */}
                  <h3 className={`text-xl font-bold mb-2 leading-snug
                    ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h3>
                  
                  {notif.message && (
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">
                      {notif.message}
                    </p>
                  )}

                  {/* Actions */}
                  {notif.notificationType === 'StudyPlanApproval' && notif.status === 'Pending' && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(notif._id)}
                        disabled={approving === notif._id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {approving === notif._id ? 'Approving...' : 'Approve Plan Generation'}
                      </button>
                    </div>
                  )}
                  {notif.notificationType === 'StudyPlanApproval' && notif.status === 'Approved' && (
                    <div className="flex gap-3 mt-4">
                      <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1">
                        <FiCheck /> Approved
                      </span>
                    </div>
                  )}

                  {/* Action Link / Details Toggle */}
                  {notif.isQuizResult ? (
                    <div className="mt-3 space-y-3">
                      <button 
                        onClick={() => toggleExpand(notif._id)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 group transition-colors cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                      >
                        {expandedNotifs[notif._id] ? 'Hide Quiz Details' : 'Quiz Details'}
                        <FiArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedNotifs[notif._id] ? 'rotate-90' : ''}`} />
                      </button>

                      {expandedNotifs[notif._id] && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                          <p className="text-sm font-semibold text-slate-700">{notif.message}</p>
                          <button
                            onClick={() => navigate('/teacher/quiz-report')}
                            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer inline-block mt-1"
                          >
                            View Full Quiz Report &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    notif.actionLabel && (
                      <button 
                        onClick={() => notif.actionPath && navigate(notif.actionPath)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 group transition-colors cursor-pointer mt-2"
                      >
                        {notif.actionLabel}
                        <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )
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
