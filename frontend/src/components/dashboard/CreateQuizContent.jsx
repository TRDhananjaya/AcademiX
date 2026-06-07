import React, { useState } from 'react';

export default function CreateQuizContent() {
  const [questions, setQuestions] = useState([
    { id: 1, type: 'multiple-choice', text: '', options: ['', '', '', ''], correctOption: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), type: 'multiple-choice', text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="max-w-[1200px] mx-auto font-sans">
      <div className="flex justify-between items-end mb-7">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-800 m-0 mb-2">Create New Quiz</h1>
          <p className="text-[15px] text-slate-500 m-0">Design your assessment, set rules, and add questions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="bg-white text-slate-600 px-6 py-2.5 rounded-lg border border-slate-300 font-semibold text-[14.5px] cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-800" 
            onClick={() => window.history.pushState({}, '', '/dashboard') || window.dispatchEvent(new PopStateEvent('popstate'))}>
            Cancel
          </button>
          <button className="bg-indigo-900 text-white px-6 py-2.5 rounded-lg border-none font-semibold text-[14.5px] cursor-pointer transition-all hover:bg-indigo-700 hover:-translate-y-[1px] shadow-sm">
            Publish Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Main Content: Details & Questions */}
        <div className="flex flex-col gap-6">
          {/* Section 1: Basic Details */}
          <div className="bg-white rounded-xl border border-slate-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-bold text-slate-800 m-0 mb-5">1. Quiz Details</h2>
            
            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Quiz Title</label>
              <input type="text" placeholder="e.g., Midterm Examination - ICT" className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" />
            </div>

            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Question Bundle / Topic</label>
              <select className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10">
                <option>Information and Communication Technology</option>
                <option>Fundamentals of a Computer System</option>
                <option>Data Representation Methods in the Computer System</option>
                <option>Logic Gates with Boolean Functions</option>
              </select>
            </div>

            <div className="mb-0">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Instructions for Students</label>
              <textarea placeholder="Enter any specific instructions..." className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" rows="3"></textarea>
            </div>
          </div>

          {/* Section 2: Questions Builder */}
          <div className="bg-white rounded-xl border border-slate-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 m-0">2. Questions</h2>
              <button className="bg-transparent text-indigo-600 px-4 py-2 rounded-md border-[1.5px] border-indigo-600 font-semibold text-sm cursor-pointer transition-all hover:bg-indigo-50" onClick={handleAddQuestion}>+ Add Question</button>
            </div>

            <div className="flex flex-col gap-5 mb-5">
              {questions.map((q, index) => (
                <div key={q.id} className="border-[1.5px] border-slate-200 rounded-lg p-5 bg-slate-50 transition-colors focus-within:border-slate-300 focus-within:bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-md">Question {index + 1}</span>
                    <button className="bg-transparent border-none cursor-pointer p-1 rounded-md text-slate-400 flex items-center justify-center transition-all hover:bg-slate-200 hover:text-red-500" onClick={() => handleRemoveQuestion(q.id)} title="Remove Question">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-5">
                    <input type="text" placeholder="Enter your question here..." className="font-medium w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((optIndex) => {
                      const isCorrect = q.correctOption === optIndex;
                      return (
                        <div className="relative flex items-center" key={optIndex}>
                          <div 
                            className={`absolute left-3 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-indigo-500'}`} 
                            title="Mark as correct answer"
                            onClick={() => {
                              const newQs = [...questions];
                              newQs[index].correctOption = optIndex;
                              setQuestions(newQs);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <input type="text" placeholder={`Option ${optIndex + 1}`} className={`w-full pl-[44px] pr-4 py-3 border-[1.5px] rounded-lg text-[14.5px] text-slate-800 transition-all font-sans focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400 ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg bg-transparent text-slate-500 font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-indigo-500 hover:text-indigo-600 hover:bg-slate-50" onClick={handleAddQuestion}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Another Question
            </button>
          </div>
        </div>

        {/* Sidebar: Settings */}
        <div>
          <div className="bg-white rounded-xl border border-slate-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-bold text-slate-800 m-0 mb-5">Quiz Settings</h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Time Limit</span>
                  <span className="text-xs text-slate-500">Duration in minutes</span>
                </div>
                <input type="number" defaultValue="45" className="w-20 text-center px-3 py-2 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10" min="1" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Passing Score</span>
                  <span className="text-xs text-slate-500">Percentage required to pass</span>
                </div>
                <div className="relative flex items-center">
                  <input type="number" defaultValue="50" className="w-20 text-center pl-3 pr-7 py-2 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10" min="1" max="100" />
                  <span className="absolute right-3 text-slate-500 font-medium text-sm">%</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 my-1"></div>

              <label className="flex justify-between items-center cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Randomize Questions</span>
                  <span className="text-xs text-slate-500">Shuffle order for each student</span>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative transition-all duration-300">
                  <div className="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[23px] transition-all duration-300 shadow-sm"></div>
                </div>
              </label>

              <label className="flex justify-between items-center cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Show Results Immediately</span>
                  <span className="text-xs text-slate-500">Display score upon submission</span>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative transition-all duration-300">
                  <div className="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[23px] transition-all duration-300 shadow-sm"></div>
                </div>
              </label>

              <label className="flex justify-between items-center cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Allow Multiple Attempts</span>
                  <span className="text-xs text-slate-500">Students can retake the quiz</span>
                </div>
                <div className="w-11 h-6 bg-slate-300 rounded-full relative transition-all duration-300">
                  <div className="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] left-[3px] transition-all duration-300 shadow-sm"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
