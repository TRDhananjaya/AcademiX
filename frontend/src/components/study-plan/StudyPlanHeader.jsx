import React from 'react';
import { FiCalendar, FiBook, FiUser } from 'react-icons/fi';

const StudyPlanHeader = ({ user, lessonTitle, dateGenerated, score }) => {
  // Score is a string like "72" or "72.5"
  const numericScore = parseFloat(score) || 0;
  
  // Calculate SVG stroke dashoffset
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numericScore / 100) * circumference;
  
  let scoreColor = "text-emerald-500";
  let strokeColor = "#10b981"; // emerald-500
  if (numericScore < 50) {
    scoreColor = "text-rose-500";
    strokeColor = "#f43f5e"; // rose-500
  } else if (numericScore < 75) {
    scoreColor = "text-amber-500";
    strokeColor = "#f59e0b"; // amber-500
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 opacity-50 rounded-full blur-3xl pointer-events-none transform translate-x-10 -translate-y-10"></div>
      
      <div className="flex-1 relative z-10 w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          AI Personalized Study Plan
        </div>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4">
          {lessonTitle}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <FiUser className="text-indigo-500" />
            <span>{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || 'Student'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <FiCalendar className="text-indigo-500" />
            <span>{new Date(dateGenerated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <FiBook className="text-indigo-500" />
            <span>Grade 10</span>
          </div>
        </div>
      </div>
      
      {/* Removed Score Circular Progress as requested */}
    </div>
  );
};

export default StudyPlanHeader;
