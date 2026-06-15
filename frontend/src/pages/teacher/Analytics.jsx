import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';

export default function Analytics() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [quizFilter, setQuizFilter] = useState('All Quizzes');
  const [studentSearch, setStudentSearch] = useState('');
  
  const [activeNav, setActiveNav] = useState('analytics');

  const fetchAnalytics = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/analytics?page=${page}&limit=20`;
      if (quizFilter !== 'All Quizzes') url += `&quizId=${quizFilter}`;
      if (studentSearch.trim() !== '') url += `&studentName=${encodeURIComponent(studentSearch)}`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setRecords(data.records || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, perPage: 20 });
      } else {
        console.error('Failed to fetch analytics data');
        setError('Failed to fetch analytics data. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('A network error occurred while fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    const timeoutId = setTimeout(() => {
      fetchAnalytics(1);
    }, 500); // debounce search
    
    return () => clearTimeout(timeoutId);
  }, [quizFilter, studentSearch]);

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchAnalytics(pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchAnalytics(pagination.currentPage - 1);
    }
  };

  const quizOptions = ['All Quizzes', 'Q1.1', 'Q1.2', 'Q1.3', 'Q2.1', 'Q2.2', 'Q3.1', 'Q3.2'];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-500">Monitor student performance and quiz attempt records</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {/* Filters Section */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
              <div className="flex w-full md:w-auto items-center gap-4">
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
              </div>
              <div className="flex w-full md:w-auto items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-600 hidden md:block">Filter by Quiz:</label>
                  <select
                    value={quizFilter}
                    onChange={(e) => setQuizFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer shadow-sm"
                  >
                    {quizOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Taken</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-4 text-sm text-slate-500 font-medium">Loading analytics...</p>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-slate-600 font-medium text-lg">No records found</p>
                        <p className="text-sm text-slate-400 mt-1">Make sure students have completed quizzes.</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mr-3 shadow-sm border border-indigo-50">
                              {record.studentName?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                            <span className="font-medium text-slate-800">{record.studentName || 'Unknown Student'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-500">
                          {record.studentId}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-600">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">
                            {record.quizId}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          <span className="font-bold text-indigo-600">
                            {record.score}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">{record.timeTaken}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && records.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-800">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> to <span className="font-medium text-slate-800">{Math.min(pagination.currentPage * pagination.perPage, pagination.totalRecords)}</span> of <span className="font-medium text-slate-800">{pagination.totalRecords}</span> results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      pagination.currentPage === 1 
                        ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed' 
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      pagination.currentPage === pagination.totalPages 
                        ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed' 
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
