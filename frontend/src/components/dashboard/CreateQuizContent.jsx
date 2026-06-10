import React, { useState } from 'react';

const initialQuestions = [
  { id: 1, type: 'multiple-choice', text: 'What is data?', options: ['Processed information', 'Raw facts and figures', 'Knowledge', 'Report'], correctOption: 1 },
  { id: 2, type: 'multiple-choice', text: 'Which of the following is data?', options: ['Student report', '85, 90, 75', 'Annual summary', 'Result sheet'], correctOption: 1 },
  { id: 3, type: 'multiple-choice', text: 'Information is obtained by:', options: ['Storing data', 'Processing data', 'Deleting data', 'Sharing data'], correctOption: 1 },
  { id: 4, type: 'multiple-choice', text: 'Which characteristic means information is correct?', options: ['Timeliness', 'Accuracy', 'Cost', 'Relevance'], correctOption: 1 },
  { id: 5, type: 'multiple-choice', text: 'Which of the following is information?', options: ['Marks entered into a system', 'Student attendance numbers', 'Average class mark report', 'Raw survey answers'], correctOption: 2 },
  { id: 6, type: 'multiple-choice', text: 'Data can be represented using:', options: ['Numbers', 'Text', 'Images', 'All of the above'], correctOption: 3 },
  { id: 7, type: 'multiple-choice', text: 'The main purpose of information is:', options: ['Entertainment', 'Decision making', 'Programming', 'Storage'], correctOption: 1 },
  { id: 8, type: 'multiple-choice', text: 'Raw facts are known as:', options: ['Information', 'Knowledge', 'Data', 'Reports'], correctOption: 2 },
  { id: 9, type: 'multiple-choice', text: 'A weather report is:', options: ['Data', 'Information', 'Program', 'Input'], correctOption: 1 },
  { id: 10, type: 'multiple-choice', text: 'Which one is NOT information?', options: ['Monthly sales report', 'Student performance summary', 'Profit analysis', 'List of marks before calculation'], correctOption: 3 },
  { id: 11, type: 'multiple-choice', text: 'What converts data into information?', options: ['Input', 'Processing', 'Storage', 'Output'], correctOption: 1 },
  { id: 12, type: 'multiple-choice', text: 'Which characteristic ensures information contains all required details?', options: ['Accuracy', 'Timeliness', 'Completeness', 'Relevance'], correctOption: 2 },
  { id: 13, type: 'multiple-choice', text: 'Why is timely information important?', options: ['Reduces storage', 'Helps current decision making', 'Increases speed', 'Saves electricity'], correctOption: 1 },
  { id: 14, type: 'multiple-choice', text: 'A student’s final report card is:', options: ['Data', 'Information', 'Instruction', 'Program'], correctOption: 1 },
  { id: 15, type: 'multiple-choice', text: 'Which of the following best represents processing?', options: ['Entering exam marks', 'Calculating class average', 'Printing marks', 'Saving a file'], correctOption: 1 },
  { id: 16, type: 'multiple-choice', text: 'Information that is unrelated to a task lacks:', options: ['Accuracy', 'Completeness', 'Relevance', 'Timeliness'], correctOption: 2 },
  { id: 17, type: 'multiple-choice', text: 'A company manager uses information mainly to:', options: ['Increase storage', 'Make decisions', 'Upgrade hardware', 'Create software'], correctOption: 1 },
  { id: 18, type: 'multiple-choice', text: 'Which characteristic of information reduces the chance of incorrect decisions?', options: ['Accuracy', 'Size', 'Color', 'Format'], correctOption: 0 },
  { id: 19, type: 'multiple-choice', text: 'A list of temperatures recorded every hour is:', options: ['Information', 'Data', 'Knowledge', 'Report'], correctOption: 1 },
  { id: 20, type: 'multiple-choice', text: 'Which statement is true?', options: ['Data is always meaningful', 'Information is always raw', 'Information results from processing data', 'Information cannot be stored'], correctOption: 2 },
  { id: 21, type: 'multiple-choice', text: 'A school collects student marks and calculates the pass percentage. The pass percentage is:', options: ['Data', 'Input', 'Information', 'Storage'], correctOption: 2 },
  { id: 22, type: 'multiple-choice', text: 'Which characteristic is most important when using information for emergency medical decisions?', options: ['Color', 'Timeliness', 'Format', 'Size'], correctOption: 1 },
  { id: 23, type: 'multiple-choice', text: 'A company receives 10,000 sales records. After analysis, management receives a sales trend report. The report is:', options: ['Data', 'Information', 'Input device', 'Program'], correctOption: 1 },
  { id: 24, type: 'multiple-choice', text: 'Which combination represents good quality information?', options: ['Accurate, Complete, Relevant', 'Large, Colorful, Detailed', 'Fast, Cheap, Large', 'Complex, Technical, Long'], correctOption: 0 },
  { id: 25, type: 'multiple-choice', text: 'Which scenario demonstrates the transformation of data into information?', options: ['Entering marks into a database', 'Printing blank forms', 'Generating student rankings from marks', 'Saving records'], correctOption: 2 },
  { id: 26, type: 'multiple-choice', text: 'Why might incomplete information be dangerous?', options: ['Uses more storage', 'Leads to poor decisions', 'Slows the computer', 'Increases memory usage'], correctOption: 1 },
  { id: 27, type: 'multiple-choice', text: 'A business analyst uses customer purchase records to identify buying patterns. The identified patterns are:', options: ['Data', 'Information', 'Hardware', 'Input'], correctOption: 1 },
  { id: 28, type: 'multiple-choice', text: 'Which of the following is the best example of relevant information?', options: ['Weather data for another country', 'Student marks from last decade', 'Current semester performance report', 'Old attendance records'], correctOption: 2 },
  { id: 29, type: 'multiple-choice', text: 'The quality of information depends on:', options: ['Processing and accuracy of data', 'Screen size', 'Printer type', 'Internet speed only'], correctOption: 0 },
  { id: 30, type: 'multiple-choice', text: 'A hospital system records patient temperatures every hour. The temperature readings are data, while the diagnosis generated from them is:', options: ['Storage', 'Data', 'Information', 'Input'], correctOption: 2 }
];

