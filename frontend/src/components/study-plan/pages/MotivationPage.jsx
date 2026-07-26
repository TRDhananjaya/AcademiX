import React from 'react';
import ReactMarkdown from 'react-markdown';

const MotivationPage = ({ motivationText, user }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
      
      <div className="w-32 h-32 mb-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] rotate-3 shadow-xl flex items-center justify-center">
         <span className="text-6xl -rotate-3 block">🚀</span>
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
        You've Got This, {user?.name?.split(' ')[0] || 'Student'}!
      </h1>
      
      <div className="text-slate-500 max-w-lg mx-auto mb-10 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
        {motivationText ? (
           <ReactMarkdown>{motivationText}</ReactMarkdown>
        ) : (
          <p>
            "Every expert was once a beginner. Keep following this plan, stay consistent, and you will see amazing results. Your learning journey is just beginning."
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold mb-12">
        <span>⭐</span>
        <span>Keep Learning. Keep Growing.</span>
        <span>⭐</span>
      </div>

      <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-auto pb-4">
        The End of the Plan. The Start of Your Journey.
      </div>
    </div>
  );
};

export default MotivationPage;
