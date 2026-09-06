import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaTimesCircle, FaCheckCircle, FaLightbulb, FaTag, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const WrongQuestionAnalysisPage = ({ questions = [], rawMistakesText = '' }) => {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [filter, setFilter] = useState('ALL');

  const filteredQuestions = questions.filter(q => {
    if (filter === 'ALL') return true;
    return q.priority?.toUpperCase() === filter;
  });

  const activeQuestion = filteredQuestions[activeQuestionIdx] || filteredQuestions[0];

  const handleNext = () => {
    if (activeQuestionIdx < filteredQuestions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Chapter 2 of 5 · Mistake Diagnostics
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Understanding My Mistakes
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Detailed diagnosis of why specific questions were tricky and how to master the correct answer.
          </p>
        </div>

        {/* Priority Filter */}
        {questions.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => { setFilter('ALL'); setActiveQuestionIdx(0); }}
              className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                filter === 'ALL' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => { setFilter('CRITICAL'); setActiveQuestionIdx(0); }}
              className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                filter === 'CRITICAL' ? 'bg-rose-500 text-white font-semibold' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => { setFilter('HIGH'); setActiveQuestionIdx(0); }}
              className={`px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                filter === 'HIGH' ? 'bg-amber-500 text-white font-semibold' : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              High Priority
            </button>
          </div>
        )}
      </div>

      {/* Main Question Inspector */}
      {filteredQuestions.length > 0 && activeQuestion ? (
        <div className="flex-1 flex flex-col space-y-4">
          
          {/* Question Step Pills Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/70 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {filteredQuestions.map((q, idx) => {
                const isActive = idx === activeQuestionIdx;
                const isCrit = q.priority?.toUpperCase() === 'CRITICAL';
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-none cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold' 
                        : isCrit
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-400 font-medium whitespace-nowrap px-2">
              {activeQuestionIdx + 1} of {filteredQuestions.length}
            </span>
          </div>

          {/* Active Question Diagnostic Card */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                  activeQuestion.priority?.toUpperCase() === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {activeQuestion.priority || 'Review'} Priority
                </span>

                {activeQuestion.conceptTested && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-normal">
                    <FaTag className="text-[10px] text-slate-400" />
                    {activeQuestion.conceptTested}
                  </span>
                )}
              </div>

              {/* The Question Text */}
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 leading-snug mb-5">
                {activeQuestion.question}
              </h3>

              {/* Two-Column Diagnostic Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Misconception / Why Wrong */}
                <div className="bg-rose-50/60 border border-rose-100/90 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs uppercase tracking-wide mb-2">
                    <FaTimesCircle className="text-rose-500" />
                    <span>Why This Was Misunderstood</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {activeQuestion.whyWrong || 'Review the context of this scenario to avoid this trap.'}
                  </p>
                </div>

                {/* Correct Concept & Answer */}
                <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs uppercase tracking-wide mb-2">
                    <FaCheckCircle className="text-emerald-500" />
                    <span>Correct Concept & Solution</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal mb-2.5">
                    {activeQuestion.correctUnderstanding || 'Focus on the verified textbook definition.'}
                  </p>
                  {activeQuestion.correctAnswer && (
                    <div className="bg-white/90 border border-emerald-200/80 rounded-lg p-2 text-xs">
                      <span className="font-semibold text-emerald-800 mr-1">Answer:</span>
                      <span className="font-normal text-slate-800">{activeQuestion.correctAnswer}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Pro Exam Strategy Tip */}
              {activeQuestion.examStrategy && (
                <div className="mt-4 bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FaLightbulb className="text-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-900 block mb-0.5">
                      Exam Strategy & Key Clue
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed font-normal">
                      {activeQuestion.examStrategy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer for questions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={activeQuestionIdx === 0}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 transition-colors ${
                  activeQuestionIdx === 0 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                }`}
              >
                <FaChevronLeft className="text-[10px]" /> Previous Mistake
              </button>

              <span className="text-xs text-slate-400 font-normal">
                Question {activeQuestionIdx + 1} of {filteredQuestions.length}
              </span>

              <button
                onClick={handleNext}
                disabled={activeQuestionIdx === filteredQuestions.length - 1}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 transition-colors ${
                  activeQuestionIdx === filteredQuestions.length - 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                }`}
              >
                Next Mistake <FaChevronRight className="text-[10px]" />
              </button>
            </div>

          </div>
        </div>
      ) : rawMistakesText ? (
        /* Fallback: render cleaned markdown with gentle typography */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 font-normal space-y-3">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h4 className="text-sm font-bold text-slate-800 mt-3 mb-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
              p: ({ node, ...props }) => <p className="text-slate-600 leading-relaxed font-normal my-2" {...props} />
            }}
          >
            {rawMistakesText}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center my-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            ✓
          </div>
          <h3 className="text-base font-bold text-emerald-900 mb-1">Excellent Work!</h3>
          <p className="text-emerald-700 text-sm max-w-md mx-auto font-normal">
            No critical question mistakes detected for this assessment. Review your concept notes and test yourself with the practice quiz!
          </p>
        </div>
      )}

    </div>
  );
};

export default WrongQuestionAnalysisPage;
