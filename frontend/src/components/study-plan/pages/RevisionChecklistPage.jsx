import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaCheckCircle, FaRegCircle, FaListAlt } from 'react-icons/fa';

const RevisionChecklistPage = ({ 
  revisionText = '', 
  checklistItems = [],
  studentId = 'student',
  lessonId = 'lesson'
}) => {
  const storageKey = `academix_checklist_${studentId}_${lessonId}`;

  const [checkedMap, setCheckedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedMap));
    } catch (e) {
      console.error(e);
    }
  }, [checkedMap, storageKey]);

  const toggleCheck = (id) => {
    setCheckedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // If revisionText contains leaked PERSONAL PERFORMANCE ANALYSIS, clean it up
  const cleanRevision = revisionText
    ? revisionText.replace(/^[#\s]*\d*\.?\s*PERSONAL REVISION CHECKLIST\s*/i, '').trim()
    : '';

  // Parse items from cleanRevision if checklistItems is empty
  const parsedItems = checklistItems.length > 0 ? checklistItems : (() => {
    const list = [];
    if (cleanRevision && !cleanRevision.includes('PERSONAL PERFORMANCE ANALYSIS')) {
      const lines = cleanRevision.split('\n');
      for (const line of lines) {
        const match = line.match(/^(?:[☐☑✓\-\*]|\[\s*\]|\d+\.)\s+(.+)$/);
        if (match && match[1].trim().length > 3) {
          const t = match[1].replace(/^\*\*|\*\*$/g, '').trim();
          list.push({
            id: t.slice(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '_'),
            title: t
          });
        }
      }
    }
    return list.length > 0 ? list : [
      { id: 'item_1', title: 'Review key characteristics of quality information' },
      { id: 'item_2', title: 'Understand difference between data and information' },
      { id: 'item_3', title: 'Examine input, processing, output, and feedback loops in systems' },
      { id: 'item_4', title: 'Memorize hardware vs. software classifications' },
      { id: 'item_5', title: 'Take the adaptive follow-up quiz to verify improvement' }
    ];
  })();

  const completedCount = parsedItems.filter(it => checkedMap[it.id]).length;
  const progressPercent = parsedItems.length > 0 ? Math.round((completedCount / parsedItems.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Chapter Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Chapter 4 of 5 · Revision Tasks & Schedule
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Revision Checklist
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Tick off each core concept as you master it to track your exam readiness.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-200/80 shrink-0">
          <div className="text-sm font-bold text-indigo-700">{progressPercent}%</div>
          <div className="text-xs text-slate-500 font-normal">
            {completedCount} of {parsedItems.length} Mastered
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Interactive Checklist Cards */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs overflow-y-auto space-y-3">
        {parsedItems.map((item, idx) => {
          const isDone = !!checkedMap[item.id];
          return (
            <div
              key={item.id || idx}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isDone 
                  ? 'bg-emerald-50/40 border-emerald-200/90 text-emerald-900'
                  : 'bg-white hover:bg-slate-50/70 border-slate-200/70 text-slate-700'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-base transition-transform shrink-0"
                aria-label={isDone ? "Mark as uncompleted" : "Mark as completed"}
              >
                {isDone ? (
                  <FaCheckCircle className="text-emerald-500" />
                ) : (
                  <FaRegCircle className="text-slate-300 hover:text-indigo-400" />
                )}
              </button>

              <div className="flex-1">
                <span className={`text-sm leading-relaxed ${
                  isDone ? 'line-through text-slate-400 font-normal' : 'font-medium text-slate-800'
                }`}>
                  {item.title}
                </span>
              </div>
            </div>
          );
        })}

        {progressPercent === 100 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center mt-4">
            ✓ All checklist items completed! Proceed to the Chapter 5 Follow-Up Quiz!
          </div>
        )}
      </div>

      {/* 3-Day Action Timeline */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
          <FaListAlt className="text-indigo-500" />
          <span>Recommended 3-Day Revision Roadmap</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Day 1</span>
            <h5 className="text-xs font-semibold text-slate-800">Review Mistakes</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Examine Chapter 2 explanations and traps.</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Day 2</span>
            <h5 className="text-xs font-semibold text-slate-800">Master Notes & Terms</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Study Chapter 3 principles and definitions.</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Day 3</span>
            <h5 className="text-xs font-semibold text-slate-800">Verify Mastery</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Take the Chapter 5 Adaptive Assessment.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RevisionChecklistPage;
