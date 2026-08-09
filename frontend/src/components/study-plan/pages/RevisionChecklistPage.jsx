import React from 'react';
import ReactMarkdown from 'react-markdown';

const RevisionChecklistPage = ({ revisionText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 6</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Revision Checklist</h2>
        <p className="text-slate-500 mt-2">Tick off these items as you master them.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex-1 relative overflow-hidden">
        {/* Binder Holes Visual */}
        <div className="absolute left-4 top-0 h-full w-4 flex flex-col justify-evenly">
          {[1,2,3,4,5].map(i => (
             <div key={i} className="w-4 h-4 rounded-full bg-slate-100 shadow-inner"></div>
          ))}
        </div>

        <div className="pl-8 prose prose-slate prose-ul:list-none prose-li:flex prose-li:items-center prose-li:gap-3 prose-li:border-b prose-li:border-slate-100 prose-li:pb-3 max-w-none">
          {revisionText ? (
            // Note: If parsing real markdown checklist, we'd process it differently. 
            // For now, rendering as markdown.
            <ReactMarkdown>{revisionText}</ReactMarkdown>
          ) : (
            <ul>
              <li>
                 <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                 <span className="text-slate-700 font-medium">Understand the components of a CPU</span>
              </li>
              <li>
                 <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                 <span className="text-slate-700 font-medium">Differentiate between RAM and ROM</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionChecklistPage;
