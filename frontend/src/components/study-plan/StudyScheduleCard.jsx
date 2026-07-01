import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiClock, FiAward, FiCalendar } from 'react-icons/fi';

const StudyScheduleCard = ({ scheduleText, motivationText }) => {
  
  // Parse schedule items from markdown list
  const parseSchedule = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim() !== '' && !line.match(/^##/));
    
    // Group into logical blocks if they are list items
    const sessions = [];
    let currentSession = null;
    
    lines.forEach(line => {
      // Check if it's a new list item (like "A.", "1.", "-", "*")
      const isNewItem = line.match(/^([A-Z]\.|\d+\.|\-|\*)\s+(.*)/i);
      
      if (isNewItem) {
        if (currentSession) sessions.push(currentSession);
        // Strip the list marker (e.g. "A.")
        currentSession = { content: isNewItem[2].trim(), subItems: [] };
      } else if (currentSession) {
        // It's a continuation or sub-bullet
        currentSession.subItems.push(line.replace(/^[\s\-\*]+/, '').trim());
      } else {
        // Fallback for lines before any list item
        currentSession = { content: line.trim(), subItems: [] };
      }
    });
    
    if (currentSession) sessions.push(currentSession);
    
    return sessions;
  };

  const sessions = parseSchedule(scheduleText);

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Schedule Card */}
      {scheduleText && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex-1">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <FiCalendar className="text-blue-600 w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Study Schedule</h2>
          </div>
          
          {sessions.length > 0 ? (
            <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-4">
              {sessions.map((session, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                  
                  <div className="bg-blue-50/50 rounded-2xl border border-blue-100/50 p-5 hover:bg-blue-50 transition-colors">
                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-2">Session {idx + 1}</h4>
                    <div className="prose prose-sm prose-slate max-w-none prose-p:my-0">
                      <ReactMarkdown>{session.content}</ReactMarkdown>
                    </div>
                    
                    {session.subItems.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {session.subItems.map((sub, sIdx) => (
                          <li key={sIdx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                              {sub}
                            </ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-blue max-w-none text-slate-600 prose-headings:text-slate-800">
              <ReactMarkdown>{scheduleText}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Motivation / Recommendation Card */}
      {motivationText && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 shadow-md text-white relative overflow-hidden">
          {/* Decorative Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonal-stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="20" height="40" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-stripes)" />
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-4 inline-flex shadow-inner">
              <FiAward className="w-8 h-8 text-indigo-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Recommendation</h3>
            <div className="prose prose-invert max-w-none text-indigo-50 leading-relaxed font-medium">
              <ReactMarkdown>{motivationText}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyScheduleCard;
