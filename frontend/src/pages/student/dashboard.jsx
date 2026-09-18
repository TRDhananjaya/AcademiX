import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Fetch Student Analytics
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const resAnalytics = await fetch(`/api/analytics/student/${user.username}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
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
        const token = localStorage.getItem('token');
        const resPrediction = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ studentId: user.username, lessonId: '' }) // General prediction across all lessons
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

  // Fetch student's today attendance check-in status
  useEffect(() => {
    if (!user) return;
    const fetchTodayAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/today?studentId=${encodeURIComponent(user.username)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const resData = await res.json();
          const records = resData.data || [];
          if (records.length > 0) {
            setTodayAttendance({ marked: true, timeArrived: records[0].timeArrived });
          } else {
            setTodayAttendance({ marked: false });
          }
        }
      } catch (e) {
        console.error('Error fetching today attendance:', e);
      }
    };
    fetchTodayAttendance();
  }, [user]);

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

  // Sri Lankan G.C.E. O-Level Grading System & Next Target Gap Helper
  const getGradeInfo = (score) => {
    if (score >= 75) {
      return {
        grade: 'A',
        label: 'Distinction',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500',
        shadowColor: 'rgba(16,185,129,0.15)',
        nextTargetText: '🌟 Top Tier Performance! Maintain your momentum.',
        nextTargetPct: null,
        progressPct: 100
      };
    } else if (score >= 65) {
      const gap = (75 - score).toFixed(1);
      const progress = Math.min(100, Math.max(0, ((score - 65) / 10) * 100));
      return {
        grade: 'B',
        label: 'Very Good',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-500',
        shadowColor: 'rgba(99,102,241,0.15)',
        nextTargetText: `🎯 +${gap}% more to reach 'A' (Distinction)!`,
        nextTargetPct: 75,
        progressPct: progress
      };
    } else if (score >= 50) {
      const gap = (65 - score).toFixed(1);
      const progress = Math.min(100, Math.max(0, ((score - 50) / 15) * 100));
      return {
        grade: 'C',
        label: 'Credit Pass',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        shadowColor: 'rgba(59,130,246,0.15)',
        nextTargetText: `🎯 +${gap}% more to reach 'B' (Very Good)!`,
        nextTargetPct: 65,
        progressPct: progress
      };
    } else if (score >= 35) {
      const gap = (50 - score).toFixed(1);
      const progress = Math.min(100, Math.max(0, ((score - 35) / 15) * 100));
      return {
        grade: 'S',
        label: 'Simple Pass',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500',
        shadowColor: 'rgba(245,158,11,0.15)',
        nextTargetText: `🎯 +${gap}% more to reach 'C' (Credit)!`,
        nextTargetPct: 50,
        progressPct: progress
      };
    } else {
      const gap = (35 - score).toFixed(1);
      const progress = Math.min(100, Math.max(0, (score / 35) * 100));
      return {
        grade: 'W',
        label: 'Needs Revision',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-400',
        shadowColor: 'rgba(239,68,68,0.15)',
        nextTargetText: `🎯 +${gap}% more to reach 'S' (Pass)!`,
        nextTargetPct: 35,
        progressPct: progress
      };
    }
  };

  // Map Exam Prediction
  let predictedGradeInfo = null;
  let predictionScore = 0;
  let predictionTotalMarks = 100;

  if (prediction && prediction.predictionStatus !== 'INSUFFICIENT_DATA' && prediction.predictedMarks != null) {
    predictionScore = prediction.predictedPercentage || (prediction.prediction && prediction.prediction.predictedScore) || 0;
    predictionTotalMarks = prediction.totalMarks ?? 100;
    predictedGradeInfo = getGradeInfo(predictionScore);
  }

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />

        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
                Welcome back, {user ? (user.firstName || user.username) : 'Student'}!
              </h1>
              <p className="text-slate-500 text-base">
                Here's your performance overview. Keep up the great work!
              </p>
            </div>

            {/* Attendance Check-in Pill */}
            <div className="self-start sm:self-auto flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${todayAttendance?.marked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-500 font-medium block">Today's Attendance</span>
                <span className="text-xs font-bold text-slate-800">
                  {todayAttendance?.marked
                    ? `Present (${todayAttendance.timeArrived || 'Checked in'})`
                    : 'Not Scanned Yet Today'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* Left / Main Column (2 columns width) */}
            <div className="xl:col-span-2 space-y-6">

              {/* Focus Areas Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg">Focus Areas</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Topics that need your review based on recent quiz scores.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1 rounded-full">
                    Priority Practice
                  </span>
                </div>

                <div className="space-y-4">
                  {focusAreas.length > 0 ? (
                    focusAreas.map((topic, i) => {
                      const isWeak = topic.percentage < 50;
                      const statusText = isWeak ? 'Needs Review' : 'Moderate';
                      const badgeBg = isWeak ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-700';
                      const progressBg = isWeak ? 'bg-red-500' : 'bg-amber-500';

                      return (
                        <div key={i} className="bg-slate-50/70 border border-slate-100/80 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-slate-800 font-semibold text-sm truncate">{topic.lesson}</span>
                            <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                              {statusText} ({topic.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div className={`${progressBg} h-full rounded-full transition-all duration-500`} style={{ width: `${topic.percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-sm text-slate-400 font-medium">
                      Take quizzes to analyze your topic strengths and weaknesses.
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Target your lowest-scoring topics to quickly level up your predicted grade.
                  </p>
                  <button
                    onClick={() => navigate('/student/quizzes')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#3b28cc] hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Practice Weakest Topics</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              {/* Performance Summary Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    Performance Summary
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Your Quiz Analytics
                  </h2>

                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    {totalQuizzes > 0
                      ? `You have completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'zes' : ''} with an overall average of ${overallAvg}%.`
                      : 'Start taking quizzes to see your performance analytics here.'}
                  </p>

                  {totalQuizzes > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Quizzes Taken</p>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-slate-900">{overallAvg}%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Overall Average</p>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{highestScore}%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Highest Score</p>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{lowestScore}%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Lowest Score</p>
                      </div>
                    </div>
                  ) : null}

                  {(strongestLesson || weakestLesson) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {strongestLesson && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/80 rounded-xl px-3.5 py-2">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          <span className="text-xs font-semibold text-emerald-700">Strongest: {strongestLesson}</span>
                        </div>
                      )}
                      {weakestLesson && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100/80 rounded-xl px-3.5 py-2">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <span className="text-xs font-semibold text-red-600">Needs Review: {weakestLesson}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => navigate('/student/quizzes')}
                    className="bg-[#3b28cc] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Browse All Quizzes</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Side Column (1 column width) */}
            <div className="xl:col-span-1 space-y-6">

              {/* Final Exam Prediction Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[300px]">
                <div className="w-full flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    AI Exam Forecast
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/60">
                    ML Prediction
                  </span>
                </div>

                {loadingPrediction ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3"></div>
                    <span className="text-xs text-slate-400 font-medium">Predicting exam performance...</span>
                  </div>
                ) : predictedGradeInfo ? (
                  <div className="w-full flex flex-col items-center">
                    {/* Circle Badge with Grade */}
                    <div
                      className={`w-24 h-24 rounded-full border-[3px] ${predictedGradeInfo.borderColor} ${predictedGradeInfo.bgColor} flex flex-col items-center justify-center relative z-10 mb-3`}
                      style={{ boxShadow: `0 0 20px ${predictedGradeInfo.shadowColor}` }}
                    >
                      <span className={`text-4xl font-bold ${predictedGradeInfo.color} tracking-tight leading-none`}>
                        {predictedGradeInfo.grade}
                      </span>
                      <span className={`text-xs font-semibold ${predictedGradeInfo.color} mt-1`}>
                        {predictedGradeInfo.label}
                      </span>
                    </div>

                    {/* Predicted Score Details */}
                    <div className="text-center mb-3">
                      <p className="text-lg font-bold text-slate-900">
                        {predictionScore.toFixed(1)} / {predictionTotalMarks}
                        <span className="text-xs text-slate-400 font-medium ml-1">({predictionScore.toFixed(0)}%)</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Projected Term Examination Score
                      </p>
                    </div>

                    {/* Target Roadmap to Next Grade */}
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                        <span>{predictedGradeInfo.nextTargetText}</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${predictedGradeInfo.grade === 'A' ? 'bg-emerald-500' :
                              predictedGradeInfo.grade === 'B' ? 'bg-indigo-600' :
                                predictedGradeInfo.grade === 'C' ? 'bg-blue-500' :
                                  predictedGradeInfo.grade === 'S' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${predictedGradeInfo.progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    Take quizzes to generate your AI exam forecast.
                  </div>
                )}


              </div>

              {/* Community Hub Discussions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
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
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${post.authorRole === 'teacher'
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
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                              {post.votes || 0}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
