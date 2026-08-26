import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaChevronRight, FaChevronLeft, FaTimes, FaTrophy, FaArrowLeft } from 'react-icons/fa';

export default function FollowUpQuizModal({ quizData, studentId, studentName, lessonId, onClose, onQuizCompleted }) {
  const questions = quizData?.questions || [];
  const totalQuestions = questions.length;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes countdown
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQuestion = questions[currentIndex] || null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIdx
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);

    const score = calculateScore();
    const secsTaken = (45 * 60) - timeLeft;
    const mins = Math.floor(secsTaken / 60);
    const secs = secsTaken % 60;
    const timeTakenStr = `${mins}m ${secs.toString().padStart(2, '0')}s`;

    const answersDetails = questions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      return {
        questionId: q._id || q.id || `Q_${idx}`,
        questionText: q.text,
        selectedOption: selected !== undefined ? selected : -1,
        correctOption: q.correctOption,
        isCorrect: selected === q.correctOption,
        moduleId: quizData?.moduleId || ''
      };
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/followup/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quizData?.quizCode || `FQ_${lessonId}_${studentId}`,
          lessonId: lessonId || '',
          studentId: studentId || 'STU-0001',
          studentName: studentName || 'Student',
          score,
          totalQuestions: totalQuestions || 20,
          timeTaken: timeTakenStr,
          answersDetails
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFinalResult(data.result);
        setIsSubmitted(true);
        if (onQuizCompleted) {
          onQuizCompleted(data.result);
        }
      } else {
        const fallback = {
          score,
          totalQuestions: totalQuestions || 20,
          percentage: Math.round((score / Math.max(1, totalQuestions)) * 100),
          timeTaken: timeTakenStr,
          answersDetails
        };
        setFinalResult(fallback);
        setIsSubmitted(true);
        if (onQuizCompleted) {
          onQuizCompleted(fallback);
        }
      }
    } catch (err) {
      console.error('Error submitting follow-up quiz:', err);
      const fallback = {
        score,
        totalQuestions: totalQuestions || 20,
        percentage: Math.round((score / Math.max(1, totalQuestions)) * 100),
        timeTaken: timeTakenStr,
        answersDetails
      };
      setFinalResult(fallback);
      setIsSubmitted(true);
      if (onQuizCompleted) {
        onQuizCompleted(fallback);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / Math.max(1, totalQuestions)) * 100);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8f9fb] w-screen h-screen min-h-screen flex flex-col overflow-y-auto font-sans animate-fade-in">
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (isSubmitted || window.confirm("Are you sure you want to leave the quiz? Your progress will be lost.")) {
                onClose();
              }
            }}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-all border-none cursor-pointer"
          >
            <FaArrowLeft />
            Exit Quiz
          </button>

          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
              Follow-Up Quiz Assessment
            </span>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight m-0">
              {quizData?.title || 'Adaptive 20-MCQ Assessment'}
            </h1>
          </div>
        </div>

        {/* Timer Badge */}
        {!isSubmitted && (
          <div className="bg-indigo-50 border border-indigo-100 px-5 py-2 rounded-full flex items-center gap-2.5 text-indigo-700">
            <FaClock className="text-indigo-600 text-lg" />
            <span className="text-xl font-bold font-mono tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 max-w-[900px] mx-auto w-full p-6 md:p-10 flex flex-col justify-between">
        
        {isSubmitted ? (
          /* Results Screen */
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center my-auto relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600"></div>

            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl shadow-emerald-200">
              <FaTrophy />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Follow-Up Quiz Completed!
            </h1>
            <p className="text-slate-500 font-medium text-base mb-8 max-w-md mx-auto">
              Your responses have been recorded. Here is your adaptive performance summary:
            </p>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 w-full max-w-lg mx-auto mb-8">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Final Score</div>
              <div className="flex items-end justify-center gap-2 mb-3">
                <span className="text-6xl font-black text-slate-900 tracking-tight">
                  {finalResult ? finalResult.score : calculateScore()}
                </span>
                <span className="text-2xl font-bold text-slate-400 mb-2">/ {totalQuestions}</span>
              </div>
              <div className="text-indigo-600 font-bold text-lg">
                {finalResult ? finalResult.percentage : Math.round((calculateScore() / totalQuestions) * 100)}% Accuracy
              </div>
            </div>

            {/* Answer Breakdown */}
            <div className="w-full max-w-2xl mx-auto text-left bg-slate-50/80 rounded-2xl p-6 border border-slate-100 mb-8 max-h-[320px] overflow-y-auto">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                Detailed Answer Breakdown
              </h3>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const selected = selectedAnswers[idx];
                  const isCorrect = selected === q.correctOption;
                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-1" />
                        ) : (
                          <FaTimesCircle className="text-rose-500 text-base shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 mb-1">
                            Q{idx + 1}. {q.text}
                          </div>
                          <div className="text-xs font-medium text-slate-600">
                            Your answer: <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                              {selected !== undefined ? q.options[selected] : 'Not answered'}
                            </span>
                            {!isCorrect && (
                              <span className="ml-3 text-slate-500">
                                (Correct: <span className="text-emerald-700 font-bold">{q.options[q.correctOption]}</span>)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer border-none text-base"
            >
              Return to Study Plan
            </button>
          </div>
        ) : (
          /* Active Full-Screen Quiz Screen */
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Progress Section */}
            <div className="mb-8">
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-3 relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                <span className="text-indigo-600">{progressPercentage}% Completed</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8 flex-1 flex flex-col justify-between">
              <div>
                {currentQuestion?.moduleTitle && (
                  <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-extrabold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                    {currentQuestion.moduleTitle}
                  </div>
                )}

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-8">
                  {currentQuestion?.text}
                </h2>

                {/* Option Buttons */}
                <div className="space-y-4">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-base font-medium ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer Controls */}
              <div className="pt-10 border-t border-slate-100 mt-8 flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border-none ${
                    currentIndex === 0 
                      ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  <FaChevronLeft />
                  Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer border-none"
                  >
                    Next Question
                    <FaChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-4 rounded-xl font-extrabold text-sm bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all cursor-pointer border-none"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Follow-Up Quiz'}
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
