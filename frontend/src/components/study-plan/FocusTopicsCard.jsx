import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiTarget, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const FocusTopicsCard = ({ strongText, weakText }) => {
  // Parse lists into arrays, keeping markdown formatting
  const parseList = (text) => {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.replace(/^[\*\-]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter(line => line.length > 0 && !line.match(/^##/));
  };

  const strongTopics = parseList(strongText);
  const weakTopics = parseList(weakText);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-indigo-50">
          <FiTarget className="text-indigo-600 w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Topics to Focus</h2>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle className="text-rose-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Priority Revision</h3>
            </div>
            <ul className="space-y-2">
              {weakTopics.map((topic, idx) => (
                <li key={idx} className="bg-rose-50 border border-rose-100 text-slate-900 px-4 py-2.5 rounded-lg text-[14px] font-medium flex items-start gap-2">
                  <span className="font-bold text-rose-500 mt-0.5">{idx + 1}.</span>
                  <div className="prose prose-sm prose-slate max-w-none prose-p:my-0 prose-strong:text-slate-900 prose-strong:font-bold">
                    <ReactMarkdown>{topic}</ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strong Topics */}
        {strongTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiCheckCircle className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mastered Concepts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((topic, idx) => (
                <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md text-xs font-semibold">
                  <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                    {topic}
                  </ReactMarkdown>
                </span>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default FocusTopicsCard;
