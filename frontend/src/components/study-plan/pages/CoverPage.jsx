import React from 'react';
import { FaGraduationCap, FaBookOpen, FaUserGraduate, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const CoverPage = ({ user, lessonTitle, score, dateGenerated, onStart }) => {
  const numericScore = parseFloat(score) || 0;

  let scoreStatus = {
    label: 'Needs Review',
    statusText: 'Guided Practice Recommended',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100/70 text-amber-600',
    Icon: FaBookOpen,
    desc: 'Target specific knowledge gaps to boost comprehension across this lesson.'
  };

  if (numericScore >= 75) {
    scoreStatus = {
      label: 'Strong Mastery',
      statusText: 'High Concept Proficiency',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-emerald-100/70 text-emerald-600',
      Icon: FaCheckCircle,
      desc: 'Solid understanding. Focus on fine details and advanced topics for full marks.'
    };
  } else if (numericScore < 50) {
    scoreStatus = {
      label: 'Critical Revision Needed',
      statusText: 'Requires Immediate Focus',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      iconBg: 'bg-rose-100/70 text-rose-600',
      Icon: FaExclamationCircle,
      desc: 'Revisit core definitions and examine key misconceptions identified in quizzes.'
    };
  }

  const studentDisplayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || user?.username || 'Student';

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4 py-8">

      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-5">
        <FaGraduationCap className="text-indigo-500 text-sm" />
        <span>Personalized AI Study Guide · Grade 10 ICT</span>
      </div>

      {/* Main Title & Subtitle with balanced typography */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight max-w-xl leading-tight mb-3">
        {lessonTitle}
      </h1>

      <p className="text-slate-500 text-base max-w-md mx-auto mb-8 font-normal leading-relaxed">
        Individualized diagnostic analysis and revision path curated for{' '}
        <span className="text-slate-700 font-medium">{studentDisplayName}</span>.
      </p>

      {/* Diagnostic Summary Card (Clean and balanced, with status icon & descriptive text) */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-left mb-6">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${scoreStatus.iconBg}`}>
              <scoreStatus.Icon className="text-lg" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Diagnostic Assessment Status
              </span>
              <h4 className="text-base font-bold text-slate-800 mt-0.5">
                {scoreStatus.statusText}
              </h4>
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 ${scoreStatus.color}`}>
            {scoreStatus.label}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-3 font-normal leading-relaxed">
          {scoreStatus.desc}
        </p>
      </div>

      {/* Footer Meta Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-normal">
        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
          <FaUserGraduate className="text-slate-400" />
          <span>Student ID: <span className="font-medium text-slate-700">{user?.username || 'ST016'}</span></span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
          <FaBookOpen className="text-slate-400" />
          <span>5 Revision Chapters Included</span>
        </div>
      </div>

    </div>
  );
};

export default CoverPage;
