import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

const CACHE_KEY_PREFIX = 'academix_lesson_prediction_';
const CACHE_STATE_KEY = 'academix_lesson_prediction_state';

export default function ExamPrediction() {
  const [activeNav, setActiveNav] = useState('analytics');
  
  const [lessons, setLessons] = useState([]);
  
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  
  const [classPredictions, setClassPredictions] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  useEffect(() => {
    return () => {
      setTimeout(() => {
        if (!window.location.pathname.includes('exam-prediction')) {
          sessionStorage.removeItem(CACHE_STATE_KEY);
          const keysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
      }, 0);
    };
  }, []);

  useEffect(() => {
    const stateStr = sessionStorage.getItem(CACHE_STATE_KEY);
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        if (state.selectedLesson) setSelectedLesson(state.selectedLesson);
        if (state.selectedStudentFilter) setSelectedStudentFilter(state.selectedStudentFilter);
        if (state.currentPage) setCurrentPage(state.currentPage);
      } catch (e) {
        sessionStorage.removeItem(CACHE_STATE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      sessionStorage.setItem(CACHE_STATE_KEY, JSON.stringify({
        selectedLesson,
        selectedStudentFilter,
        currentPage
      }));
    }
  }, [selectedLesson, selectedStudentFilter, currentPage]);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch('/api/analytics/lessons');
        if (res.ok) {
          const data = await res.json();
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLessons();
  }, []);

  useEffect(() => {
    async function fetchLessonPredictions() {
      if (!selectedLesson) return;
      
      const cacheKey = CACHE_KEY_PREFIX + selectedLesson;
      const cachedStr = sessionStorage.getItem(cacheKey);
      
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          setClassPredictions(cached.classPredictions);
          return;
        } catch (e) {
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      setIsLoading(true);
      setError(null);
      setClassPredictions(null);

      try {
        const res = await fetch(`/api/ml/lesson/${selectedLesson}`);
        const data = await res.json();
        if (res.ok) {
          setClassPredictions(data);
          sessionStorage.setItem(cacheKey, JSON.stringify({
            classPredictions: data,
            timestamp: Date.now()
          }));
        } else {
          setError(data.message || "Failed to fetch class predictions.");
        }
      } catch (err) {
        setError("Network error while fetching predictions.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLessonPredictions();
  }, [selectedLesson]);

  const handleLessonChange = (e) => {
    setSelectedLesson(e.target.value);
    setSelectedStudentFilter('');
    setCurrentPage(1);
  };
  
  const handleStudentFilterChange = (e) => {
    setSelectedStudentFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = useMemo(() => {
    if (!classPredictions?.students) return [];
    if (!selectedStudentFilter) return classPredictions.students;
    
    return classPredictions.students.filter(s => s.studentId === selectedStudentFilter);
  }, [classPredictions, selectedStudentFilter]);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleRowClick = (studentId) => {
    navigate(`/exam-prediction/student/${studentId}?lessonId=${selectedLesson}`);
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <button onClick={() => navigate('/analytics')} className="flex items-center text-indigo-600 text-sm font-semibold mb-6 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Analytics
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">Lesson-Wise ML Predictions</h1>
              <p className="text-slate-500 text-sm font-medium">View predicted term-test performance for students based on their quiz and follow-up quiz results.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Lesson</label>
              <select 
                value={selectedLesson} 
                onChange={handleLessonChange}
                className="w-full border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>-- Select a Lesson --</option>
                {lessons.map(l => <option key={l} value={l}>Lesson {l}</option>)}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Filter Student</label>
              <select 
                value={selectedStudentFilter}
                onChange={handleStudentFilterChange}
                disabled={!classPredictions || !classPredictions.students}
                className="w-full border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">All Students</option>
                {classPredictions?.students?.map(s => (
                  <option key={s.studentId} value={s.studentId}>{s.studentName} — {s.studentId}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {!selectedLesson && !isLoading && !error && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 font-medium">
              Select a lesson to view student predictions.
            </div>
          )}

          {isLoading && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></span>
              <p className="text-slate-500 font-medium">Loading lesson predictions...</p>
            </div>
          )}

          {!isLoading && classPredictions && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Q1</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Q2</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Q3</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Average</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-up</th>
                      <th className="px-6 py-4 text-xs font-bold text-indigo-600 uppercase tracking-wider">Prediction %</th>
                      <th className="px-6 py-4 text-xs font-bold text-indigo-600 uppercase tracking-wider">Term Mark</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-8 text-center text-slate-500">
                          No student results are available for this lesson.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s, idx) => (
                        <tr 
                          key={s.studentId || idx} 
                          onClick={() => handleRowClick(s.studentId)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{s.studentId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{s.studentName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.quiz1Score ?? '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.quiz2Score ?? '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.quiz3Score ?? '-'}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{typeof s.quizAverage === 'number' ? s.quizAverage.toFixed(1) : '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.followupScore ?? '-'}</td>
                          
                          <td className="px-6 py-4 text-sm font-bold text-indigo-700">
                            {typeof s.predictedPercentage === 'number' ? `${s.predictedPercentage}%` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">
                            {typeof s.predictedLessonMark === 'number' ? `${s.predictedLessonMark} / ${s.lessonMaxMark}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {s.predictionStatus === 'AVAILABLE' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Available
                              </span>
                            ) : s.predictionStatus === 'ML_SERVICE_UNAVAILABLE' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800" title="ML prediction service could not be reached or timed out">
                                Service Unavailable
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title={s.missingData ? `Missing: ${s.missingData.join(', ')}` : 'Incomplete quiz data'}>
                                Insufficient Data
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50">
                  <span className="text-sm text-slate-700">
                    Showing <span className="font-semibold">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * rowsPerPage, filteredStudents.length)}</span> of <span className="font-semibold">{filteredStudents.length}</span> students
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
