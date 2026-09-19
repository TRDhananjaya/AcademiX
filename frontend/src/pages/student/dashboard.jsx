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
        const token = localStorage.getItem('token');
        const res = await fetch('/api/community', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
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
  const lessonPredictions = prediction?.lessonPredictions || [];

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

          {/* ROW 1: Academic & Exam Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">

            {/* AI Exam Forecast Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col">
              <div>
                <div className="w-full flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      AI Exam Forecast
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Machine learning term score projections
                    </p>
                  </div>

                </div>

                {loadingPrediction ? (
                  <div className="flex flex-col items-center justify-center py-12 w-full">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3"></div>
                    <span className="text-xs text-slate-400 font-medium">Predicting exam performance...</span>
                  </div>
                ) : predictedGradeInfo ? (
                  <div className="w-full flex flex-col">
                    {/* Overall Average Prediction Hero Section */}
                    <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-100/90 rounded-2xl p-4 mb-5">
                      {/* Badge with Grade */}
                      <div
                        className={`w-16 h-16 shrink-0 rounded-2xl border-2 ${predictedGradeInfo.borderColor} ${predictedGradeInfo.bgColor} flex flex-col items-center justify-center relative shadow-sm`}
                      >
                        <span className={`text-2xl font-black ${predictedGradeInfo.color} leading-none`}>
                          {predictedGradeInfo.grade}
                        </span>
                        <span className={`text-[10px] font-bold ${predictedGradeInfo.color} mt-0.5`}>
                          {predictedGradeInfo.label}
                        </span>
                      </div>

                      {/* Average Score Details */}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Overall Term Exam Forecast
                        </span>
                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                          {predictionScore.toFixed(1)} <span className="text-sm text-slate-400 font-normal">/ {predictionTotalMarks}</span>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200/60 ml-2 px-2 py-0.5 rounded-full">
                            {predictionScore.toFixed(0)}% Avg
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Average of All Evaluated Lessons
                        </p>
                      </div>
                    </div>

                    {/* Lesson-wise Predicted Marks Section */}
                    {lessonPredictions.length > 0 && (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-800">
                            Lesson-wise Predicted Marks
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {lessonPredictions.length} Lessons Evaluated
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {lessonPredictions.map((lp, idx) => {
                            const lGrade = lp.predictedPercentage != null ? getGradeInfo(lp.predictedPercentage) : null;
                            const isAvailable = lp.predictionStatus === 'AVAILABLE' && lp.predictedMarks != null;

                            return (
                              <div
                                key={idx}
                                className="bg-slate-50/70 hover:bg-slate-50/90 border border-slate-100/90 rounded-xl p-3 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-semibold text-slate-800 truncate" title={lp.lessonName}>
                                    {lp.lessonName}
                                  </span>
                                  {lGrade && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${lGrade.bgColor} ${lGrade.color} ${lGrade.borderColor}`}>
                                      Grade {lGrade.grade}
                                    </span>
                                  )}
                                </div>

                                {isAvailable ? (
                                  <>
                                    <div className="flex items-baseline justify-between mb-1.5 text-xs">
                                      <span className="text-slate-400 font-medium text-[11px]">Predicted Mark:</span>
                                      <span className="font-bold text-slate-900">
                                        {lp.predictedMarks.toFixed(1)} <span className="text-slate-400 font-normal">/ {lp.totalMarks}</span>
                                        <span className="text-slate-500 font-medium ml-1">({lp.predictedPercentage}%)</span>
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${lGrade?.grade === 'A' ? 'bg-emerald-500' :
                                          lGrade?.grade === 'B' ? 'bg-indigo-600' :
                                            lGrade?.grade === 'C' ? 'bg-blue-500' :
                                              lGrade?.grade === 'S' ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                        style={{ width: `${Math.min(100, Math.max(0, lp.predictedPercentage || 0))}%` }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 border border-amber-100">
                                    Quizzes pending to unlock ML prediction
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-slate-100/90 my-2">
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      Exam Forecast Pending
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Need to complete all curriculum quizzes and follow-up quizes to generate your AI exam prediction.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Quiz Performance Analytics Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col">
              <div>
                <div className="w-full flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Your Quiz Analytics
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Cumulative performance across all taken quizzes
                    </p>
                  </div>

                </div>

                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  {totalQuizzes > 0
                    ? `You have completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'zes' : ''} with an overall average score of ${overallAvg}%.`
                    : 'Start taking quizzes to view your performance metrics.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-center">
                    <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Quizzes Taken</p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-center">
                    <p className="text-2xl font-bold text-slate-900">{totalQuizzes > 0 ? `${overallAvg}%` : '-'}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Overall Average</p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalQuizzes > 0 ? `${highestScore}%` : '-'}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Highest Score</p>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-center">
                    <p className="text-2xl font-bold text-red-500">{totalQuizzes > 0 ? `${lowestScore}%` : '-'}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Lowest Score</p>
                  </div>
                </div>

                {(strongestLesson || weakestLesson) && (
                  <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
                    {strongestLesson && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/80 rounded-xl px-3.5 py-2 flex-1 min-w-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span className="text-xs font-semibold text-emerald-700 truncate">Strongest: {strongestLesson}</span>
                      </div>
                    )}
                    {weakestLesson && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100/80 rounded-xl px-3.5 py-2 flex-1 min-w-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <span className="text-xs font-semibold text-amber-700 truncate">Needs Review: {weakestLesson}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/student/quizzes')}
                  className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Browse All Quizzes</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

          </div>

          {/* ROW 2: Activity & Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Quick Learning Hub Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col">
              <div className="w-full flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Learning Hub
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Quick access to curriculum tools and materials
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Quick Access
                </span>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => navigate('/student/lessons')}
                  className="p-3.5 rounded-xl border border-slate-100/90 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        Curriculum Lessons & Notes
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Study chapter notes, module guides, and syllabus resources.
                      </p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"><path d="M9 18l6-6-6-6" /></svg>
                </div>

                <div
                  onClick={() => navigate('/student/quizzes')}
                  className="p-3.5 rounded-xl border border-slate-100/90 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        Interactive Quizzes
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Practice topic quizzes and test your exam readiness.
                      </p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"><path d="M9 18l6-6-6-6" /></svg>
                </div>

                <div
                  onClick={() => navigate('/student/study-plans')}
                  className="p-3.5 rounded-xl border border-slate-100/90 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        Study Plans & Schedules
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Track personalized revision timetables and daily targets.
                      </p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              </div>
            </div>

            {/* Community Hub Discussions Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col">
              <div className="w-full flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Community Hub</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Recent student & teacher discussions</p>
                </div>
                <button
                  onClick={() => navigate('/student/community')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
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
                <div className="space-y-3">
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

                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
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
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
