import React from 'react';
import ReactMarkdown from 'react-markdown';

const PerformancePage = ({ score, summaryText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 1</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Student Learning Profile</h2>
        <p className="text-slate-500 mt-2">Let's review your overall performance and understand your starting point.</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex gap-8 items-start">
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
           <span className="text-6xl font-black text-indigo-600 mb-2">{score}</span>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Score</span>
        </div>
        <div className="prose prose-slate prose-p:text-lg prose-p:leading-relaxed max-w-none flex-1">
          {summaryText ? (
            <ReactMarkdown>{summaryText}</ReactMarkdown>
          ) : (
            <p className="text-slate-400 italic">No summary available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
