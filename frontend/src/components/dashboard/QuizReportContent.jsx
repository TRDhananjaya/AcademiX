import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function QuizReportContent() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/quizzes')
      .then(res => res.json())
      .then(data => {
        setQuizzes(data);
        if (data.length > 0) {
          setSelectedQuizId(data[0]._id);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetch(`http://localhost:5000/api/quiz-results/quiz/${selectedQuizId}`)
        .then(res => res.json())
        .then(data => {
          // The API now returns a paginated object: { total, page, limit, data: [...] }
          setSubmissions(data.data || []);
        })
        .catch(err => console.error(err));
    }
  }, [selectedQuizId]);

  if (isLoading) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading Report...</div>;
  }

  const selectedQuiz = quizzes.find(q => q._id === selectedQuizId) || quizzes[0];
  
  if (!selectedQuiz) {
    return <div className="p-10 text-center font-bold text-slate-500">No Quizzes Found</div>;
  }

  // Calculate metrics
  const maxScore = selectedQuiz.questions ? selectedQuiz.questions.length : 100;
  const totalSubmissions = submissions.length;
  
  let avgScore = 0;
  let highest = 0;
  let highestName = 'N/A';

  const grades = {
    A: 0, B: 0, C: 0, D: 0, F: 0
  };

  submissions.forEach(sub => {
    avgScore += sub.percentage;
    if (sub.percentage > highest) {
      highest = sub.percentage;
      highestName = sub.studentName;
    }
    
    if (sub.percentage >= 90) grades.A++;
    else if (sub.percentage >= 80) grades.B++;
    else if (sub.percentage >= 70) grades.C++;
    else if (sub.percentage >= 60) grades.D++;
    else grades.F++;
  });

  if (totalSubmissions > 0) {
    avgScore = Math.round(avgScore / totalSubmissions);
  }

  const gradeData = [
    { name: 'A (90-100)', count: grades.A, color: '#34d399' },
    { name: 'B (80-89)', count: grades.B, color: '#6ee7b7' },
    { name: 'C (70-79)', count: grades.C, color: '#93c5fd' },
    { name: 'D (60-69)', count: grades.D, color: '#fcd34d' },
    { name: 'F (<60)', count: grades.F, color: '#f87171' },
  ];

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
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="text-[24px] sm:text-[28px] font-extrabold text-slate-800 m-0 bg-transparent border-none outline-none cursor-pointer hover:bg-slate-50 transition-colors rounded-lg py-1 px-2 appearance-none pr-8 relative -ml-2"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '20px' }}
            >
              {quizzes.map(q => (
                <option key={q._id} value={q._id}>{q.quizCode} - {q.title}</option>
              ))}
            </select>
          </div>
          <p className="text-[15px] text-slate-500 m-0 sm:ml-10 ml-0 px-2 sm:px-0">{selectedQuiz.bundleTopic} • {maxScore} Questions</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Average Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{avgScore}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Submissions</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{totalSubmissions}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Highest Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-slate-800">{highest}%</span>
            <span className="text-[14px] font-medium text-slate-500">{highestName}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Performance Distribution Chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Grade Distribution</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={500}>
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                <th className="p-[16px_24px] text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">No submissions yet.</td>
                </tr>
              )}
              {submissions.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-[16px_24px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {student.studentName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 text-[14.5px]">{student.studentName}</span>
                    </div>
                  </td>
                  <td className="p-[16px_24px] text-[14px] text-slate-500 font-medium">{student.studentId}</td>
                  <td className="p-[16px_24px]">
                    <span className="font-bold text-slate-800 text-[14.5px]">{student.percentage}%</span>
                  </td>
                  <td className="p-[16px_24px] text-[14px] text-slate-500">{student.timeTaken}</td>
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
          <span>Showing 1 to {submissions.length} of {submissions.length} entries</span>
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
