import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaGraduationCap, FaPlay, FaCheckCircle, FaSpinner, FaChartBar } from 'react-icons/fa';

const MotivationPage = ({ 
  motivationText, 
  user,
  followUpQuizData,
  followUpCompleted,
  followUpResult,
  moduleBreakdown = [],
  onStartFollowUpQuiz,
  isLoadingFollowUp
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full text-center px-4 animate-fade-in py-4">
      
      <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] rotate-3 shadow-xl flex items-center justify-center shrink-0">
         <span className="text-5xl -rotate-3 block">🚀</span>
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
        You've Got This, {user?.name?.split(' ')[0] || user?.firstName || 'Student'}!
      </h1>
      
      <div className="text-slate-500 max-w-lg mx-auto mb-8 text-base leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
        {motivationText ? (
           <ReactMarkdown>{motivationText}</ReactMarkdown>
        ) : (
          <p>
            "Every expert was once a beginner. Keep following this plan, stay consistent, and you will see amazing results. Your learning journey is just beginning."
          </p>
        )}
      </div>

      {/* --- END OF STUDY PLAN FOLLOW-UP QUIZ ACTION BANNER --- */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/20 text-left relative overflow-hidden my-6 border border-indigo-700/50">
        
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-indigo-700/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaGraduationCap className="text-indigo-300 text-xl" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                Post-Study Action Step
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
              Follow-Up Assessment Quiz
            </h3>
          </div>

          {followUpCompleted && followUpResult ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm shrink-0">
              <FaCheckCircle className="text-emerald-400 text-base" />
              Completed ({followUpResult.score}/{followUpResult.totalQuestions || 20})
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0">
              20 Adaptive MCQs
            </div>
          )}
        </div>

        <p className="text-indigo-100/90 text-sm leading-relaxed mb-5 font-medium">
          Ready to verify your mastery? This 20-question follow-up quiz is dynamically generated from database question banks, weighting questions based on your performance in previous module quizzes.
        </p>

        {/* Module Weighting Breakdown Pills */}
        {moduleBreakdown && moduleBreakdown.length > 0 && (
          <div className="mb-6 bg-indigo-950/50 p-3.5 rounded-2xl border border-indigo-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              <FaChartBar className="text-xs" /> Question Allocation by Module Performance
            </div>
            <div className="flex flex-wrap gap-2">
              {moduleBreakdown.map((mb, idx) => (
                <div key={idx} className="bg-indigo-900/80 border border-indigo-700/60 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium">
                  <span className="text-white font-bold">{mb.moduleTitle || `Module ${idx + 1}`}:</span>
                  <span className="text-indigo-200 font-bold bg-indigo-800/80 px-2 py-0.5 rounded-md">
                    {mb.targetQuestionCount} Qs ({mb.score}% score)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="text-xs font-semibold text-indigo-200/80 hidden sm:block">
            {followUpCompleted ? 'You can retake this quiz anytime.' : '45 Minutes Time Limit'}
          </div>

          <button
            onClick={onStartFollowUpQuiz}
            disabled={isLoadingFollowUp}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all cursor-pointer border-none shadow-lg ${
              followUpCompleted
                ? 'bg-indigo-700/80 text-white hover:bg-indigo-600 border border-indigo-500/50'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-500/20'
            }`}
          >
            {isLoadingFollowUp ? (
              <>
                <FaSpinner className="animate-spin" />
                Preparing Quiz...
              </>
            ) : followUpCompleted ? (
              <>
                <FaPlay className="text-xs" />
                Retake Follow-up Quiz
              </>
            ) : (
              <>
                <FaPlay className="text-xs" />
                Start Follow-up Quiz (20 MCQs)
              </>
            )}
          </button>
        </div>

      </div>

      <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-6 pb-2">
        The End of the Plan. The Start of Your Journey.
      </div>
    </div>
  );
};

export default MotivationPage;
