import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaBookOpen, FaSpellCheck, FaBookmark } from 'react-icons/fa';

const StudyNotesPage = ({ notesText, definitionsText, definitions = [] }) => {
  const cleanNotes = notesText 
    ? notesText.replace(/^[#\s]*\d*\.?\s*PERSONALIZED STUDY NOTES\s*/i, '').trim() 
    : '';

  const cleanDefinitions = definitionsText 
    ? definitionsText.replace(/^[#\s]*\d*\.?\s*KEY DEFINITIONS\s*/i, '').trim() 
    : '';

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title */}
      <div className="pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Chapter 3 of 5 · Knowledge Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Study Notes & Key Definitions
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-normal">
          High-yield concept summaries and official definitions curated for your revision.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs overflow-y-auto space-y-6">
        
        {/* Core Principles & Notes */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
            <FaBookOpen className="text-indigo-500" />
            <span>Key Principles & Concepts</span>
          </div>

          {cleanNotes ? (
            <div className="prose prose-slate max-w-none text-sm text-slate-600 font-normal leading-relaxed space-y-3">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }) => (
                    <div className="mt-4 mb-2 pb-1 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800" {...props} />
                    </div>
                  ),
                  h3: ({ node, ...props }) => (
                    <h4 className="text-sm font-semibold text-indigo-900 mt-3 mb-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-slate-800" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-1.5 leading-relaxed font-normal text-slate-600" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 my-2 space-y-1 text-slate-600" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-0.5 leading-relaxed font-normal text-slate-600" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <div className="bg-indigo-50/50 border-l-3 border-indigo-500 p-3 rounded-r-xl my-2.5 text-slate-700 font-normal text-xs">
                      <blockquote {...props} />
                    </div>
                  )
                }}
              >
                {cleanNotes}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-500 text-sm font-normal">
              Study notes are highlighted in detail inside each question diagnostic in Chapter 2.
            </p>
          )}
        </div>

        {/* Official Terminology Flashcards */}
        {(definitions.length > 0 || cleanDefinitions) && (
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <FaSpellCheck className="text-purple-500" />
              <span>Essential Definitions to Memorize</span>
            </div>

            {definitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {definitions.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 shadow-xs border-l-4 border-l-purple-500 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {item.term}
                      </h4>
                      <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        Term #{idx + 1}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-normal">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-xs text-slate-600 font-normal">
                <ReactMarkdown>{cleanDefinitions}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default StudyNotesPage;
