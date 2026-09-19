import { useState, useEffect } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { TbAlertTriangle, TbFileText, TbMessageShare, TbBrain } from 'react-icons/tb';
import { navigate } from '../../App';

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotifs, setExpandedNotifs] = useState({});

  const toggleExpand = (id) => {
    setExpandedNotifs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
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

        // Fetch dynamic quiz results
        let notifs2 = [];
        const res2 = await fetch('/api/quiz-results');
        if (res2.ok) {
          const data = await res2.json();
          if (Array.isArray(data)) {
            notifs2 = data.map(item => ({
              _id: `quiz-result-${item._id}`,
              isQuizResult: true,
              notificationType: 'Quiz Results',
              title: `Quiz Completed: ${item.quizTitle || item.quizId}`,
              message: `Student: ${item.studentName} (${item.studentId}) • Score: ${item.percentage}% (${item.correctAnswers ?? item.score}/${item.totalQuestions} correct). Time taken: ${item.timeTaken || 'N/A'}.`,
              createdAt: item.submittedAt || new Date().toISOString(),
              actionLabel: 'Quiz Details',
              isRead: false
            }));
          }
        }

        setNotifications([...notifs1, ...notifs2].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unread = notifications.filter(n => !n.isRead && !n.isQuizResult && !n._id?.startsWith('static-'));
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

  const getIconForType = (type) => {
    switch(type) {
      case 'StudyPlanApproval':
      case 'StudyPlanGenerated':
        return <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0"><TbBrain className="w-5 h-5" /></div>;
      case 'Academic Alerts':
        return <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0"><TbAlertTriangle className="w-5 h-5" /></div>;
      case 'Student Activity':
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbMessageShare className="w-5 h-5" /></div>;
      case 'Quiz Results':
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><TbFileText className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notifications</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Stay updated with your latest academic progress and alerts.
          </p>
        </div>
        
        {notifications.some((n) => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-[#3b28cc] hover:text-indigo-800 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border-none bg-transparent"
          >
            <FiCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Items */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
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
                    <span className={`text-xs whitespace-nowrap pr-4
                      ${!notif.isRead ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {notif.message && (
                    <p className={`text-sm leading-relaxed mb-4
                      ${!notif.isRead ? 'text-slate-600' : 'text-slate-400/90'}`}>
                      {notif.message}
                    </p>
                  )}

                  {/* Action Button / Details Toggle */}
                  {notif.isQuizResult ? (
                    <div className="mt-3 space-y-3">
                      <button 
                        onClick={() => toggleExpand(notif._id)}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1 bg-white"
                      >
                        {expandedNotifs[notif._id] ? 'Hide Quiz Details' : 'Quiz Details'}
                        <FiArrowRight className={`w-3.5 h-3.5 transition-transform ${expandedNotifs[notif._id] ? 'rotate-90' : ''}`} />
                      </button>

                      {expandedNotifs[notif._id] && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                          <p className="text-sm font-semibold text-slate-700">{notif.message}</p>
                          <button
                            onClick={() => navigate('/teacher/quiz-report')}
                            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer inline-block mt-1 bg-transparent border-none p-0"
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
                        className="bg-[#3b28cc] hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors inline-block cursor-pointer border-none"
                      >
                        {notif.actionLabel}
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
