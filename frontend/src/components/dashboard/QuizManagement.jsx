import React, { useState, useEffect } from 'react';

const questionBundles = [
  {
    id: 1,
    name: 'Information and Communication Technology',
    meta: '45 Questions • Updated 2h ago',
  },
  {
    id: 2,
    name: 'Fundamentals of a Computer System',
    meta: '32 Questions • Updated 1d ago',
  },
  {
    id: 3,
    name: 'Data Representation Methods in the Computer System',
    meta: '20 Questions • Updated 3d ago',
  },
];

export default function QuizManagement() {
  const [existingQuizzes, setExistingQuizzes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/quizzes')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(q => ({
          id: q._id,
          name: q.title,
          section: q.bundleTopic,
          difficulty: 'Moderate',
          status: 'Active',
          score: '--'
        }));
        setExistingQuizzes(mapped);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-800 m-0 mb-2">Quiz Management</h1>
          <p className="text-[15px] text-slate-500 m-0">Manage and monitor all assessment activities across the ICT department.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 bg-indigo-900 text-white px-5 py-3 rounded-lg border-none font-semibold text-[14.5px] cursor-pointer transition-opacity hover:opacity-90"
          onClick={() => {
            window.history.pushState({}, '', '/create-quiz');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Create New Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">AVG. DEPT SCORE</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            78.4% <span className="text-[13px] font-semibold text-emerald-500">+2.4%</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">ACTIVE QUIZZES</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            12 <span className="text-[14px] font-medium text-slate-500">Current</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">SUBMISSIONS TODAY</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            142 <span className="text-[13px] font-semibold text-emerald-500">High</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">FLAGGED RESPONSES</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            3 <span className="text-[13px] font-semibold text-red-500">Needs Review</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column: Existing Quizzes */}
        <div>
          <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-6">
            <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 m-0">Existing Quizzes</h2>
              <button className="text-indigo-900 bg-transparent border-none font-semibold text-sm cursor-pointer">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-[12px_24px] text-[11px] font-semibold text-slate-400 tracking-wide border-b border-slate-100 uppercase">QUIZ NAME</th>
                    <th className="text-left p-[12px_24px] text-[11px] font-semibold text-slate-400 tracking-wide border-b border-slate-100 uppercase">DIFFICULTY</th>
                    <th className="text-left p-[12px_24px] text-[11px] font-semibold text-slate-400 tracking-wide border-b border-slate-100 uppercase">STATUS</th>
                    <th className="text-left p-[12px_24px] text-[11px] font-semibold text-slate-400 tracking-wide border-b border-slate-100 uppercase">AVG. SCORE</th>
                    <th className="text-left p-[12px_24px] text-[11px] font-semibold text-slate-400 tracking-wide border-b border-slate-100 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {existingQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="last:border-b-0 border-b border-slate-50">
                      <td className="p-[16px_24px] align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[15px] text-slate-800">{quiz.name}</span>
                          <span className="text-[13px] text-slate-500">{quiz.section}</span>
                        </div>
                      </td>
                      <td className="p-[16px_24px] align-middle">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block
                          ${quiz.difficulty === 'Hard' ? 'bg-red-100 text-red-500' : ''}
                          ${quiz.difficulty === 'Moderate' ? 'bg-blue-100 text-blue-500' : ''}
                          ${quiz.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-500' : ''}
                        `}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td className="p-[16px_24px] align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full
                            ${quiz.status === 'Active' ? 'bg-emerald-500' : ''}
                            ${quiz.status === 'Closed' ? 'bg-slate-300' : ''}
                            ${quiz.status === 'Draft' ? 'bg-amber-500' : ''}
                          `}></span>
                          <span className={`text-[13px] font-semibold
                            ${quiz.status === 'Active' ? 'text-emerald-500' : ''}
                            ${quiz.status === 'Closed' ? 'text-slate-400' : ''}
                            ${quiz.status === 'Draft' ? 'text-amber-500' : ''}
                          `}>{quiz.status}</span>
                        </div>
                      </td>
                      <td className="p-[16px_24px] align-middle">
                        <span className="font-semibold text-[15px] text-slate-800">{quiz.score}</span>
                      </td>
                      <td className="p-[16px_24px] align-middle">
                        <button className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="5" r="2" fill="#94A3B8"/>
                            <circle cx="12" cy="12" r="2" fill="#94A3B8"/>
                            <circle cx="12" cy="19" r="2" fill="#94A3B8"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Question Bundles & Did you know */}
        <div>
          {/* Question Bundles */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-6">
            <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 m-0">Question Bundles</h2>
              <button className="text-indigo-900 bg-transparent border-none cursor-pointer flex items-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <p className="text-[11px] font-semibold text-slate-500 tracking-wide p-[16px_24px_8px] m-0 uppercase">RECENTLY EDITED</p>
            
            <div className="px-6 flex flex-col gap-4">
              {questionBundles.map((bundle) => (
                <div className="flex items-center gap-4" key={bundle.id}>
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="6" width="16" height="14" rx="2" stroke="#4F46E5" strokeWidth="1.5"/>
                      <path d="M8 2H16C17.1046 2 18 2.89543 18 4V6H6V4C6 2.89543 6.89543 2 8 2Z" stroke="#4F46E5" strokeWidth="1.5"/>
                      <line x1="8" y1="12" x2="16" y2="12" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="8" y1="16" x2="13" y2="16" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[14.5px] text-slate-800">{bundle.name}</span>
                    <span className="text-xs text-slate-500">{bundle.meta}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 pt-2">
              <button className="mt-5 w-full p-2.5 rounded-lg border border-slate-100 bg-transparent text-slate-800 font-semibold cursor-pointer transition-all hover:bg-slate-50">
                Manage All Bundles
              </button>
            </div>
          </div>

          {/* Did you know? */}
          <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-5 -bottom-5 text-white/10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold m-0 mb-3 relative z-10">Did you know?</h3>
            <p className="text-sm leading-relaxed text-indigo-200 m-0 mb-4 relative z-10">
              You can now import question banks directly from Google Classroom or Canvas using the "Bundle Sync" tool.
            </p>
            <a href="#" className="text-white text-sm font-semibold underline relative z-10">Learn more</a>
          </div>
        </div>
      </div>
    </div>
  );
}
