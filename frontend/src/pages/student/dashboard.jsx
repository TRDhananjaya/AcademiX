import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { navigate } from '../../App';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  
  const [loading, setLoading] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('latest');

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

  // Fetch Community Hub recent posts
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const res = await fetch('/api/community');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCommunityPosts(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error loading community posts:', err);
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunity();
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
        <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
          <StudentTopBar />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic calculation for the marks display section based on selected filter
  let displayScore = 0;
  let displayLabel = 'No Quizzes Taken';

  if (analytics?.history && analytics.history.length > 0) {
    if (selectedLesson === 'latest') {
      // Display marks from the student's most recently completed quiz
      displayScore = analytics.history[0].percentage || 0;
      displayLabel = analytics.history[0].lessonName || 'Unknown Lesson';
    } else {
      // Find all quizzes associated with the selected lesson and get their average
      const lessonTrend = analytics.trendData?.find(item => item.lesson === selectedLesson);
      if (lessonTrend) {
        displayScore = lessonTrend.percentage || 0;
        displayLabel = selectedLesson;
      }
    }
  }

  const progressData = [
    { name: 'Completed', value: displayScore },
    { name: 'Remaining', value: Math.max(0, 100 - displayScore) }
  ];

  const uniqueLessons = analytics?.trendData 
    ? analytics.trendData.map(item => item.lesson).filter(lesson => lesson && lesson !== 'Unknown Lesson')
    : [];

  // Map Focus Areas (Lowest score lessons)
  const focusAreas = analytics?.trendData 
    ? [...analytics.trendData].sort((a, b) => a.percentage - b.percentage).slice(0, 2)
    : [];

  // Map Performance Summary from real analytics
  const summary = analytics?.summary;
  const totalQuizzes = summary?.totalQuizzes || 0;
  const overallAvg = summary?.overallAverage || 0;
  const strongestLesson = summary?.strongestLesson && summary.strongestLesson !== 'N/A' ? summary.strongestLesson : null;
  const weakestLesson = summary?.weakestLesson && summary.weakestLesson !== 'N/A' ? summary.weakestLesson : null;
  const highestScore = summary?.highestScore || 0;
  const lowestScore = summary?.lowestScore || 0;

  // Map Exam Prediction
  let predictedGrade = 'N/A';
  let predictionDetails = 'Take a quiz first';
  let trendIndicator = '0% since last week';
  let isPositiveTrend = true;

  if (prediction) {
    const score = prediction.predictedPercentage || (prediction.prediction && prediction.prediction.predictedScore) || 0;
    
    if (score >= 90) predictedGrade = 'A+';
    else if (score >= 80) predictedGrade = 'A';
    else if (score >= 70) predictedGrade = 'B';
    else if (score >= 60) predictedGrade = 'C';
    else if (score >= 50) predictedGrade = 'D';
    else predictedGrade = 'F';

    if (prediction.predictionStatus === 'INSUFFICIENT_DATA' || prediction.predictedMarks == null) {
      predictedGrade = 'N/A';
      predictionDetails = 'Take a quiz first';
    } else {
      const totalMarks = prediction.totalMarks ?? 25;
      predictionDetails = `Score: ${score.toFixed(0)}% (${prediction.predictedMarks.toFixed(1)} / ${totalMarks})`;
    }
    
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
              Here's your performance overview. Keep up the great work!
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Left / Main Column (2 columns width) */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Quiz Performance Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2">
                    <h3 className="text-slate-800 font-semibold text-[15px]">Quiz Performance</h3>
                    
                    {analytics?.history && analytics.history.length > 0 ? (
                      <select
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="text-[13px] bg-slate-50 border border-slate-200 text-slate-600 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium max-w-[130px] truncate cursor-pointer"
                      >
                        <option value="latest">Latest Quiz</option>
                        {uniqueLessons.map((lesson, idx) => (
                          <option key={idx} value={lesson}>{lesson}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      </div>
                    )}
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
                      <span className="text-3xl font-bold text-slate-900">{displayScore.toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 text-center line-clamp-2 px-2">
                    {displayLabel}
                  </p>
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

              {/* Performance Summary Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-6">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    PERFORMANCE SUMMARY
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 max-w-sm">
                    Your Quiz Analytics
                  </h2>
                  
                  <p className="text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
                    {totalQuizzes > 0
                      ? `You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'zes' : ''} with an overall average of ${overallAvg}%.`
                      : 'Start taking quizzes to see your performance analytics here.'}
                  </p>

                  {totalQuizzes > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-extrabold text-slate-800">{totalQuizzes}</p>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Quizzes Taken</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-extrabold text-slate-800">{overallAvg}%</p>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Overall Avg</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-extrabold text-emerald-600">{highestScore}%</p>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Highest</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-extrabold text-red-500">{lowestScore}%</p>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Lowest</p>
                      </div>
                    </div>
                  ) : null}

                  {(strongestLesson || weakestLesson) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {strongestLesson && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          <span className="text-xs font-semibold text-emerald-700">Strongest: {strongestLesson}</span>
                        </div>
                      )}
                      {weakestLesson && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <span className="text-xs font-semibold text-red-600">Needs Work: {weakestLesson}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => navigate('/student/quizzes')}
                    className="bg-[#3b28cc] text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    Take a Quiz
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Side Column (1 column width) */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Final Exam Prediction Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden justify-center min-h-[260px]">
                <h3 className="text-slate-400 font-bold tracking-widest text-[11px] uppercase mb-6 w-full text-center">Final Exam Prediction</h3>
                
                {loadingPrediction ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-150 border-t-indigo-600 animate-spin mb-4"></div>
                    <span className="text-xs text-slate-400 font-medium">Predicting grade...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-28 h-28 rounded-full border-[5px] border-[#3b28cc] flex items-center justify-center bg-white shadow-[0_0_30px_rgba(59,40,204,0.12)] relative z-10 mb-4">
                      <span className="text-4xl font-extrabold text-[#3b28cc] tracking-tight">{predictedGrade}</span>
                    </div>
                    
                    <div className="bg-slate-50 px-4 py-1.5 rounded-full text-slate-600 text-xs font-semibold mb-2 text-center">
                      {predictionDetails}
                    </div>

                    <div className={`text-xs font-bold ${isPositiveTrend ? 'text-emerald-500' : 'text-red-500'} mb-2`}>
                      {trendIndicator}
                    </div>
                  </>
                )}

                <div className="mt-2 w-3/4">
                   <div className="h-1 w-full bg-gradient-to-r from-cyan-200 via-indigo-500 to-slate-200 rounded-full"></div>
                </div>
              </div>

              {/* Community Hub Discussions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-bold text-[15px]">Community Hub</h3>
                      <p className="text-[11px] text-slate-400">Recent student & teacher topics</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/student/community')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  >
                    View All
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>

                {loadingCommunity ? (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin mb-2"></div>
                    <span className="text-xs text-slate-400">Loading discussions...</span>
                  </div>
                ) : communityPosts.length > 0 ? (
                  <div className="space-y-3.5">
                    {communityPosts.map((post) => (
                      <div 
                        key={post._id}
                        onClick={() => navigate('/student/community')}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-slate-800 truncate">{post.authorName || 'Anonymous'}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              post.authorRole === 'teacher' 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-slate-200/80 text-slate-600'
                            }`}>
                              {post.authorRole === 'teacher' ? 'Teacher' : 'Student'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatTimeAgo(post.createdAt)}</span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                          {post.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-2.5">
                          {post.body}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 truncate max-w-[140px]">
                            {post.course || post.tags?.[0] || 'General'}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              {post.votes || 0}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              {post.replies?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No community posts yet. Start the conversation!
                  </div>
                )}

                <button
                  onClick={() => navigate('/student/community')}
                  className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5"
                >
                  <span>Open Community Hub</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
