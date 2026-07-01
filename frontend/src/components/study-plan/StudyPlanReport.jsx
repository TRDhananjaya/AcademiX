import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import StudyPlanHeader from './StudyPlanHeader';
import PerformanceCard from './PerformanceCard';
import FocusTopicsCard from './FocusTopicsCard';
import StudyNotesCard from './StudyNotesCard';
import PracticeQuizCard from './PracticeQuizCard';
import StudyScheduleCard from './StudyScheduleCard';

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
  const [pdfMode, setPdfMode] = useState(false);
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

  const extractionFailed = !performanceSummary && !studyNotes && !practiceQuiz;
  const score = extractScoreFromText(markdown);
  const reportId = `report-${planData._id}`;

  return (
    <div className={`w-full max-w-5xl mx-auto mb-16 relative ${pdfMode ? 'pdf-mode' : ''}`}>
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800">Your Generated Report</h2>
      </div>

      {/* The Printable / Downloadable Container */}
      <div id={reportId} className={`bg-white rounded-none sm:rounded-[40px] p-4 sm:p-10 shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] print-container ${pdfMode ? '!p-2 !shadow-none' : ''}`}>
        
        <div className="pdf-section mb-8">
          <StudyPlanHeader 
            user={user} 
            lessonTitle={planData.lessonId?.title || 'Unknown Lesson'} 
            dateGenerated={planData.createdAt} 
            score={score} 
          />
        </div>

        {extractionFailed ? (
          <div className="pdf-section prose prose-indigo max-w-none p-6">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            <div className="pdf-section grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceCard score={score} summaryText={performanceSummary} />
              <FocusTopicsCard strongText={strongConcepts} weakText={weakConcepts} />
            </div>

            <div className="pdf-section">
              <StudyNotesCard 
                notesText={studyNotes} 
                definitionsText={keyDefinitions} 
                revisionText={revisionPoints} 
              />
            </div>

            <div className="pdf-section">
              <PracticeQuizCard quizText={practiceQuiz} />
            </div>

            <div className="pdf-section">
              <StudyScheduleCard 
                scheduleText={studySchedule} 
                motivationText={finalMotivation} 
              />
            </div>
            
          </div>
        )}

        {/* Report Footer */}
        <div className="pdf-section mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-lg pb-0.5">
              A
            </div>
            <span>AcademiX AI Learning Assistant</span>
          </div>
          <div>
            Generated on {new Date(planData.createdAt).toLocaleDateString()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudyPlanReport;
