import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaSpellCheck, FaBookmark } from 'react-icons/fa';

const DefinitionsPage = ({ definitionsText, definitions = [] }) => {
  const cleanDefinitions = definitionsText 
    ? definitionsText.replace(/^[#\s]*\d*\.?\s*KEY DEFINITIONS\s*/i, '').trim() 
    : '';

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title */}
      <div className="pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Chapter 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Key Definitions
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-normal">
          Accurate terminology and definitions to memorize for definitions and short-answer exam questions.
        </p>
      </div>

      {/* Main Definitions Cards Container */}
      <div className="flex-1 overflow-y-auto">
        {definitions && definitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definitions.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs border-l-4 border-l-purple-500 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-base">
                    {item.term}
                  </h3>
                  <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    Term #{idx + 1}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        ) : cleanDefinitions ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 font-normal">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h4 className="text-sm font-semibold text-slate-800 mt-3 mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-purple-900" {...props} />,
                p: ({ node, ...props }) => <p className="my-2 leading-relaxed text-slate-600 font-normal" {...props} />,
                li: ({ node, ...props }) => <li className="my-1 text-slate-600 font-normal" {...props} />
              }}
            >
              {cleanDefinitions}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaBookmark className="text-base" />
            </div>
            <p className="text-slate-500 text-sm font-normal">
              Essential definitions are highlighted inside each question card in Chapter 2.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default DefinitionsPage;
