import { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { useAuth } from '../../context/AuthContext';

const performanceData = [
  { day: 'Mon', score: 35 },
  { day: 'Tue', score: 55 },
  { day: 'Wed', score: 75 },
  { day: 'Thu', score: 100 },
  { day: 'Fri', score: 85 }
];

export default function StudyPlans() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('study-plans');

  return (
    <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="study-plans-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-[34px] font-bold text-indigo-700 mb-1.5 tracking-tight">
              Ready to crush your goals, {user ? (user.firstName || user.username) : 'Student'}?
            </h1>
            <p className="text-slate-500 text-base">
              Here is your AI-curated study roadmap for today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* AI Study Plan Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden flex flex-col">
              
              {/* Background Gradient Blob */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-fuchsia-100 opacity-60 rounded-bl-full blur-3xl pointer-events-none transform translate-x-10 -translate-y-10"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="text-indigo-600 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18M3 12h18M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" strokeOpacity="0.2"/>
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                    <h2 className="text-[22px] font-bold text-slate-800">Your AI Study Plan</h2>
                  </div>
                  <p className="text-slate-500 text-[15px]">Focused on Weak Areas: Advanced Calculus</p>
                </div>
                
                <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-200"></span>
                  Active
                </div>
              </div>

              {/* Tasks List */}
              <div className="relative z-10 space-y-4 mt-2">
                
                {/* Task 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0 z-10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div className="w-[1.5px] h-full bg-slate-200 mt-2 mb-1"></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 flex justify-between items-center group cursor-pointer hover:bg-indigo-50/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-[15px]">Review Short Notes</h4>
                      <p className="text-sm text-slate-500 mt-0.5">Derivatives & Integrals (15 min)</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-9 h-9 rounded-full bg-white border-[2px] border-indigo-400 text-indigo-500 flex items-center justify-center shrink-0 z-10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 flex justify-between items-center group cursor-pointer hover:bg-indigo-50/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-[15px]">Practice Questions</h4>
                      <p className="text-sm text-slate-500 mt-0.5">10 Adaptive MCQs</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>

              </div>
            </div>

            {/* Next Quiz Widget */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center">
              
              <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center">
                {/* SVG Progress Circle Background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="46" stroke="#ede9fe" strokeWidth="8" fill="none" strokeDasharray="289" strokeDashoffset="120" strokeLinecap="round" />
                </svg>
                
                <div className="flex flex-col items-center justify-center text-center px-4 relative z-10 w-full h-full mt-4">
                  <div className="text-indigo-600 mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><polyline points="10 2 14 2"></polyline></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Next Quiz</h3>
                  <p className="text-xs text-slate-500 mb-4">Adaptive Physics Follow-up</p>
                  <div className="text-[32px] font-medium text-indigo-700 tracking-tight leading-none mb-6">
                    02<span className="text-indigo-300 mx-0.5">:</span>45<span className="text-indigo-300 mx-0.5">:</span>00
                  </div>
                  
                  <button className="w-full py-2.5 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-[13px] font-semibold shadow-sm hover:bg-indigo-50 transition-colors">
                    Review Material
                  </button>
                </div>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Performance Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800">Recent Performance</h3>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500 cursor-pointer">
                  Last 7 Days
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              
              <div className="h-48 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {
                        performanceData.map((entry, index) => {
                          const colors = ['#e2e8f0', '#cbd5e1', '#818cf8', '#a855f7', '#4338ca'];
                          return <cell key={`cell-${index}`} fill={colors[index]} />;
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Community Highlights */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Community Highlights</h3>
                <a href="#" className="text-sm font-bold text-indigo-600 hover:underline">View All</a>
              </div>
              
              <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                
                {/* Item 1 */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] text-slate-800 mb-1">Sarah J. shared a resource</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-2">
                      "Found this amazing interactive periodic table that makes memorizing valencies so much easier! Check it..."
                    </p>
                    <div className="flex gap-4 text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> 12</span>
                      <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> 3</span>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    MK
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] text-slate-800 mb-1">Study Group: Calculus 101</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-2">
                      Meeting tonight at 8 PM EST to review the practice exam. All are welcome!
                    </p>
                    <div className="flex gap-4 text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-indigo-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Join</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
