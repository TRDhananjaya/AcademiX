import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import QuizManagement from '../../components/dashboard/QuizManagement';
import ResourceUpload from './ResourceUpload';
import TeacherNotifications from './Notification';
import CommunityMonitor from './CommunityMonitor';
import AttendanceMonitor from './AttendanceMonitor';
import QuizReportContent from '../../components/dashboard/QuizReportContent';
import { navigate } from '../../App';

export default function Dashboard({ activeTab = 'dashboard' }) {
  const [activeNav, setActiveNav] = useState(activeTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    setActiveNav(activeTab);
  }, [activeTab]);

  // Fetch dashboard stats dynamically on mount
  useEffect(() => {
    if (activeNav !== 'dashboard') return;

    const fetchStats = async () => {
      try {
        if (!dashboardData) setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/analytics/teacher-dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeNav]);

  const renderContent = () => {
    switch (activeNav) {
      case 'quizzes':
        return <QuizManagement />;
      case 'quiz-report':
        return <QuizReportContent />;
      case 'lessons':
        return <ResourceUpload />;
      case 'notifications':
        return <TeacherNotifications />;
      case 'community':
        return <CommunityMonitor />;
      case 'attendance':
        return <AttendanceMonitor />;
      case 'dashboard':
      default: {
        if (loading && !dashboardData) {
          return (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium font-sans">Analyzing classroom data...</p>
            </div>
          );
        }

        const metrics = dashboardData?.metrics;
        const atRiskCount = metrics?.atRiskCount || 0;
        const atRiskBorder = atRiskCount > 0 ? 'border-2 border-red-500 shadow-md animate-pulse' : 'border border-slate-100 shadow-sm';
        const atRiskTextColor = atRiskCount > 0 ? 'text-red-600' : 'text-slate-900';
        const atRiskLabelColor = atRiskCount > 0 ? 'text-red-500' : 'text-slate-400';

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Teacher Dashboard</h1>
              <p className="text-slate-500 text-base">
                Welcome back. Here's what's happening with your students today.
              </p>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Total Students */}
              <div
                onClick={() => navigate('/teacher/students')}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-300 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-200 group"
                title="View Student Management"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Total Students</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                      {metrics?.totalStudents !== undefined ? metrics.totalStudents : '--'}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {metrics?.activeStudents !== undefined ? metrics.activeStudents : (metrics?.totalStudents || 0)} active enrolled
                  </span>
                  {metrics?.inactiveStudents > 0 ? (
                    <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">{metrics.inactiveStudents} inactive</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">All active</span>
                  )}
                </div>
              </div>

              {/* Today's Attendance */}
              <div
                onClick={() => setActiveNav('attendance')}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-200 group"
                title="View Live QR Attendance Monitor"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Today's Attendance</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                      {metrics?.todayPresentCount || 0}
                      <span className="text-lg text-slate-400 font-bold">
                        /{metrics?.activeStudents !== undefined ? metrics.activeStudents : (metrics?.totalStudents || 0)}
                      </span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {(metrics?.activeStudents || metrics?.totalStudents) > 0
                      ? `${Math.round(((metrics?.todayPresentCount || 0) / (metrics?.activeStudents || metrics.totalStudents)) * 100)}% present today`
                      : 'No active students'}
                  </span>
                  {metrics?.inactiveStudents > 0 && (
                    <span className="text-slate-400 text-[11px]">({metrics.inactiveStudents} inactive)</span>
                  )}
                </div>
              </div>

              {/* At-Risk Students */}
              <div
                onClick={() => navigate('/teacher/students')}
                className={`bg-white rounded-2xl p-6 ${atRiskBorder} hover:shadow-md hover:border-red-300 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-200 group`}
                title="View At-Risk Students"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`${atRiskLabelColor} text-xs font-bold uppercase tracking-wider group-hover:text-red-600 transition-colors`}>At-Risk Students</span>
                    <h3 className={`text-3xl font-extrabold ${atRiskTextColor} mt-2`}>
                      {atRiskCount}
                    </h3>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${atRiskCount > 0 ? 'bg-red-100' : 'bg-red-50'} ${atRiskTextColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                </div>
                <div className={`mt-4 pt-3 border-t border-slate-50 text-xs font-bold ${atRiskTextColor} flex items-center justify-between`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${atRiskCount > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
                    {atRiskCount > 0 ? 'Needs immediate intervention' : 'All students on track'}
                  </span>
                </div>
              </div>

            </div>

            {/* Middle Columns (Predictive Insights & Community Activity) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Predictive Insights */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-indigo-600">✨</span> Predictive Insights
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Data-driven forecasts based on recent quiz performance.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {dashboardData?.insights && dashboardData.insights.length > 0 ? (
                    dashboardData.insights.map((insight, idx) => {
                      const isMidterm = insight.type === 'midterm-projection';
                      const iconBg = isMidterm ? 'bg-indigo-50' : 'bg-red-50';
                      const iconColor = isMidterm ? 'text-indigo-600' : 'text-red-500';
                      const alertBg = isMidterm ? 'bg-slate-50/70 border border-slate-100' : 'bg-red-50/30 border border-red-100/60';

                      return (
                        <div key={idx} className={`${alertBg} rounded-2xl p-5 flex items-start gap-4`}>
                          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                            {isMidterm ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={iconColor}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={iconColor}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            )}
                          </div>
                          <div className="space-y-2.5">
                            <h4 className="font-bold text-slate-800 text-sm">{insight.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {insight.description}
                            </p>
                            {insight.actionRecommended ? (
                              <span className="inline-block bg-[#e0f7fa] text-[#00838f] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                Action Recommended
                              </span>
                            ) : (
                              <button
                                onClick={() => setActiveNav('notifications')}
                                className="text-red-600 hover:text-red-800 text-xs font-bold transition-colors"
                              >
                                {insight.actionText || 'Message Students'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium">
                      No analytical projections available.
                    </div>
                  )}
                </div>
              </div>

              {/* Community Activity */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Community Activity
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Recent discussions needing guidance.
                  </p>

                  <div className="space-y-5">
                    {dashboardData?.communityActivity && dashboardData.communityActivity.length > 0 ? (
                      dashboardData.communityActivity.map((post, index) => (
                        <div key={post.id} className={`group cursor-pointer ${index > 0 ? 'border-t border-slate-50 pt-4' : ''}`} onClick={() => setActiveNav('community')}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[170px]">{post.title}</h4>
                            <span className="text-[10px] text-slate-400">{post.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                            {post.body}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">{post.repliesCount} Replies</span>
                            {post.needsTeacherInput && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Needs Teacher Input</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        No recent discussion posts.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveNav('community')}
                  className="w-full mt-6 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all flex items-center justify-center"
                >
                  Go to Forums
                </button>
              </div>

            </div>

          </div>
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
