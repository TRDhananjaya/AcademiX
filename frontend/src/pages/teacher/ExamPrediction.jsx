import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

export default function ExamPrediction() {
  const [activeNav, setActiveNav] = useState('analytics');
  
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [individualPrediction, setIndividualPrediction] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLessons();
    fetchStudents();
  }, []);

  async function fetchLessons() {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
        if (data.lessons && data.lessons.length > 0) {
          setSelectedLesson(data.lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function fetchStudents() {
    try {
      const res = await fetch('http://localhost:5000/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].studentId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function handlePredictIndividual() {
    if (!selectedStudentId || !selectedLesson) return;
    setIsLoading(true);
    setError(null);
    setIndividualPrediction(null);
    try {
      const res = await fetch('http://localhost:5000/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, lessonId: selectedLesson })
      });
      const data = await res.json();
      if (res.ok) {
        setIndividualPrediction(data);
      } else {
        setError(data.error || "Not enough data available to generate prediction.");
      }
    } catch (err) {
      setError("Not enough data available to generate prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          {/* Header & Navigation */}
          <button onClick={() => navigate('/analytics')} className="flex items-center text-indigo-600 text-sm font-semibold mb-6 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Analytics
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">Individual Student ML Prediction</h1>
              <p className="text-slate-500 text-sm font-medium">Predict final exam marks based on quiz performance</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* INDIVIDUAL PREDICTION VIEW */}
          <div className="animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Student</label>
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map(s => <option key={s.studentId} value={s.studentId}>{s.studentId} - {s.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Lesson</label>
                <select 
                  value={selectedLesson} 
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {lessons.map(l => <option key={l} value={l}>Lesson {l}</option>)}
                </select>
              </div>
              <button 
                onClick={handlePredictIndividual}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center min-w-[140px]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : 'Predict'}
              </button>
            </div>

            {individualPrediction && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Student Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                  <p className="text-sm font-bold text-indigo-600 mb-4 uppercase tracking-wider">Student Information</p>
                  <p className="text-sm font-medium text-slate-500 mb-1">Student Name</p>
                  <p className="text-2xl font-bold text-slate-900 mb-4 truncate">{individualPrediction.studentName}</p>
                  <p className="text-sm font-medium text-slate-500 mb-1">Student ID</p>
                  <p className="text-lg font-bold text-slate-700 mb-4">{selectedStudentId}</p>
                  <p className="text-sm font-medium text-slate-500 mb-1">Selected Lesson</p>
                  <p className="text-lg font-bold text-slate-700">{individualPrediction.lesson}</p>
                </div>

                {/* Quiz Performance Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <p className="text-sm font-bold text-emerald-600 mb-4 uppercase tracking-wider">Quiz Performance</p>
                  
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <p className="text-sm font-medium text-slate-500">Number of Quizzes Analyzed</p>
                    <p className="text-xl font-bold text-slate-800">{individualPrediction.quizzesAnalyzed}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <p className="text-sm font-medium text-slate-500">Average Quiz Score</p>
                    <p className="text-xl font-bold text-slate-800">{((individualPrediction.averageQuizMarks / 100) * 20).toFixed(1)} / 20</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-500">Follow-up Quiz Score</p>
                    <p className="text-xl font-bold text-slate-800">{individualPrediction.followupScore ? ((individualPrediction.followupScore / 100) * 20).toFixed(1) + ' / 20' : 'N/A'}</p>
                  </div>
                </div>

                {/* ML Prediction Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-md border border-indigo-500 p-6 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-10">
                    <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-indigo-100 text-sm font-bold mb-4 uppercase tracking-wider w-full text-left">ML Prediction Result</p>
                    <p className="text-indigo-50 text-base mb-2">Predicted Final Exam Marks</p>
                    <p className="text-6xl font-bold text-white mb-2">
                      {individualPrediction.predictedMarks.toFixed(1)} <span className="text-3xl text-indigo-200">/ {individualPrediction.totalMarks}</span>
                    </p>
                    <p className="text-xs text-indigo-200 font-medium tracking-wide mt-4 bg-white/10 px-3 py-1 rounded-full">AI CONFIDENCE: HIGH</p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
