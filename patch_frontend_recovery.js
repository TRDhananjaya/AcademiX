const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/student/StudyPlans.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add State
const targetState = `  const [selectedLessonId, setSelectedLessonId] = useState('');`;
const replacementState = `  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState(null);`;
code = code.replace(targetState, replacementState);

// 2. Add handleRecoverMissingPlans function
const targetFunction = `  const filteredPlans = selectedLessonId
    ? studyPlans.filter(plan => plan.lessonId && plan.lessonId._id === selectedLessonId)
    : studyPlans;`;
const replacementFunction = `  const handleRecoverMissingPlans = async () => {
    if (isRecovering) return;
    
    setIsRecovering(true);
    setRecoveryMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/study-plans/recover-missing', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 429) {
         setRecoveryMessage({
           type: 'error',
           text: 'Study Plan generation is temporarily unavailable because the AI service usage limit has been reached. Your quiz results are safely saved. Please try generating the missing Study Plan later.'
         });
         return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.generatedPlans > 0) {
          setRecoveryMessage({
            type: 'success',
            text: \`Missing Study Plan generation has started for \${data.generatedPlans} lesson(s). Please refresh in a moment to view them.\`
          });
        } else if (data.completedLessons === 0) {
          setRecoveryMessage({
            type: 'info',
            text: 'No completed lessons are currently eligible for Study Plan generation.'
          });
        } else {
          setRecoveryMessage({
            type: 'info',
            text: 'All completed lessons already have Study Plans.'
          });
        }
      } else {
        throw new Error(data.message || 'Failed to recover study plans');
      }
      
    } catch (error) {
      console.error('Error recovering study plans:', error);
      setRecoveryMessage({
        type: 'error',
        text: 'An error occurred while checking for missing study plans. Please try again later.'
      });
    } finally {
      setIsRecovering(false);
      // Refetch to pull down any newly ready plans
      await fetchStudyPlans();
    }
  };

  const filteredPlans = selectedLessonId
    ? studyPlans.filter(plan => plan.lessonId && plan.lessonId._id === selectedLessonId)
    : studyPlans;`;
code = code.replace(targetFunction, replacementFunction);

// 3. Add Button and Message to UI
const targetUI = `            {studyPlans.length > 0 && (
              <div className="min-w-[200px]">`;
const replacementUI = `            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <button
                onClick={handleRecoverMissingPlans}
                disabled={isRecovering}
                className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all \${
                  isRecovering 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }\`}
              >
                {isRecovering ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Missing Plans...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Generate Missing Study Plans
                  </>
                )}
              </button>

              {studyPlans.length > 0 && (
                <div className="min-w-[200px]">`;
code = code.replace(targetUI, replacementUI);

// 4. Add the recovery message block
const targetMessageUI = `          <div className="w-full">
            
            {loading ? (`;
const replacementMessageUI = `          {recoveryMessage && (
            <div className={\`mb-6 p-4 rounded-xl border flex items-start gap-3 \${
              recoveryMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
              recoveryMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              'bg-blue-50 border-blue-100 text-blue-700'
            }\`}>
              <div className="mt-0.5">
                {recoveryMessage.type === 'error' && (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                {recoveryMessage.type === 'success' && (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                {recoveryMessage.type === 'info' && (
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
              </div>
              <p className="text-sm font-medium leading-relaxed">{recoveryMessage.text}</p>
            </div>
          )}

          <div className="w-full">
            
            {loading ? (`;
code = code.replace(targetMessageUI, replacementMessageUI);

fs.writeFileSync(filePath, code);
console.log('Patched successfully');
