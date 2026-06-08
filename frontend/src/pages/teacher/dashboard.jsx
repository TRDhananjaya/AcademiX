import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import QuizManagement from '../../components/dashboard/QuizManagement';
import ResourceUpload from './ResourceUpload';
import TeacherNotifications from './Notification';
import CommunityMonitor from './CommunityMonitor';
import AttendanceMonitor from './AttendanceMonitor';

export default function Dashboard({ activeTab = 'dashboard' }) {
  const [activeNav, setActiveNav] = useState(activeTab);
  const [moduleFilter, setModuleFilter] = useState('All Modules');

  useEffect(() => {
    setActiveNav(activeTab);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeNav) {
      case 'quizzes':
        return <QuizManagement />;
      case 'lessons':
        return <ResourceUpload />;
      case 'notifications':
        return <TeacherNotifications />;
      case 'community':
        return <CommunityMonitor />;
      case 'attendance':
        return <AttendanceMonitor />;
      case 'dashboard':
      default:
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
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">1,248</h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  +12% this month
                </div>
              </div>

              {/* Active Modules */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Modules</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">24</h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  Across 4 subjects
                </div>
              </div>

              {/* Avg. Quiz Score */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Quiz Score</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">86%</h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  +3% from last week
                </div>
              </div>

              {/* At-Risk Students */}
              <div className="bg-white rounded-2xl p-6 border-2 border-red-500 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-red-500 text-xs font-bold uppercase tracking-wider">At-Risk Students</span>
                    <h3 className="text-3xl font-extrabold text-red-600 mt-2">12</h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                </div>
                <div className="mt-4 text-xs font-bold text-red-600">
                  Needs intervention
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
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors">
                    View All
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Insight 1 */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                    </div>
                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-800 text-sm">Midterm Exam Prediction</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Based on current trajectory, the class average is projected to be 82%. Suggest reviewing "Advanced Calculus" module to boost score.
                      </p>
                      <span className="inline-block bg-[#e0f7fa] text-[#00838f] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Action Recommended
                      </span>
                    </div>
                  </div>

                  {/* Insight 2 */}
                  <div className="bg-red-50/30 border border-red-100/60 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-sm">Intervention Alert: Physics 101</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        5 students show a 30% drop in engagement over the last week. Early intervention highly recommended.
                      </p>
                      <button className="text-red-600 hover:text-red-800 text-xs font-bold transition-colors">
                        Message Students
                      </button>
                    </div>
                  </div>
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
                    {/* Discussion 1 */}
                    <div className="group cursor-pointer">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[170px]">Struggling with Quantum...</h4>
                        <span className="text-[10px] text-slate-400">2h ago</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                        Can someone explain the superposition principle in simpler terms? The textbook...
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">12 Replies</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Needs Teacher Input</span>
                      </div>
                    </div>

                    {/* Discussion 2 */}
                    <div className="group cursor-pointer border-t border-slate-50 pt-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[170px]">Study group for upcoming...</h4>
                        <span className="text-[10px] text-slate-400">5h ago</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                        Looking to form a study group for next week's lab practical. Anyone interested?
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">4 Replies</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all flex items-center justify-center">
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
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all cursor-pointer"
                  >
                    <option>All Modules</option>
                    <option>Advanced Calculus</option>
                    <option>Physics 101</option>
                    <option>Intro to Computer Science</option>
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
                    
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          AS
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Alice Smith</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 text-sm">88%</td>
                      <td className="p-4 font-bold text-emerald-500 text-sm">+5%</td>
                      <td className="p-4">
                        <div className="flex items-end gap-1.5 h-6">
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '30%' }}></div>
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '50%' }}></div>
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '40%' }}></div>
                          <div className="w-2.5 bg-indigo-600 rounded-t-sm animate-pulse" style={{ height: '88%' }}></div>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                          On Track
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          BJ
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Bob Johnson</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 text-sm">62%</td>
                      <td className="p-4 font-bold text-red-500 text-sm">-12%</td>
                      <td className="p-4">
                        <div className="flex items-end gap-1.5 h-6">
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '60%' }}></div>
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '50%' }}></div>
                          <div className="w-2.5 bg-slate-100 rounded-t-sm" style={{ height: '40%' }}></div>
                          <div className="w-2.5 bg-red-600 rounded-t-sm" style={{ height: '25%' }}></div>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className="bg-red-50 text-red-500 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                          At Risk
                        </span>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
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
