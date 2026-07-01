import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  
  const [loading, setLoading] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [streak, setStreak] = useState(0);

  // Fetch Student Analytics
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const resAnalytics = await fetch(`/api/analytics/student/${user.username}`);
        if (resAnalytics.ok) {
          const analyticsData = await resAnalytics.json();
          setAnalytics(analyticsData);
          
          // Calculate streak from history
          if (analyticsData && analyticsData.history) {
            const calculatedStreak = calculateStreak(analyticsData.history);
            setStreak(calculatedStreak);
          }
        }
      } catch (err) {
        console.error('Error loading analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Fetch ML Prediction independently
  useEffect(() => {
    if (!user) return;

    const fetchPrediction = async () => {
      try {
        setLoadingPrediction(true);
        const resPrediction = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.username, lessonId: '' }) // General prediction
        });
        if (resPrediction.ok) {
          const predData = await resPrediction.json();
          setPrediction(predData);
        }
      } catch (predErr) {
        console.error('Error fetching prediction:', predErr);
      } finally {
        setLoadingPrediction(false);
      }
    };

    fetchPrediction();
  }, [user]);

  // Helper to calculate learning streak from quiz submission history
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;
    
    // Extract unique dates of submission in YYYY-MM-DD local format
    const dates = history.map(item => {
      const d = new Date(item.submittedAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }
    
    let currentCheckStr = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
    let checkDate = new Date(currentCheckStr);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
        <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
          <StudentTopBar />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Generating your AI insights...</p>
          </div>
        </div>
      </div>
    );
  }

  // Map Data for Course Progress Card
  const overallAvg = analytics?.summary?.overallAverage || 0;
  const progressData = [
    { name: 'Completed', value: overallAvg },
    { name: 'Remaining', value: Math.max(0, 100 - overallAvg) }
  ];

  // Map Streak Info
  const streakTarget = streak < 7 ? 7 : (streak < 14 ? 14 : 30);
  const streakPercent = Math.min(100, (streak / streakTarget) * 100);
  const daysRemaining = streakTarget - streak;

  // Map Focus Areas (Lowest score lessons)
  const focusAreas = analytics?.trendData 
    ? [...analytics.trendData].sort((a, b) => a.percentage - b.percentage).slice(0, 2)
    : [];

  // Map AI Optimized Plan
  const weakestLesson = analytics?.summary?.weakestLesson && analytics.summary.weakestLesson !== 'N/A' 
    ? analytics.summary.weakestLesson 
    : null;
  const planTitle = weakestLesson ? `Your Optimized Plan for ${weakestLesson}` : 'Your Optimized Plan for Today';
  const planDescription = weakestLesson
    ? `Based on your recent quiz performance, we've prioritized ${weakestLesson} and structured a focused session.`
    : 'Ready to start? Complete a practice quiz, and the AI will analyze your weaknesses to build a custom plan.';
  const planTasks = weakestLesson
    ? [
        { name: `Read Chapter: ${weakestLesson} Key Concepts`, est: '35 mins' },
        { name: `Practice Set: ${weakestLesson} Practice Quiz`, est: '25 mins' }
      ]
    : [
        { name: 'Review study materials & lessons', est: '20 mins' },
        { name: 'Attempt a practice quiz', est: '15 mins' }
      ];

  // Map Exam Prediction
  let predictedGrade = 'N/A';
  let predictionDetails = 'Take a quiz first';
  let trendIndicator = '0% since last week';
  let isPositiveTrend = true;

  if (prediction) {
    const score = prediction.prediction?.predictedScore || 0;
    if (score >= 90) predictedGrade = 'A+';
    else if (score >= 80) predictedGrade = 'A';
    else if (score >= 70) predictedGrade = 'B';
    else if (score >= 60) predictedGrade = 'C';
    else if (score >= 50) predictedGrade = 'D';
    else predictedGrade = 'F';

    predictionDetails = `Score: ${score.toFixed(0)}% (${prediction.predictedMarks.toFixed(1)} / ${prediction.totalMarks})`;
    const improvement = prediction.improvementPercentage || 0;
    trendIndicator = `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}% improvement trend`;
    isPositiveTrend = improvement >= 0;
  }

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
              Welcome back, {user ? (user.firstName || user.username) : 'Student'}!
            </h1>
            <p className="text-slate-500 text-base">
              Ready to crush your goals today? Your AI plan is waiting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Course Progress Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-slate-800 font-semibold text-[15px]">Course Progress</h3>
                <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
              </div>
              
              <div className="relative w-36 h-36 mt-2 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3b28cc" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{overallAvg.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {analytics?.history?.[0]?.lessonName || 'No Quizzes Taken'}
              </p>
            </div>

            {/* Learning Streak Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-slate-400 font-medium text-[15px]">Learning Streak</h3>
                  <span className="text-amber-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6667 2L10 6.66667H14.1667L12.5 11.3333L16.6667 9.66667L11.6667 20V14.1667H8.33333L9.16667 9.66667L5 10.5L11.6667 2Z"/>
                    </svg>
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-slate-800 tracking-tight">{streak}</span>
                  <span className="text-slate-400 font-semibold ml-2 text-sm uppercase tracking-wider">Days</span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex gap-1.5 mb-3">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full ${
                        i < Math.round((streakPercent / 100) * 7) ? 'bg-amber-400' : 'bg-slate-100'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {daysRemaining > 0 
                    ? `${daysRemaining} more day${daysRemaining > 1 ? 's' : ''} to unlock the '${streakTarget === 7 ? 'Consistency' : 'Expert'}' badge!`
                    : 'Congrats! You unlocked the badge! Keep up the streak!'}
                </p>
              </div>
            </div>

            {/* Focus Area Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-full flex justify-between items-center mb-6">
                  <h3 className="text-slate-400 font-medium text-[15px]">Focus Area</h3>
                  <span className="text-red-400 border border-red-200 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">?</span>
                </div>
                
                <div className="space-y-4">
                  {focusAreas.length > 0 ? (
                    focusAreas.map((topic, i) => {
                      const isWeak = topic.percentage < 50;
                      const statusText = isWeak ? 'Needs review' : 'Moderate';
                      const colorClass = isWeak ? 'text-red-400' : 'text-amber-400';
                      const bgClass = isWeak ? 'bg-red-400' : 'bg-amber-400';

                      return (
                        <div key={i}>
                          <div className="flex justify-between text-[13px] mb-1.5 font-medium">
                            <span className="text-slate-700 font-medium truncate max-w-[130px]">{topic.lesson}</span>
                            <span className={colorClass}>{statusText} ({topic.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`${bgClass} h-full rounded-full`} style={{ width: `${topic.percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Take quizzes to analyze strengths and weaknesses.
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/student/quizzes')}
                className="w-full mt-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Review Topics
              </button>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Optimized Plan Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              
              {/* Background Graphic Pattern */}
              <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 A 20 20 0 0 1 50 50 A 20 20 0 0 0 90 50" stroke="#3b28cc" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="50" r="8" fill="#3b28cc"/>
                  <circle cx="90" cy="50" r="8" fill="#3b28cc"/>
                  <circle cx="50" cy="50" r="4" fill="#3b28cc"/>
                </svg>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#e0f7fa] text-[#00838f] px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-6">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>
                  AI GENERATED
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-3 max-w-sm">
                  {planTitle}
                </h2>
                
                <p className="text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
                  {planDescription}
                </p>

                <div className="space-y-6">
                  {planTasks.map((task, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-5 h-5 rounded border-2 border-slate-200 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-[15px] font-medium text-slate-800">{task.name}</h4>
                        <p className="text-[13px] text-slate-400 mt-1">Est. {task.est}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => navigate('/student/quizzes')}
                  className="bg-[#3b28cc] text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Start Session
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* Final Exam Prediction Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden justify-center min-h-[300px]">
              <h3 className="text-slate-400 font-bold tracking-widest text-[11px] uppercase mb-8 w-full text-center">Final Exam Prediction</h3>
              
              {loadingPrediction ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-150 border-t-indigo-600 animate-spin mb-4"></div>
                  <span className="text-xs text-slate-400 font-medium">Predicting grade...</span>
                </div>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-full border-[6px] border-[#3b28cc] flex items-center justify-center bg-white shadow-[0_0_40px_rgba(59,40,204,0.15)] relative z-10 mb-6">
                    <span className="text-5xl font-extrabold text-[#3b28cc] tracking-tight">{predictedGrade}</span>
                  </div>
                  
                  <div className="bg-slate-50 px-4 py-1.5 rounded-full text-slate-500 text-xs font-semibold mb-2">
                    {predictionDetails}
                  </div>

                  <div className={`text-xs font-bold ${isPositiveTrend ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trendIndicator}
                  </div>
                </>
              )}

              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-3/4">
                 <div className="h-1 w-full bg-gradient-to-r from-cyan-200 via-indigo-500 to-slate-200 rounded-full"></div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
