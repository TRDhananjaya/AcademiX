import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaExclamationTriangle, FaCheckCircle, FaLayerGroup } from 'react-icons/fa';

const WeakConceptPriorityPage = ({ weakText, strongText }) => {
  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title */}
      <div className="pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Chapter 3
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Weak Concepts Priority
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-normal">
          Ranked overview of core concepts requiring reinforcement, ordered by diagnostic urgency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* Left Column: Weak & Mastered Concept Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Weak Topics Card */}
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-amber-800 font-semibold text-sm">
              <FaExclamationTriangle className="text-amber-500" />
              <span>Priority Reinforcement Areas</span>
            </div>
            
            {weakText ? (
              <div className="prose prose-slate max-w-none text-sm text-slate-600 font-normal leading-relaxed">
                <ReactMarkdown
                  components={{
                    h2: ({ node, ...props }) => <h3 className="text-sm font-bold text-slate-800 mt-3 mb-1" {...props} />,
                    h3: ({ node, ...props }) => <h4 className="text-xs font-semibold text-slate-700 mt-2 mb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
                    p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed font-normal text-slate-600" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="my-0.5 leading-relaxed font-normal text-slate-600" {...props} />
                  }}
                >
                  {weakText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm font-normal">
                Concepts requiring review are summarized within your Question Mistakes analysis.
              </p>
            )}
          </div>

          {/* Mastered Concepts Card */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-emerald-800 font-semibold text-sm">
              <FaCheckCircle className="text-emerald-500" />
              <span>Demonstrated Strengths</span>
            </div>

            {strongText ? (
              <div className="prose prose-slate max-w-none text-sm text-slate-600 font-normal leading-relaxed">
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...props }) => <strong className="font-semibold text-slate-800" {...props} />,
                    p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed font-normal text-slate-600" {...props} />
                  }}
                >
                  {strongText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-600 text-sm font-normal">
                You demonstrated baseline understanding across the introductory sections. Continue practicing to cement these concepts.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Visual Hierarchy Guide (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <FaLayerGroup className="text-indigo-500" />
            <span>Study Urgency Framework</span>
          </div>

          <div className="space-y-3">
            
            <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-xs flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shrink-0 mt-0.5">
                Critical
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Core Definitions & Classification</span>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">Directly tested; review today before moving ahead.</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                High
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">System Components & Operations</span>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">Understand internal interactions and differences.</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0 mt-0.5">
                Medium
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Broader ICT Applications</span>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">Practical examples and daily life context.</p>
              </div>
            </div>

          </div>

          <div className="pt-2 text-xs text-slate-400 font-normal leading-relaxed border-t border-slate-200/60">
            Tip: Dedicate 70% of revision time to Critical topics to maximize score gains.
          </div>
        </div>

      </div>

    </div>
  );
};

export default WeakConceptPriorityPage;
