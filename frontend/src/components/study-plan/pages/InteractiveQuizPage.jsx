import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaChartBar, 
  FaQuestionCircle, 
  FaSpinner, 
  FaTrophy, 
  FaRedo,
  FaCheck
} from 'react-icons/fa';

const InteractiveQuizPage = ({ 
  followUpQuizData, 
  moduleBreakdown = [], 
  quizText, 
  isLoading 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = followUpQuizData?.questions || [];
  const totalQuestions = questions.length;
  const hasQuestions = totalQuestions > 0;
  const currentQuestion = questions[currentIndex] || null;

  const handleSelectOption = (qIndex, optionIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: optionIdx
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

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="h-full flex flex-col justify-between space-y-2 font-sans overflow-hidden animate-fade-in">
      
      {/* Chapter Title & Subheader */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">
            CHAPTER 5 · ADAPTIVE PRACTICE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0 leading-tight">
            20 Practice Questions
          </h2>
        </div>

        {isSubmitted && (
          <button 
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-200 cursor-pointer shrink-0"
          >
            <FaRedo className="text-[10px]" /> Retake Quiz
          </button>
        )}
      </div>

      {/* Main Single Question Interface (Matching Image Design) */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2 text-slate-400 my-auto">
            <FaSpinner className="animate-spin text-2xl text-indigo-600" />
            <span className="text-xs font-medium">Loading practice questions...</span>
          </div>
        ) : hasQuestions ? (
          isSubmitted ? (
            /* ================= REVIEW ANSWERS SCREEN ================= */
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-xl p-4 shadow-sm text-center relative overflow-hidden">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-lg mx-auto mb-2">
                  <FaTrophy className="text-amber-300" />
                </div>
                <h3 className="text-lg font-black mb-0.5">Practice Completed!</h3>
                <p className="text-indigo-200 text-xs font-medium mb-3">
                  Overall accuracy across the 20 practice questions:
                </p>

                <div className="flex items-center justify-center gap-4 bg-white/10 rounded-lg p-2.5 max-w-xs mx-auto border border-white/15">
                  <div>
                    <div className="text-[10px] text-indigo-200 font-bold uppercase">Score</div>
                    <div className="text-xl font-black text-white">{score} <span className="text-xs text-indigo-300">/ {totalQuestions}</span></div>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div>
                    <div className="text-[10px] text-indigo-200 font-bold uppercase">Accuracy</div>
                    <div className="text-xl font-black text-emerald-300">{percentage}%</div>
                  </div>
                </div>
              </div>

              {/* Detailed Review */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  Detailed Answer Review ({answeredCount}/{totalQuestions} Answered)
                </h4>

                {questions.map((q, qIdx) => {
                  const userChoice = selectedAnswers[qIdx];
                  const isCorrect = userChoice === q.correctOption;

                  return (
                    <div 
                      key={q._id || qIdx} 
                      className={`p-3.5 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}>
                            Q{qIdx + 1}
                          </span>
                          {q.moduleTitle && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                              {q.moduleTitle}
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isCorrect ? <><FaCheckCircle /> Correct</> : <><FaTimesCircle /> Incorrect</>}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-800 text-xs sm:text-sm">{q.text}</p>

                      <div className="space-y-1.5 pt-0.5">
                        {q.options?.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctOption;
                          const isOptionSelected = userChoice === optIdx;

                          let style = "bg-white border-slate-200 text-slate-700";
                          if (isOptionCorrect) {
                            style = "bg-emerald-100/80 border-emerald-300 text-emerald-900 font-semibold";
                          } else if (isOptionSelected && !isOptionCorrect) {
                            style = "bg-rose-100/80 border-rose-300 text-rose-900 font-medium";
                          }

                          return (
                            <div key={optIdx} className={`p-2 rounded-lg border text-xs flex items-center justify-between ${style}`}>
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                  isOptionCorrect ? 'bg-emerald-600 text-white' : isOptionSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {getOptionLetter(optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {isOptionCorrect && (
                                <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 shrink-0">
                                  <FaCheckCircle className="text-emerald-600" /> Correct
                                </span>
                              )}
                              {isOptionSelected && !isOptionCorrect && (
                                <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1 shrink-0">
                                  <FaTimesCircle className="text-rose-600" /> Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-2 bg-white/80 border border-slate-200/80 rounded-lg text-[11px] text-slate-700 font-normal">
                          <span className="font-bold text-indigo-700">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ================= ACTIVE QUIZ MODE (EXACT MATCH TO ATTACHED SCREENSHOT) ================= */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Question 1 of 20 & 0 / 20 Answered Row + 1..20 Pill Row */}
              <div className="space-y-1.5 pb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Question {currentIndex + 1} of {totalQuestions}</span>
                  <span className="text-indigo-600 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                    {answeredCount} / {totalQuestions} Answered
                  </span>
                </div>

                {/* 1..20 Pill Row */}
                <div className="flex flex-wrap gap-1">
                  {questions.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center border-none ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-2xs scale-105'
                            : isAnswered
                            ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question & Options Section */}
              <div className="flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-hidden">
                
                {/* Q1 Badge (Left) & MODERATE Badge (Right) */}
                <div className="flex items-center justify-between shrink-0">
                  <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-2xs">
                    Q{currentIndex + 1}
                  </span>

                  {currentQuestion?.difficulty ? (
                    <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                      currentQuestion.difficulty.toLowerCase() === 'easy'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : currentQuestion.difficulty.toLowerCase() === 'hard'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      MODERATE
                    </span>
                  )}
                </div>

                {/* Question Prompt */}
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug m-0 shrink-0">
                  {currentQuestion?.text}
                </h3>

                {/* Options List */}
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  {currentQuestion?.options?.map((optionText, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentIndex, optIdx)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-bold shadow-2xs ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {getOptionLetter(optIdx)}
                          </span>
                          <span className="leading-tight text-xs sm:text-sm">{optionText}</span>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0">
                            <FaCheck />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Navigation Buttons Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all border border-slate-200 cursor-pointer ${
                    currentIndex === 0
                      ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FaChevronLeft className="text-[10px]" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer border-none"
                    >
                      Next Question <FaChevronRight className="text-[10px]" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all cursor-pointer border-none"
                    >
                      Submit & Review Answers
                    </button>
                  )}
                </div>
              </div>

            </div>
          )
        ) : quizText ? (
          <div className="prose prose-slate max-w-none text-xs text-slate-700 font-normal leading-relaxed space-y-2">
            <ReactMarkdown>{quizText}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-10 space-y-2 text-slate-400 my-auto">
            <FaQuestionCircle className="text-3xl text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-600">No practice questions found for this study plan.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default InteractiveQuizPage;
