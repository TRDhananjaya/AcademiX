import React, { useState, useEffect } from 'react';

export default function QuizManagement() {
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State variables for report view have been delegated to QuizReportContent page.

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, quizzesRes, resultsRes] = await Promise.all([
          fetch('/api/quizzes/modules'),
          fetch('/api/quizzes'),
          fetch('/api/quiz-results')
        ]);
        
        if (modulesRes.ok && quizzesRes.ok && resultsRes.ok) {
          const modulesData = await modulesRes.json();
          const quizzesData = await quizzesRes.json();
          const resultsData = await resultsRes.json();
          
          setModules(modulesData);
          setQuizzes(quizzesData);
          setResults(resultsData);
        }
      } catch (err) {
        console.error('Error fetching quiz dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const activeQuizzes = quizzes.filter(q => q.questions && q.questions.length > 0);
  
  // Calculate stats from results
  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
    : 'N/A';
    
  const totalSubmissions = results.length;
  const flaggedCount = results.filter(r => r.percentage < 50).length;

  const isModuleActive = (quizCode) => {
    return activeQuizzes.some(aq => aq.quizCode === quizCode);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This will remove it from students\' available quizzes.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh quizzes list
        const quizzesRes = await fetch('/api/quizzes');
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setQuizzes(quizzesData);
        }
        alert('Quiz deleted successfully');
      } else {
        alert('Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Error deleting quiz');
    }
  };

  const handleViewResults = (quiz) => {
    window.history.pushState({ defaultQuizId: quiz._id }, '', '/teacher/quiz-report');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="max-w-[1100px] mx-auto font-sans">
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
            {avgScore !== 'N/A' ? `${avgScore}%` : 'N/A'}
            {avgScore !== 'N/A' && <span className="text-[13px] font-semibold text-emerald-500">+2.4%</span>}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">ACTIVE QUIZZES</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            {activeQuizzes.length} <span className="text-[14px] font-medium text-slate-500">Live</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">TOTAL ATTEMPTS</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            {totalSubmissions} <span className="text-[14px] font-medium text-slate-500">Attempts</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">FLAGGED RESPONSES</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            {flaggedCount} <span className="text-[13px] font-semibold text-red-500">Needs Review</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-sm font-semibold text-slate-500">Loading Quiz Dashboard Data...</span>
        </div>
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Quizzes & Module Question Banks */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Section 1: Active Quizzes */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 m-0">Active Quizzes (Live)</h2>
                <span className="text-xs text-slate-400 font-medium">{activeQuizzes.length} Deployed</span>
              </div>
              
              <div className="p-6">
                {activeQuizzes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border-[1.5px] border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <p className="font-semibold text-slate-600 mb-1">No Active Quizzes</p>
                    <p className="text-xs text-slate-400">Select a module question bank below to publish a new quiz.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeQuizzes.map((quiz) => {
                      return (
                        <div 
                          className="flex flex-col justify-between p-4 border border-indigo-100 bg-indigo-50/10 hover:border-indigo-200 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                          key={quiz._id}
                          onClick={() => handleViewResults(quiz)}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                                {quiz.quizCode}
                              </span>
                              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                              </span>
                            </div>
                            <h4 className="font-bold text-[14.5px] text-slate-800 leading-snug mb-2" title={quiz.title}>
                              {quiz.title.includes('–') ? quiz.title.split('–')[1].trim() : quiz.title}
                            </h4>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-1" title={quiz.bundleTopic}>
                              {quiz.bundleTopic}
                            </p>
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 border-t border-slate-100/55 pt-3" onClick={(e) => e.stopPropagation()}>
                              <span>{quiz.questionCount || (quiz.questions ? quiz.questions.length : 0)} Questions</span>
                              <div className="flex gap-3">
                                <button 
                                  className="text-indigo-600 bg-transparent border-none font-bold hover:underline cursor-pointer"
                                  onClick={() => {
                                    window.history.pushState({ defaultModuleCode: quiz.quizCode }, '', '/create-quiz');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-red-500 bg-transparent border-none font-bold hover:underline cursor-pointer"
                                  onClick={() => handleDeleteQuiz(quiz._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Module Question Banks */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 m-0">Module Question Banks</h2>
                <span className="text-xs text-slate-400 font-medium">{modules.length} Modules Available</span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {modules.map((mod) => {
                  const isActive = isModuleActive(mod.quizCode);
                  return (
                    <div className="flex flex-col justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors" key={mod.quizCode}>
                      <div className="min-w-0 mb-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {mod.quizCode}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                              30 Questions
                            </span>
                          </div>
                          {isActive ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-[14.5px] text-slate-800 leading-snug line-clamp-2" title={mod.title}>
                          {mod.title.includes('–') ? mod.title.split('–')[1].trim() : mod.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 truncate" title={mod.bundleTopic}>
                          {mod.bundleTopic}
                        </p>
                      </div>
                      <button 
                        className={`w-full py-2 rounded-lg border-none font-semibold text-xs cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100' 
                            : 'bg-indigo-900 text-white hover:bg-indigo-700'
                        }`}
                        onClick={() => {
                          window.history.pushState({ defaultModuleCode: mod.quizCode }, '', '/create-quiz');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                      >
                        {isActive ? 'Update / Re-create Quiz' : 'Create Quiz'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Recent Submissions & Info */}
          <div className="flex flex-col gap-6">
            
            {/* Section 3: Recent Submissions Activity Feed */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 m-0">Recent Submissions</h2>
                <button 
                  className="text-xs text-indigo-900 bg-transparent border-none font-semibold hover:underline cursor-pointer"
                  onClick={() => {
                    window.history.pushState({}, '', '/analytics');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  View All
                </button>
              </div>
              
              <div className="p-6">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No submissions yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1">
                    {results.slice(0, 10).map((result) => {
                      const isPass = result.percentage >= 50;
                      return (
                        <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col gap-2" key={result._id}>
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-800 truncate" title={result.studentName}>
                                {result.studentName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                ID: {result.studentId}
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                              isPass 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {result.percentage}%
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-600 font-medium line-clamp-1" title={result.quizTitle || result.quizId}>
                            Attempted <span className="font-bold text-indigo-900">{result.quizId}</span> – {result.quizTitle || 'Quiz'}
                          </div>
                          
                          <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-100/60 pt-2 mt-1">
                            <span>Score: {result.score}/{result.totalQuestions}</span>
                            <span>{result.timeTaken}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Did you know? Info Card */}
            <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute -right-5 -bottom-5 text-white/10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold m-0 mb-3 relative z-10">Did you know?</h3>
              <p className="text-sm leading-relaxed text-indigo-200 m-0 mb-4 relative z-10">
                Quizzes are generated dynamically by pulling 20 random questions from the 30-question bank for each module. Once published, the quiz remains identical for all students.
              </p>
              <a href="#" className="text-white text-sm font-semibold underline relative z-10" onClick={(e) => e.preventDefault()}>Learn more</a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
