import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { useAuth } from '../../context/AuthContext';

export default function TakeQuiz() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('quizzes');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // Force to 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    if (!user) return;
    const loadQuizData = async () => {
      try {
        // Fetch quizzes and student results in parallel for better performance
        const [quizRes, studentRes] = await Promise.all([
          fetch('http://localhost:5000/api/quizzes'),
          fetch(`http://localhost:5000/api/quiz-results/student/${user.username}`)
        ]);

        const quizzesData = await quizRes.json();
        setQuizzes(quizzesData);
        
        if (quizzesData.length > 0 && studentRes.ok) {
          const currentQuizId = quizzesData[0]._id;
          const studentResults = await studentRes.json();
          const pastResult = studentResults.find(r => r.quizId === currentQuizId);
          
          if (pastResult) {
            setFinalScore(pastResult);
            setIsSubmitted(true);
            setHasStarted(true);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setIsLoading(false);
      }
    };
    
    loadQuizData();
  }, [user]);
  
  const currentQuiz = quizzes.length > 0 ? quizzes[0] : null;
  const activeQuestions = currentQuiz && currentQuiz.questions ? currentQuiz.questions : [];
  const totalQuestions = activeQuestions.length;
  const currentQuestion = totalQuestions > 0 ? activeQuestions[currentIndex] : null;
  const questionId = currentQuestion ? (currentQuestion._id || currentQuestion.id) : null;
  const isCurrentQuestionAnswered = questionId ? selectedAnswers[questionId] !== undefined : false;
  
  const handleSubmit = async () => {
    setIsSubmitted(true);
    
    // API Call to submit quiz
    if (!currentQuiz) return;

    const score = calculateScore();
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const secsTaken = (30 * 60) - timeLeft;
    const mins = Math.floor(secsTaken / 60);
    const secs = secsTaken % 60;
    const timeTakenStr = `${mins}m ${secs.toString().padStart(2, '0')}s`;

    try {
      const response = await fetch('http://localhost:5000/api/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId: currentQuiz._id,
          studentId: user?.username || 'student1',
          studentName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'John Doe',
          correctAnswers: score,
          totalQuestions: totalQuestions,
          percentage: pct,
          timeTaken: timeTakenStr
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFinalScore(result);
      } else {
        console.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  useEffect(() => {
    if (hasStarted && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (hasStarted && !isSubmitted && timeLeft === 0) {
      // Auto submit when time runs out
      handleSubmit();
    }
  }, [hasStarted, isSubmitted, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion._id || currentQuestion.id]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q._id || q.id] === q.correctOption) {
        score++;
      }
    });
    return score;
  };

  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100) || 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="take-quiz-layout">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
        <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
          <StudentTopBar />
          <main className="flex-1 p-[20px_16px] md:p-[40px_60px] overflow-y-auto bg-[#f8f9fb]">
            <div className="max-w-[900px] mx-auto w-full">
              <div className="bg-white rounded-3xl p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center mt-10">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-semibold text-slate-500">Loading Quizzes...</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!currentQuiz || totalQuestions === 0) {
    return (
      <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="take-quiz-layout">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
        <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
          <StudentTopBar />
          <main className="flex-1 p-[20px_16px] md:p-[40px_60px] overflow-y-auto bg-[#f8f9fb]">
            <div className="max-w-[900px] mx-auto w-full">
              <div className="bg-white rounded-3xl p-20 shadow-sm border border-slate-100 text-center mt-10">
                <h1 className="text-2xl font-bold text-slate-800">No quizzes available right now.</h1>
                <p className="text-slate-500 mt-2">Check back later for new assignments.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="take-quiz-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[40px_60px] overflow-y-auto bg-[#f8f9fb]">
          <div className="max-w-[900px] mx-auto w-full">
            
            {!hasStarted ? (
              // --- Preview Screen ---
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center mt-10">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentQuiz.title}</h1>
                <p className="text-lg text-slate-500 mb-8">{currentQuiz.bundleTopic}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-400 text-sm font-medium mb-1">Duration</div>
                    <div className="text-slate-800 font-bold text-lg">45 Minutes</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-400 text-sm font-medium mb-1">Questions</div>
                    <div className="text-slate-800 font-bold text-lg">{totalQuestions} Total</div>
                  </div>
                </div>

                <button 
                  onClick={() => setHasStarted(true)}
                  className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold text-lg shadow-md hover:bg-indigo-700 transition-colors w-full max-w-md"
                >
                  Start Quiz
                </button>
              </div>
            ) : isSubmitted ? (
              // --- Results Screen ---
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center mt-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h1>
                <p className="text-[15px] text-slate-500 mb-8 max-w-md">
                  You have successfully submitted the quiz. Your answers are now locked and you cannot reattempt or change them.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 w-full max-w-md mb-10">
                  <h3 className="text-slate-400 font-bold tracking-widest text-[11px] uppercase mb-6">Your Final Score</h3>
                  <div className="flex items-end justify-center gap-2 mb-2">
                    <span className="text-6xl font-extrabold text-slate-900 tracking-tight">
                      {finalScore ? finalScore.score : calculateScore()}
                    </span>
                    <span className="text-2xl font-bold text-slate-400 mb-2">/ {totalQuestions}</span>
                  </div>
                  <div className="text-indigo-600 font-semibold mt-4">
                    {finalScore ? finalScore.percentage : Math.round((calculateScore() / totalQuestions) * 100)}% Accuracy
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = '/student/dashboard'}
                  className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors w-full max-w-md"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              // --- Active Quiz Screen ---
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-[34px] font-bold text-slate-900 leading-tight mb-1">
                      {currentQuiz.title}
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium">
                      {currentQuiz.bundleTopic}
                    </p>
                  </div>
                  <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-2.5">
                    <svg className="text-indigo-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span className="text-[22px] font-bold text-indigo-600 tracking-wider">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Area */}
                <div className="mb-10">
                  <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden mb-3 relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-[#6338f0] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                    <span>Question {currentIndex + 1} of {totalQuestions}</span>
                    <span>{progressPercentage}% Complete</span>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-8">
                  <h2 className="text-[20px] font-bold text-slate-900 leading-snug mb-8">
                    {currentQuestion.text}
                  </h2>
                  
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => {
                      const questionId = currentQuestion._id || currentQuestion.id;
                      const isSelected = selectedAnswers[questionId] === idx;
                      return (
                        <label 
                          key={idx}
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-[#6338f0] bg-indigo-50/30' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <input 
                            type="radio" 
                            name={`question-${questionId}`}
                            value={idx}
                            checked={isSelected}
                            onChange={() => handleSelectOption(idx)}
                            className="w-5 h-5 text-[#6338f0] focus:ring-[#6338f0] border-slate-300 cursor-pointer mr-4 shrink-0"
                          />
                          <span className={`text-[15px] ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  
                  <div className="w-full h-[1px] bg-slate-100 my-8"></div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <button 
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold border-2 transition-colors min-w-[120px]
                        ${currentIndex === 0 
                          ? 'border-slate-200 text-slate-400 cursor-not-allowed opacity-50' 
                          : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      Previous
                    </button>
                    
                    {currentIndex < totalQuestions - 1 ? (
                      <button 
                        onClick={handleNext}
                        disabled={!isCurrentQuestionAnswered}
                        className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-semibold transition-colors min-w-[120px]
                          ${!isCurrentQuestionAnswered 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-[#6338f0] text-white hover:bg-[#522ce0] shadow-md shadow-indigo-200'
                          }`}
                      >
                        Next
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                    ) : (
                      <button 
                        onClick={handleSubmit}
                        disabled={!isCurrentQuestionAnswered}
                        className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-semibold transition-colors min-w-[120px]
                          ${!isCurrentQuestionAnswered 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200'
                          }`}
                      >
                        Submit Quiz
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
