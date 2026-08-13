import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { useAuth } from '../../context/AuthContext';
import StudyPlanReport from '../../components/study-plan/StudyPlanReport';

export default function StudyPlans() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('study-plans');
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState('all');

  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const fetchStudyPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/study-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudyPlans(data);
      }
    } catch (error) {
      console.error('Error fetching study plans:', error);
    } finally {
      // Simulate slightly longer loading for UI animation effect if needed
      setTimeout(() => setLoading(false), 500);
    }
  };

  const filteredPlans = selectedLessonId === 'all'
    ? studyPlans
    : studyPlans.filter(plan => plan.lessonId && plan.lessonId._id === selectedLessonId);

  return (
    <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="study-plans-layout">
      
      {/* Global CSS for Print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            border-radius: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <div className="no-print">
          <StudentTopBar />
        </div>
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <div className="mb-8 no-print flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-bold text-indigo-700 mb-1.5 tracking-tight">
                Ready to crush your goals, {user ? (user.firstName || user.username) : 'Student'}?
              </h1>
              <p className="text-slate-500 text-base">
                Here is your AI-curated study roadmap for today.
              </p>
            </div>

            {studyPlans.length > 0 && (
              <div className="min-w-[200px]">
                <label htmlFor="lesson-filter" className="block text-sm font-semibold text-slate-700 mb-2">
                  Filter by Lesson
                </label>
                <div className="relative">
                  <select
                    id="lesson-filter"
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="all">All Lessons</option>
                    {Array.from(
                      new Map(
                        studyPlans
                          .filter(plan => plan.lessonId && plan.lessonId._id)
                          .map(plan => [plan.lessonId._id, plan.lessonId])
                      ).values()
                    ).map(lesson => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.title || 'Unknown Lesson'}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            
            {loading ? (
              <div className="bg-white rounded-3xl p-16 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing your performance...</h3>
                <div className="flex flex-col gap-2 text-slate-500 font-medium text-sm text-center">
                  <span className="animate-pulse">Retrieving learning resources...</span>
                  <span className="animate-pulse" style={{animationDelay: '0.2s'}}>Generating personalized study notes...</span>
                  <span className="animate-pulse" style={{animationDelay: '0.4s'}}>Preparing your AI study report...</span>
                </div>
              </div>
            ) : studyPlans.length > 0 ? (
              filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <StudyPlanReport key={plan._id} planData={plan} user={user} />
                ))
              ) : (
                <div className="bg-white rounded-3xl p-16 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center text-center text-slate-500 min-h-[400px]">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-slate-800">No Study Plans found for this lesson.</h2>
                  <p className="text-[15px] max-w-md mx-auto">Try selecting a different lesson or "All Lessons".</p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-3xl p-16 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center text-center text-slate-500 min-h-[400px]">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-800">No AI Study Plans generated yet.</h2>
                <p className="text-[15px] max-w-md mx-auto">Complete a lesson's quizzes to get a personalized, high-quality study roadmap from our AI Assistant.</p>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
