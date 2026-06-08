import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

const mockData = [
  { range: '0-20', count: 2 },
  { range: '21-40', count: 5 },
  { range: '41-60', count: 12 },
  { range: '61-80', count: 35 },
  { range: '81-100', count: 22 }
];

const students = [
  { id: 'AL', name: 'Amanda Lewis', score: 94, time: '38 mins', status: 'Completed', color: 'bg-indigo-600' },
  { id: 'SJ', name: 'Sarah Jenkins', score: 58, time: '45 mins', status: 'Completed', color: 'bg-purple-500' },
  { id: 'DP', name: 'David Park', score: null, time: '--', status: 'Pending', color: 'bg-slate-300' }
];

export default function Analytics() {
  const [activeNav, setActiveNav] = useState('analytics');

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="analytics-layout">
      <Sidebar activeItem={activeNav} onNavigate={(id) => {
        setActiveNav(id);
        if (id !== 'analytics') navigate(`/${id}`);
      }} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">Quiz Performance</h1>
              <p className="text-slate-500 text-sm">Advanced placement biology mid-term results.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <input type="text" placeholder="Search students..." className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-sm w-64 focus:outline-none focus:border-indigo-300" />
                <svg className="absolute left-3 top-2.5 text-slate-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 bg-white hover:bg-slate-50">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Class Average */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-slate-500 text-sm font-medium mb-4">Class Average</div>
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold text-slate-900">82%</div>
                <div className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +4%
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-slate-500 text-sm font-medium mb-4">Completion Rate</div>
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold text-slate-900">96%</div>
                <div className="text-slate-400 text-sm font-medium">24/25 Students</div>
              </div>
            </div>

            {/* Avg Completion Time */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-slate-500 text-sm font-medium mb-4">Avg. Completion Time</div>
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold text-slate-900">42m</div>
                <div className="text-slate-400 text-sm font-medium">of 60m allotted</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Score Distribution</h3>
                <select className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                  <option>Current Quiz</option>
                  <option>Previous Quiz</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">AcademiX Insights</h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4 flex-1">
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  <strong>Question 4</strong> (Cellular Respiration) had the lowest success rate (32%). Consider reviewing this topic next session.
                </p>
                <a href="#" className="text-indigo-600 text-xs font-semibold hover:underline">View Question Details</a>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="text-red-600 text-xs font-bold mb-3 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  Intervention Recommended
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-700">Sarah Jenkins</span>
                  <span className="text-red-600 font-semibold">58%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">Marcus Thorne</span>
                  <span className="text-red-600 font-semibold">62%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Student Roster</h3>
              <button className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                Export CSV
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 font-medium">Student Name</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Time Taken</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {students.map((student, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold ${student.color}`}>
                            {student.id}
                          </div>
                          <span className="font-semibold text-slate-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {student.score !== null ? (
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${student.score < 70 ? 'text-red-500' : 'text-emerald-500'}`}>{student.score}%</span>
                            <div className="w-24 h-1.5 rounded-full bg-slate-100 hidden sm:block">
                              <div className={`h-full rounded-full ${student.score < 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${student.score}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-4 text-slate-600">{student.time}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${student.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/exam-prediction')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-transform flex items-center gap-2"
            >
              View ML Exam Predictions
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
