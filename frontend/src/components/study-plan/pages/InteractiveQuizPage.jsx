import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';

const InteractiveQuizPage = ({ quizText }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const cleanQuiz = quizText
    ? quizText.replace(/^[#\s]*\d*\.?\s*(?:PERSONALIZED|ADVANCED)?\s*PRACTICE\s*(?:QUIZ|QUESTIONS)\s*/i, '').trim()
    : '';

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Chapter 7
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Practice Quiz
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Test your grasp of the reinforced concepts with self-assessment questions.
          </p>
        </div>

        <button 
          onClick={() => setShowAnswers(!showAnswers)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            showAnswers 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          {showAnswers ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
          {showAnswers ? "Hide Answer Key" : "Reveal Answer Key"}
        </button>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs overflow-y-auto">
        {cleanQuiz ? (
          <div className="prose prose-slate max-w-none text-sm text-slate-700 font-normal leading-relaxed space-y-4">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h3 className="text-base font-bold text-slate-800 mt-6 mb-2 pb-1 border-b border-slate-100" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h4 className="text-sm font-semibold text-slate-800 mt-4 mb-2" {...props} />
                ),
                strong: ({ node, ...props }) => {
                  // If it's the answer key and showAnswers is false, blur it
                  const content = props.children?.toString() || '';
                  if (!showAnswers && /Answer|Key|Correct/i.test(content)) {
                    return (
                      <span className="filter blur-xs select-none bg-slate-200 text-transparent rounded px-1">
                        [Answer Hidden]
                      </span>
                    );
                  }
                  return <strong className="font-semibold text-slate-800" {...props} />;
                },
                p: ({ node, ...props }) => (
                  <p className="my-2 leading-relaxed text-slate-600 font-normal" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-none pl-0 my-3 space-y-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-slate-700 font-normal text-xs sm:text-sm my-1 hover:border-slate-300 transition-colors" {...props} />
                )
              }}
            >
              {cleanQuiz}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Clean Sample Question Card */}
            <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                  Sample Practice Question
                </span>
                <span className="text-xs text-slate-400 font-medium">Memory Types</span>
              </div>
              <p className="font-medium text-slate-800 text-sm">
                Which type of computer memory retains its contents permanently even when power is disconnected?
              </p>
              <div className="space-y-2 pt-1">
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-600">
                  A) Random Access Memory (RAM)
                </div>
                <div className={`p-3 rounded-lg text-xs font-normal transition-all ${
                  showAnswers ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium' : 'bg-white border border-slate-200 text-slate-600'
                }`}>
                  B) Read-Only Memory (ROM) {showAnswers && '— (Correct Answer)'}
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-600">
                  C) Cache Memory
                </div>
              </div>

              {showAnswers && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-slate-700 font-normal">
                  <span className="font-semibold text-emerald-800">Explanation:</span> ROM is non-volatile; RAM and Cache are volatile storage that lose data when power is turned off.
                </div>
              )}
            </div>

            <div className="text-center py-4 text-xs text-slate-400 font-normal">
              For comprehensive adaptive testing, launch the 20-question Follow-Up Assessment on Chapter 10!
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InteractiveQuizPage;
