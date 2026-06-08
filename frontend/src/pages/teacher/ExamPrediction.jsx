import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

const lineData = [
  { name: 'W1', predicted: 85, baseline: 75 },
  { name: 'W2', predicted: 88, baseline: 78 },
  { name: 'W3', predicted: 92, baseline: 80 },
  { name: 'W4', predicted: 95, baseline: 82 },
  { name: 'W5', predicted: 96, baseline: 83 },
  { name: 'W6 (Now)', predicted: 96, baseline: 84 },
  { name: 'W7', predicted: 98, baseline: 85 },
  { name: 'W8', predicted: 99, baseline: 86 }
];

const pieData = [
  { name: 'Average', value: 94 },
  { name: 'Remaining', value: 6 }
];

export default function ExamPrediction() {
  const [activeNav, setActiveNav] = useState('analytics');

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="exam-prediction-layout">
      <Sidebar activeItem={activeNav} onNavigate={(id) => {
        setActiveNav(id);
        if (id !== 'analytics') navigate(`/${id}`);
      }} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          {/* Back Navigation */}
          <button onClick={() => navigate('/analytics')} className="flex items-center text-indigo-600 text-sm font-semibold mb-6 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Quiz Performance
          </button>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">ML Prediction</h1>
              <p className="text-slate-500 text-sm font-medium">Student Prediction Overview</p>
              <p className="text-slate-400 text-xs mt-1 max-w-lg">Real-time artificial intelligence analysis of individual student performance and intervention signaling.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export Report
              </button>
              <select className="border border-slate-200 text-slate-600 text-sm font-medium rounded-lg px-4 py-2 bg-slate-50 focus:outline-none">
                <option>Student: Amanda Lewis</option>
                <option>Student: Sarah Jenkins</option>
                <option>Student: David Park</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Predicted Final Average */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center relative">
              <div className="w-full flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">Predicted Final Score</h3>
                <svg className="text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>

              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">94<span className="text-xl">%</span></span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +3.1%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">Confidence Interval: 79% - 85%</p>
            </div>

            {/* Student Performance Profile */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Student Risk Profile</h3>
                <a href="#" className="text-indigo-600 text-xs font-semibold hover:underline">View Details</a>
              </div>

              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center border-l-4 border-l-emerald-500 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Current Risk</span>
                    <svg className="text-emerald-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">Low Risk</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">On Track</div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col justify-center border-l-4 border-l-amber-500 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">Weak Modules</span>
                    <svg className="text-amber-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">1</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Requires review</div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center border-l-4 border-l-indigo-500 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider">Attendance</span>
                    <svg className="text-indigo-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">98%</div>
                  <div className="text-xs text-indigo-600 font-bold mt-1">Excellent</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Performance Trajectory vs Baseline</h3>
                  <p className="text-xs text-slate-500 mt-1">Predicted trajectory based on mid-term assessment clustering</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button className="px-3 py-1 bg-white shadow-sm rounded-md text-xs font-bold text-indigo-600">Term</button>
                  <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Year</button>
                </div>
              </div>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="predicted" name="Amanda's Predicted Path" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="baseline" name="Class Historic Average" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Early Interventions */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-2xl p-6 shadow-sm border border-purple-100 flex-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <div className="flex items-center gap-2 mb-5">
                  <svg className="text-purple-600 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  <h3 className="text-lg font-bold text-slate-800">Early Interventions</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Algorithms Module Drop</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">Amanda showed sudden engagement decline in this module over the last 48hrs.</p>
                      <a href="#" className="text-indigo-600 text-xs font-semibold hover:underline">Draft Intervention Email</a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Assignment 3 Delay Risk</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">ML predicts Amanda will miss the upcoming deadline based on current repo commits.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic Vulnerabilities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                  <svg className="text-emerald-500 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  <h3 className="text-lg font-bold text-slate-800">Topic Vulnerabilities</h3>
                </div>

                <div className="space-y-4 mb-5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">Dynamic Programming</span>
                      <span className="text-red-500">42% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">Graph Theory</span>
                      <span className="text-amber-500">61% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '61%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">Data Structures</span>
                      <span className="text-emerald-500">88% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Generate Review Materials
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
