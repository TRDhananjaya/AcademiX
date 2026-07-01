import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiCheckSquare, FiKey } from 'react-icons/fi';

const PracticeQuizCard = ({ quizText }) => {
  // Parse questions from raw markdown
  // Splitting by numbered lists like "1. " or "2. "
  const rawQuestions = quizText ? quizText.split(/\n(?=\d+\.\s)/).filter(q => q.trim()) : [];
  
  // Extract question part and answer part for each item
  const parsedItems = rawQuestions.map(text => {
    // Split at "Answer:" or "Correct Answer:" or "Explanation:"
    const parts = text.split(/(?=\*\*Answer:\*\*|\*\*Correct Answer:\*\*|Answer:|Correct Answer:)/i);
    return {
      question: parts[0],
      answer: parts.slice(1).join('\n')
    };
  });

  const hasAnswers = parsedItems.some(item => item.answer && item.answer.trim() !== '');

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-3 rounded-xl bg-teal-50">
          <FiCheckSquare className="text-teal-600 w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Personalized Practice Quiz</h2>
      </div>

      <div className="space-y-12">
        {parsedItems.length > 0 ? (
          <>
            {/* Questions Section */}
            <div className="space-y-6">
              {parsedItems.map((item, idx) => (
                <div key={`q-${idx}`} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <div className="prose prose-slate max-w-none text-slate-700 prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown>{item.question}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Answer Key Section */}
            {hasAnswers && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <FiKey className="text-teal-600 w-5 h-5" />
                  <h3 className="text-lg font-bold text-slate-800">Answer Key & Explanations</h3>
                </div>
                
                <div className="space-y-4">
                  {parsedItems.map((item, idx) => {
                    if (!item.answer || item.answer.trim() === '') return null;
                    return (
                      <div key={`a-${idx}`} className="bg-teal-50/50 rounded-xl border border-teal-100 p-5">
                        <h4 className="text-sm font-bold text-teal-800 mb-2">Answer for Question {idx + 1}</h4>
                        <div className="prose prose-teal max-w-none text-teal-900 prose-p:my-1 prose-strong:text-teal-800">
                          <ReactMarkdown>{item.answer}</ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-600">
            <ReactMarkdown>{quizText}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeQuizCard;
