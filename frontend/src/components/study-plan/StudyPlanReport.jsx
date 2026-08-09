import React, { useState } from 'react';
import CoverPage from './pages/CoverPage';
import PerformancePage from './pages/PerformancePage';
import WrongQuestionAnalysisPage from './pages/WrongQuestionAnalysisPage';
import WeakConceptPriorityPage from './pages/WeakConceptPriorityPage';
import StudyNotesPage from './pages/StudyNotesPage';
import DefinitionsPage from './pages/DefinitionsPage';
import RevisionChecklistPage from './pages/RevisionChecklistPage';
import InteractiveQuizPage from './pages/InteractiveQuizPage';
import StudySchedulePage from './pages/StudySchedulePage';
import MotivationPage from './pages/MotivationPage';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const extractSection = (text, startNumber, endNumber) => {
  if (!text) return '';
  const startRegex = new RegExp(`(?:^|\\n)#*\\s*${startNumber}\\.\\s+.*?\\n`, 'i');
  const startMatch = text.match(startRegex);
  
  if (!startMatch) return '';
  const startIndex = startMatch.index + startMatch[0].length;

  if (endNumber) {
    const endRegex = new RegExp(`(?:^|\\n)#*\\s*${endNumber}\\.\\s+`, 'i');
    const endMatch = text.substring(startIndex).match(endRegex);
    if (endMatch) {
      return text.substring(startIndex, startIndex + endMatch.index).trim();
    }
  }
  
  return text.substring(startIndex).trim();
};

const extractScoreFromText = (text) => {
  const match = text.match(/Overall Score:\s*([\d.]+)/i);
  return match ? match[1] : '0';
};

const StudyPlanReport = ({ planData, user }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const markdown = planData.generatedStudyPlan || '';
  
  // Extract Sections
  const performanceSummary = extractSection(markdown, 1, 2);
  const strongConcepts = extractSection(markdown, 2, 3);
  const weakConcepts = extractSection(markdown, 3, 4);
  const studyNotes = extractSection(markdown, 4, 5);
  const keyDefinitions = extractSection(markdown, 5, 6);
  const revisionPoints = extractSection(markdown, 6, 7);
  const practiceQuiz = extractSection(markdown, 7, 8);
  const studySchedule = extractSection(markdown, 8, 9);
  const finalMotivation = extractSection(markdown, 9, 10);

  const score = extractScoreFromText(markdown);
  const lessonTitle = planData.lessonId?.title || 'Unknown Lesson';

  // Book pages mapping
  const pages = [
    { component: <CoverPage user={user} lessonTitle={lessonTitle} score={score} dateGenerated={planData.createdAt} />, title: "Cover" },
    { component: <PerformancePage score={score} summaryText={performanceSummary} />, title: "Performance" },
    { component: <WrongQuestionAnalysisPage />, title: "My Mistakes" },
    { component: <WeakConceptPriorityPage weakText={weakConcepts} strongText={strongConcepts} />, title: "Weak Concepts" },
    { component: <StudyNotesPage notesText={studyNotes} />, title: "Study Notes" },
    { component: <DefinitionsPage definitionsText={keyDefinitions} />, title: "Key Definitions" },
    { component: <RevisionChecklistPage revisionText={revisionPoints} />, title: "Revision Checklist" },
    { component: <InteractiveQuizPage quizText={practiceQuiz} />, title: "Practice Quiz" },
    { component: <StudySchedulePage scheduleText={studySchedule} />, title: "Study Schedule" },
    { component: <MotivationPage motivationText={finalMotivation} user={user} />, title: "Motivation" }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const progressPercentage = ((currentPage + 1) / pages.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-20 relative font-sans">
      
      {/* Book Header / Progress */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Personalized Study Book</h2>
        <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Page Container */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] min-h-[600px] flex flex-col relative overflow-hidden transition-all duration-300 border border-slate-100">
        
        {/* Page Content with simple fade-in keyframe animation class */}
        <div className="flex-1 animate-fade-in relative z-10" key={currentPage}>
          {pages[currentPage].component}
        </div>

        {/* Page Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between z-10">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              currentPage === 0 
                ? 'opacity-0 cursor-default' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <FaChevronLeft />
            Previous
          </button>
          
          <div className="hidden sm:block text-slate-300 font-bold text-xs uppercase tracking-widest">
            {pages[currentPage].title}
          </div>

          <button 
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              currentPage === pages.length - 1 
                ? 'opacity-0 cursor-default' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            Next Page
            <FaChevronRight />
          </button>
        </div>

      </div>
      
      {/* CSS for simple fade in */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default StudyPlanReport;

