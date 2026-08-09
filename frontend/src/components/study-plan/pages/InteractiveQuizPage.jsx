import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const InteractiveQuizPage = ({ quizText }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 7</h3>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Practice Quiz</h2>
          <p className="text-slate-500 mt-2">Test your understanding of the weak concepts.</p>
        </div>
        <button 
          onClick={() => setShowAnswers(!showAnswers)}
          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold transition-colors text-sm"
        >
          {showAnswers ? "Hide Answers" : "Reveal Answers"}
        </button>
      </div>

      <div className={`flex-1 overflow-auto pr-2 ${showAnswers ? 'show-answers' : 'hide-answers'}`}>
         {/* If we have plain markdown quiz from AI, we render it, but we use CSS to toggle answer visibility if the AI formatted answers predictably */}
         <style dangerouslySetInnerHTML={{__html: `
            .hide-answers strong, .hide-answers em { filter: blur(4px); background-color: #e2e8f0; color: transparent; user-select: none; transition: filter 0.3s; }
            .show-answers strong, .show-answers em { filter: blur(0px); transition: filter 0.3s; }
         `}} />
         
         <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
           {quizText ? (
             <div className="prose prose-slate max-w-none">
               <ReactMarkdown>{quizText}</ReactMarkdown>
             </div>
           ) : (
             <div className="space-y-6">
                {/* Mock Interactive Question */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase">Medium</span>
                    <span className="text-sm font-bold text-slate-400">Question 1</span>
                  </div>
                  <p className="font-medium text-slate-800 text-lg mb-4">Which of the following is an example of non-volatile memory?</p>
                  <ul className="space-y-2 mb-4">
                    <li className="p-3 border border-slate-200 rounded-xl text-slate-600">A) Random Access Memory (RAM)</li>
                    <li className={`p-3 border rounded-xl ${showAnswers ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 text-slate-600'}`}>B) Read-Only Memory (ROM)</li>
                    <li className="p-3 border border-slate-200 rounded-xl text-slate-600">C) Cache Memory</li>
                  </ul>
                  {showAnswers && (
                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100 animate-fade-in">
                       <strong className="text-slate-800">Explanation:</strong> ROM is non-volatile because it retains its contents even when the power is turned off.
                    </div>
                  )}
                </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default InteractiveQuizPage;
