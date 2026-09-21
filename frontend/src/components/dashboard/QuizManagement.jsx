import React, { useState, useEffect } from 'react';
import { getCachedData, setCachedData, invalidateCache } from '../../utils/apiCache';
import { navigate } from '../../App';

export default function QuizManagement() {
  const cachedModules = getCachedData('/api/quizzes/modules');
  const cachedQuizzes = getCachedData('/api/quizzes');
  const cachedResults = getCachedData('/api/quiz-results');
  const hasCache = Boolean(cachedModules && cachedQuizzes && cachedResults);

  const [modules, setModules] = useState(cachedModules || []);
  const [quizzes, setQuizzes] = useState(cachedQuizzes || []);
  const [results, setResults] = useState(cachedResults || []);
  const [fq1Available, setFq1Available] = useState(true);
  const [fq2Available, setFq2Available] = useState(true);
  const [isTogglingGroup1, setIsTogglingGroup1] = useState(false);
  const [isTogglingGroup2, setIsTogglingGroup2] = useState(false);
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteQuizTarget, setDeleteQuizTarget] = useState(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  // State variables for report view have been delegated to QuizReportContent page.

  useEffect(() => {
    async function fetchData() {
      try {
        if (!hasCache) setIsLoading(true);
        const [modulesRes, quizzesRes, resultsRes, groupStatusRes] = await Promise.all([
          fetch('/api/quizzes/modules'),
          fetch('/api/quizzes'),
          fetch('/api/quiz-results'),
          fetch('/api/followup/group-status', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
          })
        ]);

        if (modulesRes.ok && quizzesRes.ok && resultsRes.ok) {
          const modulesData = await modulesRes.json();
          const quizzesData = await quizzesRes.json();
          const resultsData = await resultsRes.json();

          setModules(modulesData);
          setQuizzes(quizzesData);
          setResults(resultsData);

          setCachedData('/api/quizzes/modules', modulesData);
          setCachedData('/api/quizzes', quizzesData);
          setCachedData('/api/quiz-results', resultsData);
        }

        if (groupStatusRes.ok) {
          const groupData = await groupStatusRes.json();
          if (groupData.quiz1) setFq1Available(groupData.quiz1.isAvailable);
          if (groupData.quiz2) setFq2Available(groupData.quiz2.isAvailable);
        }
      } catch (err) {
        console.error('Error fetching quiz dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDeleteQuizResult = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quiz-results/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        invalidateCache('/api/quiz-results');
        invalidateCache('/api/analytics');
        setResults(prev => prev.filter(r => r._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        alert('Failed to delete quiz result.');
      }
    } catch (err) {
      console.error('Error deleting quiz result:', err);
      alert('Server error deleting quiz result.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const confirmDeleteQuiz = async () => {
    if (!deleteQuizTarget) return;
    setIsDeletingQuiz(true);
    try {
      const response = await fetch(`/api/quizzes/${deleteQuizTarget._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (response.ok) {
        invalidateCache('/api/quizzes');
        setQuizzes(prev => prev.filter(q => q._id !== deleteQuizTarget._id));
        setDeleteQuizTarget(null);
      } else {
        alert('Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Error deleting quiz');
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  const handleToggleQuizGroup = async (quizNumber) => {
    const isGroup1 = Number(quizNumber) === 1;
    const currentStatus = isGroup1 ? fq1Available : fq2Available;
    const targetState = !currentStatus;

    if (isGroup1) setIsTogglingGroup1(true);
    else setIsTogglingGroup2(true);

    try {
      const res = await fetch('/api/followup/toggle-group', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ quizNumber, targetState })
      });

      if (res.ok) {
        if (isGroup1) setFq1Available(targetState);
        else setFq2Available(targetState);
      } else {
        alert(`Failed to update Follow-Up Quiz ${quizNumber}.`);
      }
    } catch (err) {
      console.error(`Error toggling Follow-Up Quiz ${quizNumber}:`, err);
      alert(`Error updating Follow-Up Quiz ${quizNumber}.`);
    } finally {
      if (isGroup1) setIsTogglingGroup1(false);
      else setIsTogglingGroup2(false);
    }
  };

  const handleViewResults = (quiz) => {
    window.history.pushState({ defaultQuizId: quiz._id }, '', '/teacher/quiz-report');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/quiz-results/export-csv');
      if (!response.ok) {
        throw new Error('Failed to generate CSV file');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz_results.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Failed to download Quiz Results CSV file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-800 m-0 mb-2">Quiz Management</h1>
          <p className="text-[15px] text-slate-500 m-0">Manage and monitor all assessment activities across the ICT department.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-lg border-none font-semibold text-[14.5px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
            onClick={handleDownloadCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
            {isExporting ? 'Generating...' : 'Download Quiz Results CSV'}
          </button>
          <button
            className="inline-flex items-center gap-2 bg-indigo-900 text-white px-5 py-3 rounded-lg border-none font-semibold text-[14.5px] cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => {
              navigate('/create-quiz');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Create New Quiz
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 mb-8">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-semibold text-slate-500 tracking-wide mb-2 uppercase">ACTIVE QUIZZES</div>
          <div className="text-[32px] font-bold text-slate-800 flex items-baseline gap-2">
            {activeQuizzes.length} <span className="text-[14px] font-medium text-slate-500">Live</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-sm font-semibold text-slate-500">Loading Quiz Dashboard Data...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Section: Active Quizzes & Recent Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Active Quizzes */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden h-full flex flex-col">
                <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800 m-0">Active Quizzes (Live)</h2>
                  <span className="text-xs text-slate-400 font-medium">{activeQuizzes.length} Deployed</span>
                </div>

                <div className="p-6 flex-1">
                  {activeQuizzes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border-[1.5px] border-dashed border-slate-200 rounded-xl bg-slate-50/30 h-full flex flex-col items-center justify-center">
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
                                      navigate('/create-quiz', { defaultModuleCode: quiz.quizCode });
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-500 bg-transparent border-none font-bold hover:underline cursor-pointer"
                                    onClick={() => setDeleteQuizTarget(quiz)}
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
            </div>

            {/* Right Column: Recent Submissions */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden h-full flex flex-col">
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

                <div className="p-6 flex-1">
                  {results.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No submissions yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
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
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${isPass
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
                              <button
                                onClick={() => setDeleteTarget(result)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 px-2 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                                title="Delete Attempt (Allow Student Retake)"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Section: Follow-Up Quizzes Management */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-6">
            <div className="p-[20px_24px] border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 m-0">Follow-Up Quizzes Management</h2>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Control student access to Follow-Up Quiz 1 and Follow-Up Quiz 2 across the ICT department.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Follow-Up Quiz 1 */}
              <div className="p-5 border border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50/40 via-white to-slate-50/50 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 uppercase tracking-wide">
                      Follow-Up Quiz 1
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      fq1Available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${fq1Available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {fq1Available ? 'Allowed for All Students' : 'Disabled for All Students'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 mb-1">
                    Lesson 1: Fundamentals of a Computer System
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    Adaptive remedial quiz covering core ICT concepts, hardware components, Von Neumann architecture, and operating systems.
                  </p>
                </div>

                <button
                  onClick={() => handleToggleQuizGroup(1)}
                  disabled={isTogglingGroup1}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2 border ${
                    fq1Available
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                  }`}
                >
                  {isTogglingGroup1 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : fq1Available ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Disable Follow Up Quiz 1 for All Students
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Allow Follow Up Quiz 1 for All Students
                    </>
                  )}
                </button>
              </div>

              {/* Card 2: Follow-Up Quiz 2 */}
              <div className="p-5 border border-indigo-100 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-wide">
                      Follow-Up Quiz 2
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      fq2Available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${fq2Available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {fq2Available ? 'Allowed for All Students' : 'Disabled for All Students'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 mb-1">
                    Lesson 2: Information and Communication Technology
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    Adaptive remedial quiz covering practical ICT applications, emerging digital trends, networking, and cloud ethics.
                  </p>
                </div>

                <button
                  onClick={() => handleToggleQuizGroup(2)}
                  disabled={isTogglingGroup2}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2 border ${
                    fq2Available
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                  }`}
                >
                  {isTogglingGroup2 ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : fq2Available ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Disable Follow Up Quiz 2 for All Students
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Allow Follow Up Quiz 2 for All Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Full Width Section: Module Question Banks */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-[20px_24px] flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 m-0">Module Question Banks</h2>
              <span className="text-xs text-slate-400 font-medium">{modules.length} Modules Available</span>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
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
                      className={`w-full py-2 rounded-lg border-none font-semibold text-xs cursor-pointer transition-colors ${isActive
                          ? 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                          : 'bg-indigo-900 text-white hover:bg-indigo-700'
                        }`}
                      onClick={() => {
                        navigate('/create-quiz', { defaultModuleCode: mod.quizCode });
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Completed Quiz Attempt?</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete the completed attempt for <strong className="text-slate-800">{deleteTarget.studentName}</strong> (<span className="font-mono text-indigo-600">{deleteTarget.studentId}</span>) on quiz <strong className="text-slate-800">{deleteTarget.quizId}</strong>?
              <br /><br />
              <span className="text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 block text-xs">
                ✓ Record will be permanently removed from MongoDB, allowing the student to retake this quiz.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuizResult}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete & Reset Attempt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Confirmation Modal */}
      {deleteQuizTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Quiz?</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">{deleteQuizTarget.title || deleteQuizTarget.quizCode}</strong>?
              <br /><br />
              <span className="text-rose-700 font-medium bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 block text-xs">
                ⚠️ This will remove it from students' available quizzes.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteQuizTarget(null)}
                disabled={isDeletingQuiz}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuiz}
                disabled={isDeletingQuiz}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeletingQuiz ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
