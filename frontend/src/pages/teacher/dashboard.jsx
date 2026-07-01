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
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // setActiveNav(activeTab); // fixed lint error
  }, [activeTab]);

  // Fetch available lessons/modules for the selector dropdown
  useEffect(() => {
    const fetchLessonsList = async () => {
      try {
        const res = await fetch('/api/analytics/lessons');
        if (res.ok) {
          const data = await res.json();
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error('Error fetching lessons list:', err);
      }
    };
    fetchLessonsList();
  }, []);



  // Fetch dashboard stats dynamically on mount and when filter/page changes
  useEffect(() => {
    if (activeNav !== 'dashboard') return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const moduleParam = moduleFilter !== 'All Modules' ? `&module=${encodeURIComponent(moduleFilter)}` : '';
        const res = await fetch(`/api/analytics/teacher-dashboard?page=${currentPage}&limit=5${moduleParam}`);
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [moduleFilter, currentPage, activeNav]);

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
        if (loading) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Students */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                      {metrics?.totalStudents !== undefined ? metrics.totalStudents : '--'}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-slate-500">
                  Registered profiles
                </div>
              </div>

              {/* Active Modules */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Modules</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                      {metrics?.activeModules !== undefined ? metrics.activeModules : '--'}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  Total quizzes configured
                </div>
              </div>

              {/* Avg. Quiz Score */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Quiz Score</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                      {metrics?.classAverage !== undefined ? `${metrics.classAverage}%` : '--'}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-slate-500">
                  Classroom average performance
                </div>
              </div>

              {/* At-Risk Students */}
              <div className={`bg-white rounded-2xl p-6 ${atRiskBorder} flex flex-col justify-between relative overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`${atRiskLabelColor} text-xs font-bold uppercase tracking-wider`}>At-Risk Students</span>
                    <h3 className={`text-3xl font-extrabold ${atRiskTextColor} mt-2`}>
                      {atRiskCount}
                    </h3>
                  </div>
                  <div className={`w-9 h-9 rounded-lg bg-red-50 ${atRiskTextColor} flex items-center justify-center shrink-0`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                </div>
                <div className={`mt-4 text-xs font-bold ${atRiskTextColor}`}>
                  {atRiskCount > 0 ? 'Needs immediate intervention' : 'All students on track'}
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
                      AI-driven forecasts based on recent module engagement.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/exam-prediction')}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors"
                  >
                    View All
                  </button>
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
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={iconColor}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
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

            {/* Bottom Section (Student Progress Tracker) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900">Student Progress Tracker</h3>
                
                <div className="relative">
                  <select 
                    value={moduleFilter}
                    onChange={(e) => {
                      setModuleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option>All Modules</option>
                    {lessons.map((lesson, idx) => (
                      <option key={idx} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                      <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Quiz</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Improvement</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress Trend</th>
                      <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData?.studentTracker && dashboardData.studentTracker.length > 0 ? (
                      dashboardData.studentTracker.map((student) => {
                        const isAtRisk = student.status === 'At Risk';
                        const statusBg = isAtRisk ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-600';
                        const statusLabel = isAtRisk ? 'At Risk' : 'On Track';
                        const improvementColor = student.improvement >= 0 ? 'text-emerald-500' : 'text-red-500';
                        const improvementSign = student.improvement >= 0 ? '+' : '';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${student.color || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                                {student.initials}
                              </div>
                              <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                            </td>
                            <td className="p-4 font-semibold text-slate-800 text-sm">
                              {student.recentScore !== null ? `${student.recentScore}%` : '--'}
                            </td>
                            <td className={`p-4 font-bold ${improvementColor} text-sm`}>
                              {student.recentScore !== null ? `${improvementSign}${student.improvement}%` : '--'}
                            </td>
                            <td className="p-4">
                              <div className="flex items-end gap-1.5 h-6">
                                {student.trend.map((val, i) => (
                                  <div 
                                    key={i} 
                                    className={`w-2.5 rounded-t-sm ${
                                      i === 3 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-200'
                                    }`} 
                                    style={{ height: `${Math.max(10, val)}%` }}
                                    title={`Score: ${val}%`}
                                  ></div>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <span className={`${statusBg} text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider`}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-slate-400 font-medium">
                          No student records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-medium font-sans">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
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
