import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';

const progressData = [
  { name: 'Completed', value: 75 },
  { name: 'Remaining', value: 25 }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
              Welcome back, Alex!
            </h1>
            <p className="text-slate-500 text-base">
              Ready to crush your goals today? Your AI plan is waiting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Course Progress Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-slate-800 font-semibold text-[15px]">Course Progress</h3>
                <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
              </div>
              
              <div className="relative w-36 h-36 mt-2 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3b28cc" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">75%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">Advanced Calculus</p>
            </div>

            {/* Learning Streak Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-slate-400 font-medium text-[15px]">Learning Streak</h3>
                  <span className="text-amber-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6667 2L10 6.66667H14.1667L12.5 11.3333L16.6667 9.66667L11.6667 20V14.1667H8.33333L9.16667 9.66667L5 10.5L11.6667 2Z"/>
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-slate-300 tracking-tight">14</span>
                  <span className="text-slate-400 font-semibold ml-2 text-sm uppercase tracking-wider">Days</span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex gap-1.5 mb-3">
                  <div className="h-1.5 flex-1 bg-amber-200 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-amber-200 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-amber-200 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-amber-200 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-amber-200 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
                </div>
                <p className="text-xs text-slate-400 font-medium">2 more days to unlock the<br/>'Consistency' badge!</p>
              </div>
            </div>

            {/* Focus Area Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-full flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 font-medium text-[15px]">Focus Area</h3>
                  <span className="text-red-400 border border-red-200 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">?</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[13px] mb-1.5 font-medium">
                      <span className="text-slate-400">Thermodynamics</span>
                      <span className="text-red-400">Needs review</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[13px] mb-1.5 font-medium">
                      <span className="text-slate-400">Linear Algebra</span>
                      <span className="text-amber-400">Moderate</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                Review Topics
              </button>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Optimized Plan Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              
              {/* Background Graphic Pattern */}
              <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 A 20 20 0 0 1 50 50 A 20 20 0 0 0 90 50" stroke="#3b28cc" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="50" r="8" fill="#3b28cc"/>
                  <circle cx="90" cy="50" r="8" fill="#3b28cc"/>
                  <circle cx="50" cy="50" r="4" fill="#3b28cc"/>
                </svg>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#e0f7fa] text-[#00838f] px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-6">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
                  AI GENERATED
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-3 max-w-sm">
                  Your Optimized Plan for Today
                </h2>
                
                <p className="text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
                  Based on your recent quiz performance, I've prioritized Thermodynamics and structured a 2-hour deep work session.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded border-2 border-slate-200 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-[15px] font-medium text-slate-800">Read Chapter 4: Entropy</h4>
                      <p className="text-[13px] text-slate-400 mt-1">Est. 45 mins</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded border-2 border-slate-200 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-[15px] font-medium text-slate-800">Practice Set: Energy Equations</h4>
                      <p className="text-[13px] text-slate-400 mt-1">Est. 30 mins</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-[#3b28cc] text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  Start Session
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* Final Exam Prediction Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
              <h3 className="text-slate-400 font-bold tracking-widest text-[11px] uppercase mb-10 w-full text-center">Final Exam Prediction</h3>
              
              <div className="w-32 h-32 rounded-full border-[6px] border-[#3b28cc] flex items-center justify-center bg-white shadow-[0_0_40px_rgba(59,40,204,0.15)] relative z-10 mb-8">
                <span className="text-5xl font-extrabold text-[#3b28cc] tracking-tight">A-</span>
              </div>
              
              <div className="bg-slate-50 px-4 py-1.5 rounded-full text-slate-500 text-xs font-semibold">
                +2% since last week
              </div>

              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-3/4">
                 <div className="h-1 w-full bg-gradient-to-r from-cyan-200 via-indigo-500 to-slate-200 rounded-full"></div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
