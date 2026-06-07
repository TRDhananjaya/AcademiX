import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const quizzes = [
  {
    id: 1,
    title: "Logic Gates with Boolean Functions",
    unit: "Unit 4 • 25 Questions • Date: Oct 24, 2023",
    metrics: { avgScore: "76.5%", avgTrend: "+1.2%", submissions: 142, max: 150, highest: "98%", hardestQ: "Q. 14", hardestQScore: "32% Correct" },
    gradeData: [
      { name: 'A (90-100)', count: 24, color: '#34d399' },
      { name: 'B (80-89)', count: 48, color: '#6ee7b7' },
      { name: 'C (70-79)', count: 42, color: '#93c5fd' },
      { name: 'D (60-69)', count: 18, color: '#fcd34d' },
      { name: 'F (<60)', count: 10, color: '#f87171' },
    ]
  },
  {
    id: 2,
    title: "Data Representation Methods",
    unit: "Unit 3 • 20 Questions • Date: Oct 18, 2023",
    metrics: { avgScore: "82.1%", avgTrend: "+3.4%", submissions: 138, max: 150, highest: "100%", hardestQ: "Q. 7", hardestQScore: "45% Correct" },
    gradeData: [
      { name: 'A (90-100)', count: 45, color: '#34d399' },
      { name: 'B (80-89)', count: 50, color: '#6ee7b7' },
      { name: 'C (70-79)', count: 28, color: '#93c5fd' },
      { name: 'D (60-69)', count: 10, color: '#fcd34d' },
      { name: 'F (<60)', count: 5, color: '#f87171' },
    ]
  },
  {
    id: 3,
    title: "Operating Systems Basics",
    unit: "Unit 5 • 30 Questions • Date: Nov 02, 2023",
    metrics: { avgScore: "69.8%", avgTrend: "-2.1%", submissions: 145, max: 150, highest: "95%", hardestQ: "Q. 22", hardestQScore: "28% Correct" },
    gradeData: [
      { name: 'A (90-100)', count: 12, color: '#34d399' },
      { name: 'B (80-89)', count: 35, color: '#6ee7b7' },
      { name: 'C (70-79)', count: 55, color: '#93c5fd' },
      { name: 'D (60-69)', count: 28, color: '#fcd34d' },
      { name: 'F (<60)', count: 15, color: '#f87171' },
    ]
  }
];

const studentSubmissions = [
  { id: 1, name: 'Alice Smith', studentId: 'S-1001', score: 92, timeTaken: '34m 12s', status: 'Pass' },
  { id: 2, name: 'Bob Johnson', studentId: 'S-1002', score: 78, timeTaken: '41m 05s', status: 'Pass' },
  { id: 3, name: 'Charlie Davis', studentId: 'S-1003', score: 45, timeTaken: '45m 00s', status: 'Fail' },
  { id: 4, name: 'Diana Prince', studentId: 'S-1004', score: 88, timeTaken: '28m 45s', status: 'Pass' },
  { id: 5, name: 'Evan Wright', studentId: 'S-1005', score: 64, timeTaken: '42m 20s', status: 'Pass' },
];

export default function QuizReportContent() {
  const [selectedQuizId, setSelectedQuizId] = useState(1);
  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];

  return (
    <div className="max-w-[1200px] mx-auto font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => window.history.pushState({}, '', '/dashboard') || window.dispatchEvent(new PopStateEvent('popstate'))}
              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center justify-center rounded-md hover:bg-slate-100"
              title="Back to Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <select 
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(parseInt(e.target.value))}
              className="text-[24px] sm:text-[28px] font-extrabold text-slate-800 m-0 bg-transparent border-none outline-none cursor-pointer hover:bg-slate-50 transition-colors rounded-lg py-1 px-2 appearance-none pr-8 relative -ml-2"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '20px' }}
            >
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
          <p className="text-[15px] text-slate-500 m-0 sm:ml-10 ml-0 px-2 sm:px-0">{selectedQuiz.unit}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Average Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{selectedQuiz.metrics.avgScore}</span>
            <span className={`text-[13px] font-semibold ${selectedQuiz.metrics.avgTrend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{selectedQuiz.metrics.avgTrend}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Submissions</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{selectedQuiz.metrics.submissions}</span>
            <span className="text-[14px] font-medium text-slate-500">/ {selectedQuiz.metrics.max}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Highest Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{selectedQuiz.metrics.highest}</span>
            <span className="text-[14px] font-medium text-slate-500">Sarah J.</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hardest Question</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{selectedQuiz.metrics.hardestQ}</span>
            <span className="text-[13px] font-semibold text-red-500">{selectedQuiz.metrics.hardestQScore}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Grade Distribution</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedQuiz.gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={500}>
                  {selectedQuiz.gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute -right-5 -bottom-5 text-white/10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20V10M18 20V4M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-5 relative z-10">Key Insights</h2>
          
          <div className="flex flex-col gap-5 relative z-10">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[13px] text-indigo-100 m-0 mb-1 font-medium">Topic to Review</p>
              <h4 className="text-[15px] font-semibold m-0 text-white">De Morgan's Laws</h4>
              <p className="text-[12px] text-indigo-200 mt-2 m-0">68% of students struggled with questions 14 and 17 related to this topic.</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[13px] text-indigo-100 m-0 mb-1 font-medium">Positive Trend</p>
              <h4 className="text-[15px] font-semibold m-0 text-white">Truth Tables</h4>
              <p className="text-[12px] text-indigo-200 mt-2 m-0">Excellent performance. 94% average score on truth table analysis.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-slate-800 m-0">Student Submissions</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 transition-all w-[240px]"
            />
            <svg className="absolute left-3 top-2.5 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Student Name</th>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">ID</th>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Score</th>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Time Taken</th>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Status</th>
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentSubmissions.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-[16px_24px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 text-[14.5px]">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-[16px_24px] text-[14px] text-slate-500 font-medium">{student.studentId}</td>
                  <td className="p-[16px_24px]">
                    <span className="font-bold text-slate-800 text-[14.5px]">{student.score}%</span>
                  </td>
                  <td className="p-[16px_24px] text-[14px] text-slate-500">{student.timeTaken}</td>
                  <td className="p-[16px_24px]">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${
                      student.status === 'Pass' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-[16px_24px] text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-[13.5px] bg-transparent border-none cursor-pointer hover:underline">
                      View Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white text-[13px] text-slate-500 font-medium">
          <span>Showing 1 to 5 of 142 entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer disabled:opacity-50" disabled>
              &lt;
            </button>
            <button className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center">...</span>
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
