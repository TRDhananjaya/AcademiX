import React from 'react';

const CoverPage = ({ user, lessonTitle, score, dateGenerated }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-12">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl text-indigo-600 font-black">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </span>
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
        My Personalized Study Plan
      </h1>
      <h3 className="text-xl text-indigo-600 font-semibold mb-8">
        Module: {lessonTitle}
      </h3>
      
      <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
        This is your generated learning journey designed specifically for you, 
        <span className="font-bold text-slate-700"> {user?.name || 'Student'}</span>.
      </p>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 w-full max-w-sm mx-auto shadow-inner">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Score</div>
        <div className="flex items-end justify-center gap-2">
          <span className="text-5xl font-black text-indigo-600">{score}</span>
          <span className="text-2xl font-bold text-slate-300 pb-1">/100</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-indigo-500 h-full rounded-full"
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-12 text-xs font-bold text-slate-300 uppercase tracking-widest">
        Generated on {new Date(dateGenerated).toLocaleDateString()}
      </div>
    </div>
  );
};

export default CoverPage;
