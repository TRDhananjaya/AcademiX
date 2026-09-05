import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaChartLine, FaCheckCircle, FaExclamationCircle, FaLightbulb, FaLayerGroup } from 'react-icons/fa';

const PerformancePage = ({ score, summaryText, weakText, lessonTitle, user }) => {
  const numericScore = parseFloat(score) || 0;

  // Clean summary text
  const cleanedText = summaryText
    ? summaryText.replace(/^[#\s]*\d*\.?\s*PERSONAL PERFORMANCE ANALYSIS\s*/i, '').trim()
    : '';

  const cleanedWeak = weakText
    ? weakText.replace(/^[#\s]*\d*\.?\s*WEAK CONCEPT PRIORITY MAP\s*/i, '').trim()
    : '';

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title & Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Chapter 1 of 5 · Diagnostic Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Student Learning Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Personalized diagnosis for {lessonTitle ? <span className="font-medium text-slate-700">{lessonTitle}</span> : 'this lesson'}.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-normal">
          Student ID: <span className="font-medium text-slate-600">{user?.username || 'ST016'}</span>
        </div>
      </div>

      {/* Top Diagnostic Snapshot Bar (Clean Cards, No awkward bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Actual Quiz Score Card */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center text-base font-bold shrink-0">
            {numericScore}%
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Quiz Average Score
            </span>
            <span className="text-xs text-slate-600 font-normal block mt-0.5">
              Across completed module quizzes
            </span>
          </div>
        </div>

        {/* Diagnostic Understanding Level */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center text-base shrink-0">
            <FaExclamationCircle />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Diagnostic Level
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {numericScore >= 75 ? 'Strong Understanding' : numericScore >= 50 ? 'Foundational Gaps' : 'Needs Reinforcement'}
            </span>
          </div>
        </div>

        {/* Action Strategy Target */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-base shrink-0">
            <FaCheckCircle />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Goal Verification
            </span>
            <span className="text-sm font-semibold text-slate-800">
              Chapter 5 Follow-Up Quiz
            </span>
          </div>
        </div>

      </div>

      {/* Main Narrative & Insights Section */}
      <div className="flex-1 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs overflow-y-auto space-y-6">
        
        {/* Diagnostic Analysis from AI Coach */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
            <FaLightbulb className="text-amber-500" />
            <span>AI Learning Coach Diagnostic Findings</span>
          </div>

          {cleanedText ? (
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-3 font-normal">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h4 className="text-sm font-semibold text-slate-800 mt-3 mb-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
                  p: ({ node, ...props }) => <p className="text-slate-600 leading-relaxed my-2 font-normal" {...props} />,
                  li: ({ node, ...props }) => <li className="text-slate-600 my-1 font-normal" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
                }}
              >
                {cleanedText}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm">Diagnostic narrative is being generated.</p>
          )}
        </div>

        {/* Priority Reinforcement Concepts Summary */}
        {cleanedWeak && (
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
              <FaLayerGroup className="text-indigo-500" />
              <span>Priority Concept Reinforcement Areas</span>
            </div>
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 font-normal">
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
                  p: ({ node, ...props }) => <p className="my-1 leading-relaxed text-slate-600 font-normal" {...props} />
                }}
              >
                {cleanedWeak}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default PerformancePage;
