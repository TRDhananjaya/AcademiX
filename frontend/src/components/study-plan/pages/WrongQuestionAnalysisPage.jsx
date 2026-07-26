import React from 'react';

// A mock placeholder to show the design of Mistake Cards. 
// In a real implementation, you'd parse this from the markdown text.
const WrongQuestionAnalysisPage = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 2</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Understanding My Mistakes</h2>
        <p className="text-slate-500 mt-2">Let's understand why these questions were difficult and how to improve.</p>
      </div>

      <div className="space-y-6">
        {/* Mistake Card Example */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-red-500">❌</span> Question I got wrong
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-1">My Answer</span>
              <p className="text-slate-700">Storage is part of the CPU</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <span className="text-xs font-bold text-green-500 uppercase tracking-widest block mb-1">Correct Answer</span>
              <p className="text-slate-700">Storage is separate from CPU components</p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-4">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-1">Concept I need to learn</span>
            <p className="text-slate-700">The CPU consists of ALU, CU, and Registers. Primary and secondary storage are distinct components in the Von Neumann architecture.</p>
          </div>
        </div>

        {/* Placeholder for when real data is not perfectly parsed */}
        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 italic">This section requires structured mistake data from the RAG pipeline to generate visual cards.</p>
        </div>
      </div>
    </div>
  );
};

export default WrongQuestionAnalysisPage;
