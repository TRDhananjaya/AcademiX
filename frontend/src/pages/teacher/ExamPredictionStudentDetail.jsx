import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { navigate } from '../../App';

export default function ExamPredictionStudentDetail({ studentId }) {
  const [activeNav, setActiveNav] = useState('analytics');

  const [studentData, setStudentData] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentPredictionData() {
      if (!studentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ml/student/${studentId}`);
        const data = await res.json();

        if (res.ok) {
          setStudentData(data);

          // Determine the default selected lesson
          if (data.lessons && data.lessons.length > 0) {
            // Check query param first
            const params = new URLSearchParams(window.location.search);
            const queryLessonId = params.get('lessonId');

            if (queryLessonId && data.lessons.find(l => l.lessonId === queryLessonId)) {
              setSelectedLessonId(queryLessonId);
            } else {
              // Default to the first (most recent) lesson
              setSelectedLessonId(data.lessons[0].lessonId);
            }
          }
        } else {
          setError(data.message || "Failed to load student prediction data.");
        }
      } catch (err) {
        setError("Network error while fetching student data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudentPredictionData();
  }, [studentId]);

  const selectedLesson = studentData?.lessons?.find(l => l.lessonId === selectedLessonId);

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          {/* Header & Navigation */}
          <button onClick={() => navigate('/exam-prediction')} className="flex items-center text-indigo-600 text-sm font-semibold mb-6 hover:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to ML Predictions
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1 text-indigo-700">Student Prediction Details</h1>
              <p className="text-slate-500 text-sm font-medium">View overall performance summary and lesson-specific ML predictions for the student.</p>
            </div>
          </div>

          {isLoading && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></span>
              <p className="text-slate-500 font-medium">Loading student details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {studentData && !isLoading && (
            <div className="animate-in fade-in duration-500 space-y-8">

              {/* STUDENT HEADER CARD */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    {studentData.student.studentName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{studentData.student.studentName}</h2>
                    <p className="text-slate-500 font-medium">{studentData.student.studentId} • {studentData.student.grade}</p>
                  </div>
                </div>
              </div>

              {/* OVERALL PERFORMANCE SUMMARY */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Overall Student Prediction Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">Available Lessons</p>
                    <p className="text-2xl font-bold text-slate-800">{studentData.summary.availableLessons}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">Average Prediction</p>
                    <p className="text-2xl font-bold text-indigo-600">{studentData.summary.averagePredictedPercentage}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">Highest Prediction</p>
                    <p className="text-2xl font-bold text-emerald-600">{studentData.summary.highestPredictedPercentage}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">Lowest Prediction</p>
                    <p className="text-2xl font-bold text-rose-600">{studentData.summary.lowestPredictedPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* LESSON FILTER */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Lesson for Details</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full border border-slate-300 text-slate-800 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm"
                  >
                    {studentData.lessons.length === 0 && <option value="">No lessons available</option>}
                    {studentData.lessons.map(l => (
                      <option key={l.lessonId} value={l.lessonId}>{l.lessonName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SELECTED LESSON DETAILS */}
              {selectedLesson ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-4">

                  {/* Quiz Performance Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <p className="text-sm font-bold text-emerald-600 mb-4 uppercase tracking-wider">Lesson Performance</p>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">{selectedLesson.lessonName}</h3>

                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <p className="text-sm font-medium text-slate-500">Quiz 1</p>
                        <p className="text-base font-bold text-slate-800">{selectedLesson.features?.Quiz_1_Score ? `${selectedLesson.features.Quiz_1_Score}%` : '-'}</p>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <p className="text-sm font-medium text-slate-500">Quiz 2</p>
                        <p className="text-base font-bold text-slate-800">{selectedLesson.features?.Quiz_2_Score ? `${selectedLesson.features.Quiz_2_Score}%` : '-'}</p>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <p className="text-sm font-medium text-slate-500">Quiz 3</p>
                        <p className="text-base font-bold text-slate-800">{selectedLesson.features?.Quiz_3_Score ? `${selectedLesson.features.Quiz_3_Score}%` : '-'}</p>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <p className="text-sm font-bold text-indigo-600">Quiz Average</p>
                        <p className="text-base font-bold text-indigo-700">{selectedLesson.features?.Quiz_Average ? `${selectedLesson.features.Quiz_Average.toFixed(2)}%` : '-'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <p className="text-sm font-bold text-slate-700">Follow-up Quiz</p>
                        <p className="text-base font-bold text-slate-800">{selectedLesson.features?.Followup_Quiz_Score ? `${selectedLesson.features.Followup_Quiz_Score}%` : '-'}</p>
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

                      {selectedLesson.predictionStatus === 'INSUFFICIENT_DATA' ? (
                        <div className="bg-white/10 p-4 rounded-xl border border-white/20 w-full mt-4 text-left">
                          <p className="text-white font-bold mb-2">Prediction Unavailable</p>
                          <p className="text-indigo-100 text-sm mb-3">
                            Student must complete all 3 module quizzes and the follow-up quiz for this lesson to generate a prediction.
                          </p>
                          {selectedLesson.missingData && selectedLesson.missingData.length > 0 && (
                            <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                              <p className="text-white text-xs font-bold uppercase mb-2">Missing Items:</p>
                              <ul className="text-indigo-100 text-sm list-disc list-inside">
                                {selectedLesson.missingData.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : selectedLesson.predictionStatus === 'ML_SERVICE_UNAVAILABLE' ? (
                        <div className="bg-white/10 p-4 rounded-xl border border-white/20 w-full mt-4">
                          <p className="text-white font-bold mb-2">Service Unavailable</p>
                          <p className="text-indigo-100 text-sm">
                            The ML prediction service is currently offline or unreachable.
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-indigo-50 text-sm mb-1">Predicted Performance</p>
                          <p className="text-4xl font-bold text-white mb-4">{selectedLesson.predictedPercentage}%</p>

                          <p className="text-indigo-50 text-sm mb-1">Predicted Lesson Term-Test Mark</p>
                          <p className="text-5xl font-bold text-white mb-2">
                            {selectedLesson.predictedLessonMark ? selectedLesson.predictedLessonMark.toFixed(1) : '-'} <span className="text-3xl text-indigo-200">/ {selectedLesson.maxMark}</span>
                          </p>


                        </>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center p-8 bg-white border border-slate-100 rounded-xl">
                  <p className="text-slate-500">Select a lesson from the dropdown to view detailed performance and predictions.</p>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
