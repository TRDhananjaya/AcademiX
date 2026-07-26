import React from 'react';
import ReactMarkdown from 'react-markdown';

const StudySchedulePage = ({ scheduleText }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Chapter 8</h3>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Study Schedule</h2>
        <p className="text-slate-500 mt-2">Your step-by-step timeline to mastery.</p>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
         
         <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-indigo-200 hidden sm:block"></div>

         {scheduleText ? (
           <div className="prose prose-slate prose-h3:text-indigo-600 prose-h3:text-xl max-w-none ml-0 sm:ml-12">
             <ReactMarkdown>{scheduleText}</ReactMarkdown>
           </div>
         ) : (
           <div className="space-y-6">
              {/* Mock Timeline Event */}
              <div className="relative pl-0 sm:pl-16">
                 <div className="hidden sm:flex absolute left-[-16px] top-4 w-12 h-12 bg-white border-4 border-indigo-200 rounded-full items-center justify-center font-bold text-indigo-600 shadow-sm z-10">
                   1
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Day 1</span>
                    <h4 className="font-bold text-slate-800 text-lg mb-2">Review CPU Architecture</h4>
                    <p className="text-slate-600 text-sm mb-4">Focus on the roles of the ALU, Control Unit, and Registers.</p>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300" />
                       <span className="text-sm text-slate-500 font-medium">Mark as complete</span>
                    </div>
                 </div>
              </div>

              <div className="relative pl-0 sm:pl-16">
                 <div className="hidden sm:flex absolute left-[-16px] top-4 w-12 h-12 bg-white border-4 border-indigo-200 rounded-full items-center justify-center font-bold text-indigo-600 shadow-sm z-10">
                   2
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Day 2</span>
                    <h4 className="font-bold text-slate-800 text-lg mb-2">Memory Types</h4>
                    <p className="text-slate-600 text-sm mb-4">Learn the difference between Volatile (RAM) and Non-Volatile (ROM) memory.</p>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300" />
                       <span className="text-sm text-slate-500 font-medium">Mark as complete</span>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default StudySchedulePage;
