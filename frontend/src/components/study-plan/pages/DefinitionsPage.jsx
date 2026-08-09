import React from 'react';
import ReactMarkdown from 'react-markdown';

const DefinitionsPage = ({ definitionsText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 5</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Key Definitions</h2>
        <p className="text-slate-500 mt-2">Essential terms you need to memorize for the exam.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner flex-1">
        {definitionsText ? (
           <div className="prose prose-slate prose-h3:text-indigo-600 prose-h3:text-lg max-w-none">
             <ReactMarkdown>{definitionsText}</ReactMarkdown>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mock Definition Flashcard */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Hardware</h4>
                <p className="text-slate-600 text-sm">The physical components of a computer system that you can touch.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Software</h4>
                <p className="text-slate-600 text-sm">Programs and operating information used by a computer.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default DefinitionsPage;
