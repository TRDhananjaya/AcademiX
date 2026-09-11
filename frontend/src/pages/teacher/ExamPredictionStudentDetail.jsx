import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

export default function ExamPredictionStudentDetail({ lessonId, studentId }) {
  const [activeNav, setActiveNav] = useState('analytics');

  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrediction() {
      if (!studentId || !lessonId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, lessonId })
        });
        const data = await res.json();
        if (res.ok) {
          setPredictionData(data);
        } else {
          setError(data.error || data.message || "Not enough data available to generate prediction.");
        }
      } catch (err) {
        setError("Network error while fetching prediction.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrediction();
  }, [studentId, lessonId]);

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          {/* Header & Navigation */}
          <button onClick={() => navigate('/exam-prediction')} className="flex items-center text-indigo-600 text-sm font-semibold mb-6 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Lesson Predictions
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">Student Prediction Detail</h1>
              <p className="text-slate-500 text-sm font-medium">Detailed view of a student's performance and predicted term mark for the selected lesson.</p>
            </div>
          </div>

          {isLoading && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></span>
              <p className="text-slate-500 font-medium">Loading prediction details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {predictionData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">

              {/* Student Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                <p className="text-sm font-bold text-indigo-600 mb-4 uppercase tracking-wider">Student Information</p>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-1">Student Name</p>
                  <p className="text-2xl font-bold text-slate-900 mb-4 truncate">{predictionData.studentName}</p>
                  <p className="text-sm font-medium text-slate-500 mb-1">Student ID</p>
                  <p className="text-lg font-bold text-slate-700 mb-4">{studentId}</p>
                  <p className="text-sm font-medium text-slate-500 mb-1">Selected Lesson</p>
                  <p className="text-lg font-bold text-slate-700">{predictionData.lesson}</p>
                </div>
              </div>

              {/* Quiz Performance Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <p className="text-sm font-bold text-emerald-600 mb-4 uppercase tracking-wider">Lesson Performance</p>

                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-sm font-medium text-slate-500">Quiz 1</p>
                    <p className="text-base font-bold text-slate-800">{predictionData.features?.Quiz_1_Score ? `${predictionData.features.Quiz_1_Score}%` : '-'}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-sm font-medium text-slate-500">Quiz 2</p>
                    <p className="text-base font-bold text-slate-800">{predictionData.features?.Quiz_2_Score ? `${predictionData.features.Quiz_2_Score}%` : '-'}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-sm font-medium text-slate-500">Quiz 3</p>
                    <p className="text-base font-bold text-slate-800">{predictionData.features?.Quiz_3_Score ? `${predictionData.features.Quiz_3_Score}%` : '-'}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-sm font-bold text-indigo-600">Quiz Average</p>
                    <p className="text-base font-bold text-indigo-700">{predictionData.features?.Quiz_Average ? `${predictionData.features.Quiz_Average.toFixed(2)}%` : '-'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <p className="text-sm font-bold text-slate-700">Follow-up Quiz</p>
                    <p className="text-base font-bold text-slate-800">{predictionData.features?.Followup_Quiz_Score ? `${predictionData.features.Followup_Quiz_Score}%` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* ML Prediction Result Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-md border border-indigo-500 p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-10">
                  <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-indigo-100 text-sm font-bold mb-4 uppercase tracking-wider w-full text-left">ML Prediction Result</p>

                  {predictionData.predictionStatus === 'INSUFFICIENT_DATA' ? (
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 w-full">
                      <p className="text-white font-bold mb-2">Prediction Unavailable</p>
                      <p className="text-indigo-100 text-sm">
                        Student must complete all 3 module quizzes and the follow-up quiz for this lesson to generate a prediction.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-indigo-50 text-sm mb-1">Predicted Performance</p>
                      <p className="text-4xl font-bold text-white mb-4">{predictionData.predictedPercentage}%</p>

                      <p className="text-indigo-50 text-sm mb-1">Predicted Lesson Term-Test Mark</p>
                      <p className="text-5xl font-bold text-white mb-2">
                        {predictionData.predictedMarks ? predictionData.predictedMarks.toFixed(1) : '-'} <span className="text-3xl text-indigo-200">/ {predictionData.totalMarks}</span>
                      </p>


                    </>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
