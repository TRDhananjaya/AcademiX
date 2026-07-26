import React from 'react';
import ReactMarkdown from 'react-markdown';

const StudyNotesPage = ({ notesText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 4</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Personalized Study Notes</h2>
        <p className="text-slate-500 mt-2">Bite-sized concept cards created from your weak areas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {notesText ? (
          <div className="col-span-full prose prose-slate max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {/* Ideally we parse the markdown into separate Concept Cards, but for now we render as markdown in a nice container */}
            <ReactMarkdown>{notesText}</ReactMarkdown>
          </div>
        ) : (
          <p className="col-span-full text-slate-400 italic">No notes available.</p>
        )}

        {/* Example Mock Concept Card Design */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-4">
            💡
          </div>
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-2">Concept</span>
          <h4 className="font-bold text-slate-800 text-lg mb-2">Example: Information System</h4>
          <p className="text-slate-600 text-sm mb-4">A formal, sociotechnical, organizational system designed to collect, process, store, and distribute information.</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
             <span className="text-xs font-bold text-amber-600 uppercase block mb-1">Exam Tip</span>
             <p className="text-amber-800 text-xs">Don't confuse Data with Information. Information is processed Data.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudyNotesPage;