const getRandomQuestions = (pool, count) => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function CreateQuizContent() {
  const [title, setTitle] = useState('Module 1.1 – Data and Information');
  const [bundleTopic, setBundleTopic] = useState('Information and Communication Technology');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState(() => getRandomQuestions(initialQuestions, 20));
  const [settings, setSettings] = useState({
    timeLimit: 45,
    passingScore: 50,
    randomizeQuestions: false,
    showResultsImmediately: true,
    allowMultipleAttempts: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), type: 'multiple-choice', text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bundleTopic,
          instructions,
          questions,
          settings
        })
      });
      if (response.ok) {
        alert('Quiz successfully published!');
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        alert('Failed to publish quiz');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
          <button 
            className="bg-indigo-900 text-white px-6 py-2.5 rounded-lg border-none font-semibold text-[14.5px] cursor-pointer transition-all hover:bg-indigo-700 hover:-translate-y-[1px] shadow-sm disabled:opacity-70"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Quiz'}
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
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Midterm Examination - ICT" className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" />
            </div>

            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Question Bundle / Topic</label>
              <select value={bundleTopic} onChange={(e) => setBundleTopic(e.target.value)} className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10">
                <option value="Information and Communication Technology">Information and Communication Technology</option>
                <option value="Fundamentals of a Computer System">Fundamentals of a Computer System</option>
                <option value="Data Representation Methods in the Computer System">Data Representation Methods in the Computer System</option>
                <option value="Logic Gates with Boolean Functions">Logic Gates with Boolean Functions</option>
              </select>
            </div>

            <div className="mb-0">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Instructions for Students</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Enter any specific instructions..." className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" rows="3"></textarea>
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
                    <input type="text" value={q.text} onChange={(e) => { const newQs = [...questions]; newQs[index].text = e.target.value; setQuestions(newQs); }} placeholder="Enter your question here..." className="font-medium w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" />
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
                          <input type="text" value={q.options[optIndex]} onChange={(e) => { const newQs = [...questions]; newQs[index].options[optIndex] = e.target.value; setQuestions(newQs); }} placeholder={`Option ${optIndex + 1}`} className={`w-full pl-[44px] pr-4 py-3 border-[1.5px] rounded-lg text-[14.5px] text-slate-800 transition-all font-sans focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400 ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`} />
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
                <input type="number" value={settings.timeLimit} onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 0})} className="w-20 text-center px-3 py-2 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10" min="1" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Passing Score</span>
                  <span className="text-xs text-slate-500">Percentage required to pass</span>
                </div>
                <div className="relative flex items-center">
                  <input type="number" value={settings.passingScore} onChange={(e) => setSettings({...settings, passingScore: parseInt(e.target.value) || 0})} className="w-20 text-center pl-3 pr-7 py-2 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10" min="1" max="100" />
                  <span className="absolute right-3 text-slate-500 font-medium text-sm">%</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 my-1"></div>

              <label className="flex justify-between items-center cursor-pointer" onClick={(e) => { e.preventDefault(); setSettings({...settings, randomizeQuestions: !settings.randomizeQuestions}); }}>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Randomize Questions</span>
                  <span className="text-xs text-slate-500">Shuffle order for each student</span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings.randomizeQuestions ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${settings.randomizeQuestions ? 'left-[23px]' : 'left-[3px]'}`}></div>
                </div>
              </label>

              <label className="flex justify-between items-center cursor-pointer" onClick={(e) => { e.preventDefault(); setSettings({...settings, showResultsImmediately: !settings.showResultsImmediately}); }}>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Show Results Immediately</span>
                  <span className="text-xs text-slate-500">Display score upon submission</span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings.showResultsImmediately ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${settings.showResultsImmediately ? 'left-[23px]' : 'left-[3px]'}`}></div>
                </div>
              </label>

              <label className="flex justify-between items-center cursor-pointer" onClick={(e) => { e.preventDefault(); setSettings({...settings, allowMultipleAttempts: !settings.allowMultipleAttempts}); }}>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm text-slate-800">Allow Multiple Attempts</span>
                  <span className="text-xs text-slate-500">Students can retake the quiz</span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings.allowMultipleAttempts ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${settings.allowMultipleAttempts ? 'left-[23px]' : 'left-[3px]'}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
