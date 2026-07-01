import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiBookOpen, FiStar, FiFileText } from 'react-icons/fi';

const StudyNotesCard = ({ notesText, definitionsText, revisionText }) => {
  
  // Parse definitions into an array of { title, text }
  const parseDefinitions = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim() !== '' && !line.match(/^##/));
    
    return lines.map(line => {
      // Typically formatted like "- **Term**: Definition" or "1. **Term** - Definition"
      // Let's try to extract bold term if exists
      const boldMatch = line.match(/\*\*(.*?)\*\*(?:[:\-]?\s*(.*))/);
      if (boldMatch) {
        return {
          title: boldMatch[1].trim(),
          text: boldMatch[2] ? boldMatch[2].trim() : ''
        };
      }
      
      // If no bold, try splitting by colon or hyphen
      const splitMatch = line.split(/[:\-]/);
      if (splitMatch.length > 1) {
        // Assume first part is title, rest is definition
        const title = splitMatch[0].replace(/^[\*\-\d\.\s]+/, '').trim();
        const def = splitMatch.slice(1).join(':').trim();
        if (title.length < 50) { // arbitrary threshold to avoid matching entire sentences
          return { title, text: def };
        }
      }
      
      // Fallback
      return { title: '', text: line.replace(/^[\*\-\d\.\s]+/, '').trim() };
    });
  };

  const parsedDefinitions = parseDefinitions(definitionsText);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-3 rounded-xl bg-indigo-50">
          <FiBookOpen className="text-indigo-600 w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Personalized Study Notes</h2>
      </div>

      <div className="space-y-10">
        
        {/* Main Notes */}
        {notesText && (
          <div className="prose prose-indigo max-w-none text-slate-600 prose-headings:text-slate-800 prose-p:leading-relaxed prose-a:text-indigo-600">
            <ReactMarkdown>{notesText}</ReactMarkdown>
          </div>
        )}

        {/* Key Definitions in highlighted boxes */}
        {definitionsText && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <FiStar className="text-amber-500 w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-800">Key Definitions</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {parsedDefinitions.map((def, idx) => (
                <div key={idx} className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50 hover:bg-amber-50 hover:border-amber-200 transition-colors">
                  {def.title && (
                    <h4 className="text-base font-bold text-amber-900 mb-2 pb-2 border-b border-amber-200/50 inline-block">
                      {def.title}
                    </h4>
                  )}
                  <p className="text-[15px] text-amber-800 leading-relaxed font-medium">
                    {def.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Revision Points */}
        {revisionText && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText className="text-slate-600 w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-800">Important Revision Points</h3>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 prose-p:my-1 prose-ul:my-1 prose-li:leading-relaxed">
              <ReactMarkdown>{revisionText}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudyNotesCard;
