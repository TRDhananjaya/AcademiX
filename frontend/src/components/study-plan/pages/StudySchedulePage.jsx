import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaCalendarDay, FaClock, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

const StudySchedulePage = ({ scheduleText }) => {
  const [completedDays, setCompletedDays] = useState({});

  const toggleDay = (day) => {
    setCompletedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const cleanSchedule = scheduleText 
    ? scheduleText.replace(/^[#\s]*\d*\.?\s*(?:ACTIONABLE|ADAPTIVE)?\s*STUDY SCHEDULE\s*/i, '').trim() 
    : '';

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title & Header */}
      <div className="pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Chapter 8
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Actionable Study Schedule
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-normal">
          A realistic 3-day micro-revision schedule designed to eliminate your diagnostic weaknesses.
        </p>
      </div>

      {/* Main Schedule Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs overflow-y-auto space-y-4">
        
        {cleanSchedule ? (
          <div className="prose prose-slate max-w-none text-sm text-slate-600 font-normal leading-relaxed space-y-3">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h3 className="text-base font-bold text-indigo-900 mt-5 mb-2 pb-1 border-b border-slate-100" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h4 className="text-sm font-semibold text-slate-800 mt-3 mb-1" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-slate-800" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="my-1.5 leading-relaxed text-slate-600 font-normal" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1 text-slate-600" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="my-0.5 leading-relaxed font-normal text-slate-600" {...props} />
                )
              }}
            >
              {cleanSchedule}
            </ReactMarkdown>
          </div>
        ) : (
          /* Default 3-Day Plan Cards */
          <div className="space-y-3">
            
            {/* Day 1 Card */}
            <div 
              onClick={() => toggleDay('day1')}
              className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                completedDays['day1'] 
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-700' 
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="mt-0.5 text-lg shrink-0">
                {completedDays['day1'] ? <FaCheckCircle className="text-emerald-500" /> : <FaRegCircle className="text-slate-300" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Day 1 · Foundations & Mistakes</span>
                  <span className="text-xs text-slate-400 font-normal flex items-center gap-1"><FaClock className="text-[10px]" /> 35 Mins</span>
                </div>
                <h4 className={`text-sm font-semibold ${completedDays['day1'] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  Review Diagnosed Question Misconceptions
                </h4>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Carefully read Chapter 2 explanations. Note the specific traps identified in critical questions.
                </p>
              </div>
            </div>

            {/* Day 2 Card */}
            <div 
              onClick={() => toggleDay('day2')}
              className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                completedDays['day2'] 
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-700' 
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="mt-0.5 text-lg shrink-0">
                {completedDays['day2'] ? <FaCheckCircle className="text-emerald-500" /> : <FaRegCircle className="text-slate-300" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Day 2 · Concept Mastery</span>
                  <span className="text-xs text-slate-400 font-normal flex items-center gap-1"><FaClock className="text-[10px]" /> 40 Mins</span>
                </div>
                <h4 className={`text-sm font-semibold ${completedDays['day2'] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  Study Core Notes & Key Definitions
                </h4>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Memorize definitions in Chapter 5. Review the concept principles in Chapter 4.
                </p>
              </div>
            </div>

            {/* Day 3 Card */}
            <div 
              onClick={() => toggleDay('day3')}
              className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                completedDays['day3'] 
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-700' 
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="mt-0.5 text-lg shrink-0">
                {completedDays['day3'] ? <FaCheckCircle className="text-emerald-500" /> : <FaRegCircle className="text-slate-300" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Day 3 · Verification & Follow-Up Quiz</span>
                  <span className="text-xs text-slate-400 font-normal flex items-center gap-1"><FaClock className="text-[10px]" /> 45 Mins</span>
                </div>
                <h4 className={`text-sm font-semibold ${completedDays['day3'] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  Practice Questions & Adaptive Assessment
                </h4>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Complete the practice questions in Chapter 7, then launch the Chapter 10 Follow-Up Assessment to verify your mastery.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default StudySchedulePage;
