import React from 'react';
import ReactMarkdown from 'react-markdown';

const WeakConceptPriorityPage = ({ weakText, strongText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 3</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Weak Concepts Priority</h2>
        <p className="text-slate-500 mt-2">Here is your learning roadmap. Let's tackle these topics systematically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Priority List */}
        <div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm mb-6">
             <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h4 className="font-bold text-slate-800">High Priority (Weak Concepts)</h4>
             </div>
             <div className="prose prose-sm prose-p:text-slate-600 prose-li:text-slate-600">
                {weakText ? <ReactMarkdown>{weakText}</ReactMarkdown> : <p className="italic">No weak topics found.</p>}
             </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💪</span>
                <h4 className="font-bold text-slate-800">Mastered Concepts</h4>
             </div>
             <div className="prose prose-sm prose-p:text-slate-600 prose-li:text-slate-600">
                {strongText ? <ReactMarkdown>{strongText}</ReactMarkdown> : <p className="italic">Keep practicing to master topics.</p>}
             </div>
          </div>
        </div>

        {/* Priority Roadmap visual representation */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6">Learning Priority Map</h4>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                ★★★★★
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h5 className="font-bold text-slate-800">Critical Topics</h5>
                <p className="text-xs text-slate-500 mt-1">Review immediately</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                ★★★★
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h5 className="font-bold text-slate-800">High Priority</h5>
                <p className="text-xs text-slate-500 mt-1">Review this week</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-yellow-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                ★★★
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h5 className="font-bold text-slate-800">Medium Priority</h5>
                <p className="text-xs text-slate-500 mt-1">Review before exam</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WeakConceptPriorityPage;
