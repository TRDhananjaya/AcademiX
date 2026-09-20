import React, { useState, useEffect } from 'react';

export default function CreateQuizContent() {
  const [modules, setModules] = useState([]);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [selectedModuleCode, setSelectedModuleCode] = useState('');
  const [title, setTitle] = useState('');
  const [bundleTopic, setBundleTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showReshuffleConfirm, setShowReshuffleConfirm] = useState(false);
  const [popupModal, setPopupModal] = useState(null);
  const [settings, setSettings] = useState({
    timeLimit: 30,
    passingScore: 50,
    randomizeQuestions: false,
    showResultsImmediately: true,
    allowMultipleAttempts: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchModulesAndQuizzes() {
      try {
        const [modulesRes, quizzesRes] = await Promise.all([
          fetch('/api/quizzes/modules'),
          fetch('/api/quizzes')
        ]);
        
        if (modulesRes.ok && quizzesRes.ok) {
          const modulesData = await modulesRes.json();
          const quizzesData = await quizzesRes.json();
          
          setModules(modulesData);
          setExistingQuizzes(quizzesData);
          
          if (modulesData.length > 0) {
            const defaultModule = window.history.state?.defaultModuleCode;
            const initialCode = defaultModule && modulesData.some(m => m.quizCode === defaultModule)
              ? defaultModule
              : modulesData[0].quizCode;
            setSelectedModuleCode(initialCode);
            handleModuleChange(initialCode, modulesData, quizzesData);
          }
        }
      } catch (error) {
        console.error('Error fetching modules or quizzes:', error);
      } finally {
        setIsLoadingModules(false);
      }
    };
    fetchModulesAndQuizzes();
  }, []);

  const handleModuleChange = async (quizCode, modulesList = modules, currentExisting = existingQuizzes) => {
    setSelectedModuleCode(quizCode);
    const mod = modulesList.find(m => m.quizCode === quizCode);
    if (!mod) return;

    setTitle(mod.title);
    setBundleTopic(mod.bundleTopic);

    // Check if there is an existing active quiz in database for this module
    const existingQuiz = currentExisting.find(q => q.quizCode === quizCode && q.questions && q.questions.length > 0);
    
    if (existingQuiz) {
      // Load the existing saved questions directly!
      setQuestions(existingQuiz.questions || []);
    } else {
      // Fetch 20 random questions from the module bank
      setIsLoadingQuestions(true);
      try {
        const response = await fetch(`/api/quizzes/modules/${quizCode}/questions`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || []);
        } else {
          console.error('Failed to fetch questions for module');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    }
  };

  function handleReshuffleQuestions() {
    if (!selectedModuleCode) return;
    setShowReshuffleConfirm(true);
  }

  async function triggerReshuffleQuestions() {
    setShowReshuffleConfirm(false);
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`/api/quizzes/modules/${selectedModuleCode}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        alert('Failed to fetch random questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Error fetching random questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), type: 'multiple-choice', text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id && q._id !== id));
  };

  async function handlePublish() {
    const activeMod = modules.find(m => m.quizCode === selectedModuleCode);
    if (!activeMod) {
      setPopupModal({
        type: 'error',
        title: 'Select Module Required',
        message: 'Please select a valid module before publishing the quiz.',
        buttonText: 'OK',
        onConfirm: () => setPopupModal(null)
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode: activeMod.quizCode,
          moduleId: activeMod.moduleId,
          title,
          bundleTopic,
          instructions,
          questions,
          settings
        })
      });
      if (response.ok) {
        setPopupModal({
          type: 'success',
          title: 'Quiz Successfully Published!',
          message: `The quiz "${title || activeMod.quizCode}" has been saved and is now live for all enrolled students.`,
          buttonText: 'Continue to Quizzes',
          onConfirm: () => {
            setPopupModal(null);
            window.history.pushState({}, '', '/teacher/quizzes');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        });
      } else {
        setPopupModal({
          type: 'error',
          title: 'Failed to Publish Quiz',
          message: 'An error occurred while publishing the quiz. Please check all fields and try again.',
          buttonText: 'OK',
          onConfirm: () => setPopupModal(null)
        });
      }
    } catch (error) {
      console.error(error);
      setPopupModal({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to server. Please check your internet connection.',
        buttonText: 'OK',
        onConfirm: () => setPopupModal(null)
      });
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
            disabled={isSubmitting || isLoadingQuestions || isLoadingModules}
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
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Select Module</label>
              {isLoadingModules ? (
                <div className="w-full py-3 text-slate-500 text-sm">Loading modules...</div>
              ) : (
                <select value={selectedModuleCode} onChange={(e) => handleModuleChange(e.target.value)} className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10">
                  {modules.map(m => (
                    <option key={m.quizCode} value={m.quizCode}>
                      {m.quizCode} - {m.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Quiz Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Midterm Examination - ICT" className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-lg text-[14.5px] text-slate-800 transition-all font-sans bg-white focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400" />
            </div>

            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-2">Question Bundle / Topic</label>
              <input type="text" value={bundleTopic} readOnly className="w-full px-4 py-3 border-[1.5px] border-slate-200 bg-slate-50 rounded-lg text-[14.5px] text-slate-500 transition-all font-sans focus:outline-none cursor-not-allowed" />
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
              <div className="flex gap-2">
                <button 
                  className="bg-transparent text-slate-600 px-4 py-2 rounded-md border-[1.5px] border-slate-300 font-semibold text-sm cursor-pointer transition-all hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleReshuffleQuestions}
                  disabled={isLoadingQuestions}
                >
                  Regenerate Random Questions
                </button>
                <button className="bg-transparent text-indigo-600 px-4 py-2 rounded-md border-[1.5px] border-indigo-600 font-semibold text-sm cursor-pointer transition-all hover:bg-indigo-50" onClick={handleAddQuestion}>+ Add Question</button>
              </div>
            </div>

            {isLoadingQuestions ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-sm font-semibold text-slate-500">Selecting 20 random questions from module question bank...</div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 mb-5">
                {questions.map((q, index) => (
                  <div key={q.id || q._id || index} className="border-[1.5px] border-slate-200 rounded-lg p-5 bg-slate-50 transition-colors focus-within:border-slate-300 focus-within:bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-md">Question {index + 1}</span>
                      <button className="bg-transparent border-none cursor-pointer p-1 rounded-md text-slate-400 flex items-center justify-center transition-all hover:bg-slate-200 hover:text-red-500" onClick={() => handleRemoveQuestion(q.id || q._id)} title="Remove Question">
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
            )}
            
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
            </div>
          </div>
        </div>
      </div>

      {/* Reshuffle Confirmation Modal */}
      {showReshuffleConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Reshuffle Module Questions?</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              This will replace the current questions with a new set of 20 random questions from the module question bank. Are you sure?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReshuffleConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={triggerReshuffleQuestions}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                Reshuffle Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Notification / Success Popup Modal */}
      {popupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${popupModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {popupModal.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{popupModal.title}</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              {popupModal.message}
            </p>

            <button
              onClick={popupModal.onConfirm}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-colors text-sm shadow-sm cursor-pointer ${popupModal.type === 'success' ? 'bg-[#3b28cc] hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {popupModal.buttonText || 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
