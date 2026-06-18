import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Analytics() {
  const [viewMode, setViewMode] = useState('quiz'); // 'quiz' or 'student'
  const [activeNav, setActiveNav] = useState('analytics');
  const [error, setError] = useState(null);

  // --- Quiz Analytics View States ---
  const [quizzes, setQuizzes] = useState([]);
  const [quizFilter, setQuizFilter] = useState('');
  const [quizRecords, setQuizRecords] = useState([]);
  const [quizSummary, setQuizSummary] = useState(null);
  const [quizPagination, setQuizPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 10 });
  const [quizStudentSearch, setQuizStudentSearch] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);

  // --- Student Performance View States ---
  const [lessons, setLessons] = useState([]);
  const [lessonFilter, setLessonFilter] = useState('');
  const [studentRecords, setStudentRecords] = useState([]);
  const [lessonSummary, setLessonSummary] = useState(null);
  const [studentPagination, setStudentPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 10 });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  // --- Individual Student View States ---
  const [studentsList, setStudentsList] = useState([]);
  const [individualStudentFilter, setIndividualStudentFilter] = useState('');
  const [individualData, setIndividualData] = useState(null);
  const [individualLoading, setIndividualLoading] = useState(false);

  // Initial Fetch (Quizzes & Lessons)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [quizzesRes, lessonsRes, studentsRes] = await Promise.all([
          fetch('http://localhost:5000/api/analytics/quizzes'),
          fetch('http://localhost:5000/api/analytics/lessons'),
          fetch('http://localhost:5000/api/analytics/students')
        ]);
        const quizzesData = await quizzesRes.json();
        const lessonsData = await lessonsRes.json();
        const studentsData = await studentsRes.json();

        if (quizzesData.quizzes?.length > 0) {
          setQuizzes(quizzesData.quizzes);
          setQuizFilter(quizzesData.quizzes[0]);
        }
        if (lessonsData.lessons?.length > 0) {
          setLessons(lessonsData.lessons);
          setLessonFilter(lessonsData.lessons[0]);
        }
        if (studentsData.students?.length > 0) {
          setStudentsList(studentsData.students);
          setIndividualStudentFilter(studentsData.students[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Quiz Analytics Data
  const fetchQuizAnalytics = async (page = 1) => {
    if (!quizFilter) return;
    setQuizLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/analytics?page=${page}&limit=10&quizId=${quizFilter}`;
      if (quizStudentSearch.trim() !== '') url += `&studentName=${encodeURIComponent(quizStudentSearch)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setQuizRecords(data.records || []);
        setQuizSummary(data.summary || null);
        setQuizPagination(data.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 10 });
      } else {
        setError('Failed to fetch quiz analytics data.');
      }
    } catch (err) {
      setError('A network error occurred while fetching quiz analytics.');
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'quiz' && quizFilter) {
      const timeoutId = setTimeout(() => {
        fetchQuizAnalytics(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [quizFilter, quizStudentSearch, viewMode]);

  // Fetch Student Performance Data
  const fetchStudentPerformance = async (page = 1) => {
    if (!lessonFilter) return;
    setStudentLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/analytics/student-performance?page=${page}&limit=10&lessonId=${lessonFilter}`;
      if (studentSearch.trim() !== '') url += `&studentName=${encodeURIComponent(studentSearch)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setStudentRecords(data.records || []);
        setLessonSummary(data.summary || null);
        setStudentPagination(data.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 10 });
      } else {
        setError('Failed to fetch student performance data.');
      }
    } catch (err) {
      setError('A network error occurred while fetching student performance.');
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'student' && lessonFilter) {
      const timeoutId = setTimeout(() => {
        fetchStudentPerformance(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [lessonFilter, studentSearch, viewMode]);

  // Fetch Individual Student Data
  const fetchIndividualAnalytics = async () => {
    if (!individualStudentFilter) return;
    setIndividualLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/analytics/student/${individualStudentFilter}`);
      const data = await res.json();
      if (res.ok) {
        setIndividualData(data);
      } else {
        setError('Failed to fetch individual student data.');
      }
    } catch (err) {
      setError('Network error while fetching individual student data.');
    } finally {
      setIndividualLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'individual' && individualStudentFilter) {
      fetchIndividualAnalytics();
    }
  }, [viewMode, individualStudentFilter]);

  const handleNextPage = () => {
    if (quizPagination.currentPage < quizPagination.totalPages) {
      fetchQuizAnalytics(quizPagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (quizPagination.currentPage > 1) {
      fetchQuizAnalytics(quizPagination.currentPage - 1);
    }
  };

  const handleStudentNextPage = () => {
    if (studentPagination.currentPage < studentPagination.totalPages) {
      fetchStudentPerformance(studentPagination.currentPage + 1);
    }
  };

  const handleStudentPrevPage = () => {
    if (studentPagination.currentPage > 1) {
      fetchStudentPerformance(studentPagination.currentPage - 1);
    }
  };

  const chartData = quizRecords.slice(0, 10).map(r => ({
    name: r.studentName?.split(' ')[0] || r.studentId,
    score: r.score
  }));

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header & Controls */}
          <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Analytics Dashboard</h1>
              <p className="text-slate-500">Monitor quiz performance and overall student progress</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex bg-slate-200/50 p-1 rounded-xl shadow-inner border border-slate-200">
                <button
                  onClick={() => setViewMode('quiz')}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    viewMode === 'quiz' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Quiz Analytics
                </button>
                <button
                  onClick={() => setViewMode('student')}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    viewMode === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Lesson Performance
                </button>
                <button
                  onClick={() => setViewMode('individual')}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    viewMode === 'individual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Individual Student
                </button>
              </div>

              <button
                onClick={() => navigate('/exam-prediction')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ML Prediction
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* =========================================
              QUIZ ANALYTICS VIEW
              ========================================= */}
          {viewMode === 'quiz' && (
            <div className="animate-in fade-in duration-500">
              {/* Summary Cards */}
              {quizSummary && !quizLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Total Attended</p>
                      <p className="text-3xl font-bold text-slate-900">{quizSummary.totalStudents}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Highest Score</p>
                      <p className="text-3xl font-bold text-slate-900">{quizSummary.highestScore}/20</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Average Score</p>
                      <p className="text-3xl font-bold text-slate-900">{quizSummary.averageScore ? quizSummary.averageScore.toFixed(1) : 0}/20</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Lowest Score</p>
                      <p className="text-3xl font-bold text-slate-900">{quizSummary.lowestScore}/20</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Section */}
              {!quizLoading && quizRecords.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Top Scores Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                  <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Student Name..."
                      value={quizStudentSearch}
                      onChange={(e) => setQuizStudentSearch(e.target.value)}
                      className="pl-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-sm font-medium text-slate-600 hidden md:block">Quiz:</label>
                    <select
                      value={quizFilter}
                      onChange={(e) => setQuizFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer shadow-sm min-w-[150px] w-full md:w-auto"
                    >
                      <option value="" disabled>Select a Quiz</option>
                      {quizzes.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz Name</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks Obtained</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizLoading ? (
                        <tr>
                          <td colSpan="5" className="py-16 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-4 text-sm text-slate-500 font-medium">Loading analytics...</p>
                          </td>
                        </tr>
                      ) : quizRecords.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <p className="text-slate-600 font-medium text-lg">No Data Available</p>
                          </td>
                        </tr>
                      ) : (
                        quizRecords.map((record, index) => {
                          const rank = (quizPagination.currentPage - 1) * quizPagination.perPage + index + 1;
                          return (
                          <tr key={record._id || index} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm
                                ${rank === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                  rank === 2 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                                  rank === 3 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                  'bg-slate-100 text-slate-500 border border-slate-200'}`
                              }>
                                #{rank}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-500">{record.studentId}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mr-3 shadow-sm border border-indigo-50">
                                  {record.studentName?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                                <span className="font-medium text-slate-800">{record.studentName || 'Unknown Student'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-600">
                              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">{record.quizId}</span>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-indigo-600">{record.score}/20</td>
                            <td className="py-4 px-6 text-sm text-slate-600 font-medium">{((record.score / 20) * 100).toFixed(0)}%</td>
                          </tr>
                        );})
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!quizLoading && quizRecords.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Showing <span className="font-medium text-slate-800">{(quizPagination.currentPage - 1) * quizPagination.perPage + 1} - {Math.min(quizPagination.currentPage * quizPagination.perPage, quizPagination.totalRecords)}</span> of <span className="font-medium text-slate-800">{quizPagination.totalRecords}</span> students
                    </span>
                    <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                      <button onClick={handlePrevPage} disabled={quizPagination.currentPage === 1} className={`flex items-center gap-1 transition-colors ${quizPagination.currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}>&lt; Previous</button>
                      <span>Page {quizPagination.currentPage} of {quizPagination.totalPages || 1}</span>
                      <button onClick={handleNextPage} disabled={quizPagination.currentPage === quizPagination.totalPages} className={`flex items-center gap-1 transition-colors ${quizPagination.currentPage === quizPagination.totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}>Next &gt;</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================
              STUDENT PERFORMANCE VIEW
              ========================================= */}
          {viewMode === 'student' && (
            <div className="animate-in fade-in duration-500">
              {/* Summary Cards */}
              {lessonSummary && !studentLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
                      <p className="text-3xl font-bold text-slate-900">{lessonSummary.totalStudents}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Highest Avg</p>
                      <p className="text-3xl font-bold text-slate-900">{lessonSummary.highestStudentAverage ? ((lessonSummary.highestStudentAverage / 20) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Class Average</p>
                      <p className="text-3xl font-bold text-slate-900">{lessonSummary.classAverage ? ((lessonSummary.classAverage / 20) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                    <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mr-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Lowest Avg</p>
                      <p className="text-3xl font-bold text-slate-900">{lessonSummary.lowestStudentAverage ? ((lessonSummary.lowestStudentAverage / 20) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                  <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Student Name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-sm font-medium text-slate-600 hidden md:block">Lesson:</label>
                    <select
                      value={lessonFilter}
                      onChange={(e) => setLessonFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer shadow-sm min-w-[150px] w-full md:w-auto"
                    >
                      <option value="" disabled>Select a Lesson</option>
                      {lessons.map((opt) => (
                        <option key={opt} value={opt}>Lesson {opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Info</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Attempted</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Score</th>
                        <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lowest Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentLoading ? (
                        <tr>
                          <td colSpan="6" className="py-16 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-4 text-sm text-slate-500 font-medium">Analyzing performance...</p>
                          </td>
                        </tr>
                      ) : studentRecords.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="text-slate-600 font-medium text-lg">No Data Available</p>
                            <p className="text-sm text-slate-400 mt-1">No students have taken quizzes for this lesson yet.</p>
                          </td>
                        </tr>
                      ) : (
                        studentRecords.map((record) => (
                          <tr key={record.studentId} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm
                                ${record.rank === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                  record.rank === 2 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                                  record.rank === 3 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                  'bg-slate-100 text-slate-500 border border-slate-200'}`
                              }>
                                #{record.rank}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3 shadow-sm border border-indigo-50">
                                  {record.studentName?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{record.studentName || 'Unknown Student'}</p>
                                  <p className="text-xs text-slate-500">{record.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-600 text-center">
                              <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 border border-slate-200">
                                {record.quizzesAttempted}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-lg font-bold text-indigo-600">
                                  {record.averageScore ? ((record.averageScore / 20) * 100).toFixed(1) : 0}%
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({record.averageScore?.toFixed(1)}/20 marks)
                                </span>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className="h-full bg-indigo-500" 
                                    style={{width: `${Math.min(100, (record.averageScore / 20) * 100)}%`}}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-emerald-600">{record.highestScore}/20</td>
                            <td className="py-4 px-6 text-sm font-bold text-rose-600">{record.lowestScore}/20</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!studentLoading && studentRecords.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Showing <span className="font-medium text-slate-800">{(studentPagination.currentPage - 1) * studentPagination.perPage + 1} - {Math.min(studentPagination.currentPage * studentPagination.perPage, studentPagination.totalRecords)}</span> of <span className="font-medium text-slate-800">{studentPagination.totalRecords}</span> students
                    </span>
                    <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                      <button onClick={handleStudentPrevPage} disabled={studentPagination.currentPage === 1} className={`flex items-center gap-1 transition-colors ${studentPagination.currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}>&lt; Previous</button>
                      <span>Page {studentPagination.currentPage} of {studentPagination.totalPages || 1}</span>
                      <button onClick={handleStudentNextPage} disabled={studentPagination.currentPage === studentPagination.totalPages} className={`flex items-center gap-1 transition-colors ${studentPagination.currentPage === studentPagination.totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}>Next &gt;</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================
              INDIVIDUAL STUDENT VIEW
              ========================================= */}
          {viewMode === 'individual' && (
            <div className="animate-in fade-in duration-500">
              {/* Filter */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Select Student:</label>
                <select
                  value={individualStudentFilter}
                  onChange={(e) => setIndividualStudentFilter(e.target.value)}
                  className="w-full md:w-80 rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm cursor-pointer"
                >
                  <option value="" disabled>Select a student</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                  ))}
                </select>
              </div>

              {individualLoading ? (
                <div className="py-16 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-sm text-slate-500 font-medium">Loading student data...</p>
                </div>
              ) : individualData ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 font-bold text-xl">
                        {individualData.studentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Student</p>
                        <p className="text-xl font-bold text-slate-900">{individualData.studentName}</p>
                        <p className="text-xs text-slate-400">{individualData.studentId}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Quizzes Completed</p>
                        <p className="text-3xl font-bold text-slate-900">{individualData.history.length}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Overall Average</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {individualData.history.length > 0 
                            ? (((individualData.history.reduce((sum, h) => sum + h.score, 0) / individualData.history.length) / 20) * 100).toFixed(1) 
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Line Chart */}
                  {individualData.trendData && individualData.trendData.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Lesson-wise Progress Trend</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={individualData.trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="lesson" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                            <Tooltip 
                              cursor={{stroke: '#e2e8f0', strokeWidth: 2}} 
                              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                            />
                            <Legend />
                            <Line type="monotone" name="Average %" dataKey="percentage" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Quiz History Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-white">
                      <h3 className="text-lg font-bold text-slate-800">Quiz History</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz ID</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {individualData.history.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-10 text-center text-slate-500">No quizzes taken yet.</td>
                            </tr>
                          ) : (
                            individualData.history.map((record) => (
                              <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-4 px-6 text-sm text-slate-500">
                                  {new Date(record.submittedAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-slate-800">
                                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">{record.quizId}</span>
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-indigo-600">{record.score}/20</td>
                                <td className="py-4 px-6 text-sm text-slate-600 font-medium">{((record.score / 20) * 100).toFixed(0)}%</td>
                                <td className="py-4 px-6 text-sm">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    (record.score / 20) * 100 >= 60 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {(record.score / 20) * 100 >= 60 ? 'Pass' : 'Fail'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
