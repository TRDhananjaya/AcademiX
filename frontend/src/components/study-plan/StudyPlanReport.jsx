import React, { useState, useEffect } from 'react';
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
import FollowUpQuizModal from './FollowUpQuizModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { parseStudyPlan } from './parseStudyPlan';

const StudyPlanReport = ({ planData, user }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [followUpQuizData, setFollowUpQuizData] = useState(null);
  const [followUpCompleted, setFollowUpCompleted] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);
  const [moduleBreakdown, setModuleBreakdown] = useState([]);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);

  const markdown = planData?.generatedStudyPlan || '';
  const lessonTitle = planData?.lessonId?.title || 'Unknown Lesson';
  const lessonId = planData?.lessonId?._id || planData?.lessonId || '';
  const studentId = user?.username || planData?.studentId || 'student';
  const studentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Student';

  // Use robust semantic parser
  const parsedData = parseStudyPlan(markdown, planData?.diagnosticScore);
  const score = (parsedData.score !== null && parsedData.score !== undefined && parsedData.score > 0)
    ? parsedData.score
    : (planData?.diagnosticScore ?? 0);

  useEffect(() => {
    if (!lessonId) return;
    fetchFollowUpQuizData();
  }, [lessonId]);

  const fetchFollowUpQuizData = async () => {
    try {
      setIsLoadingFollowUp(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/followup/lesson/${lessonId}?studentId=${encodeURIComponent(studentId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFollowUpQuizData(data.quiz);
        setFollowUpCompleted(data.completed);
        setFollowUpResult(data.pastResult);
        if (data.moduleBreakdown) {
          setModuleBreakdown(data.moduleBreakdown);
        }
      }
    } catch (err) {
      console.error('Error fetching follow-up quiz data:', err);
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  const handleStartFollowUpQuiz = () => {
    setShowQuizModal(true);
  };

  const handleQuizCompleted = (result) => {
    setFollowUpCompleted(true);
    setFollowUpResult(result);
  };

  // Front cover + 5 Clear, Distinct Chapters
  const pages = [
    {
      component: (
        <CoverPage
          user={user}
          lessonTitle={lessonTitle}
          score={score}
          dateGenerated={planData?.createdAt}
          onStart={() => setCurrentPage(1)}
        />
      ),
      title: "Cover Overview",
      isCover: true
    },
    { 
      component: (
        <PerformancePage 
          score={score} 
          summaryText={parsedData.performanceAnalysisText || parsedData.profileText} 
          weakText={parsedData.weakConceptsText}
          lessonTitle={lessonTitle}
          user={user}
        />
      ), 
      title: "Learning Profile" 
    },
    { 
      component: (
        <WrongQuestionAnalysisPage 
          questions={parsedData.mistakeQuestions} 
          rawMistakesText={parsedData.mistakesText} 
        />
      ), 
      title: "My Mistakes" 
    },
    { 
      component: (
        <StudyNotesPage 
          notesText={parsedData.studyNotesText} 
          definitionsText={parsedData.definitionsText}
          definitions={parsedData.definitions}
        />
      ), 
      title: "Study Notes & Definitions" 
    },
    { 
      component: (
        <RevisionChecklistPage 
          revisionText={parsedData.checklistText} 
          checklistItems={parsedData.checklistItems} 
          scheduleText={parsedData.scheduleText}
          studentId={studentId} 
          lessonId={lessonId} 
        />
      ), 
      title: "Revision Tasks & Schedule" 
    },
    {
      component: (
        <MotivationPage
          motivationText={parsedData.motivationText}
          user={user}
          followUpQuizData={followUpQuizData}
          followUpCompleted={followUpCompleted}
          followUpResult={followUpResult}
          moduleBreakdown={moduleBreakdown}
          onStartFollowUpQuiz={handleStartFollowUpQuiz}
          isLoadingFollowUp={isLoadingFollowUp}
        />
      ),
      title: "Follow-Up Assessment"
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const totalChapters = 5;
  const progressPercentage = currentPage === 0 ? 0 : (currentPage / totalChapters) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-20 relative font-sans">

      {/* Book Header / Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Personalized Study Book</h2>
          <span className="text-xs text-slate-400 font-normal">Step-by-step diagnostic revision guide</span>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full">
            {currentPage === 0
              ? 'Study Book Cover · Overview'
              : `Chapter ${currentPage} of ${totalChapters} · ${pages[currentPage]?.title || ''}`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Page Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] min-h-[540px] flex flex-col relative overflow-hidden transition-all duration-300 border border-slate-200/80">

        {/* Page Content with simple fade-in keyframe animation class */}
        <div className="flex-1 animate-fade-in relative z-10" key={currentPage}>
          {pages[currentPage]?.component}
        </div>

        {/* Page Footer Navigation */}
        <div className="mt-10 pt-5 border-t border-slate-100 flex items-center justify-between z-10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border border-slate-200 cursor-pointer ${
              currentPage === 0
                ? 'opacity-0 cursor-default pointer-events-none'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white'
            }`}
          >
            <FaChevronLeft className="text-xs" />
            Previous: {currentPage === 1 ? 'Cover Overview' : (currentPage > 1 ? pages[currentPage - 1]?.title : '')}
          </button>

          <div className="hidden md:block text-slate-400 font-medium text-xs tracking-wider">
            {currentPage === 0 ? 'Study Book Cover' : `Chapter ${currentPage} of ${totalChapters} · ${pages[currentPage]?.title || ''}`}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border-none cursor-pointer ${
              currentPage === pages.length - 1
                ? 'opacity-0 cursor-default pointer-events-none'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
            }`}
          >
            {currentPage === 0
              ? 'Open Chapter 1: Learning Profile'
              : currentPage < pages.length - 1
                ? `Next: ${pages[currentPage + 1]?.title || 'Next'}`
                : 'Completed'}
            <FaChevronRight className="text-xs" />
          </button>
        </div>

      </div>

      {/* Follow-Up Quiz Runner Modal */}
      {showQuizModal && (
        <FollowUpQuizModal
          quizData={followUpQuizData}
          studentId={studentId}
          studentName={studentName}
          lessonId={lessonId}
          onClose={() => setShowQuizModal(false)}
          onQuizCompleted={handleQuizCompleted}
        />
      )}

      {/* CSS for simple fade in */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
