import { useState } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAward, FiPlus, FiGrid, FiBell, FiTrash2, FiBookOpen } from 'react-icons/fi';
import { TbMessageReport, TbSchool } from 'react-icons/tb';

export default function ProfileSettings() {
  const [activeNav, setActiveNav] = useState('dashboard'); // Keeps dashboard highlit or default
  
  // Fields state
  const [fullName, setFullName] = useState('Alex Smith');
  const [email, setEmail] = useState('alex.smith@university.edu');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState(['Computer Science', 'Machine Learning', 'Data Ethics']);

  // Toggles state
  const [quizNotifications, setQuizNotifications] = useState(true);
  const [studyPlanNotifications, setStudyPlanNotifications] = useState(true);
  const [communityNotifications, setCommunityNotifications] = useState(false);

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter((s) => s !== subjectToRemove));
  };

  const handleAddSubject = () => {
    const newSubject = prompt('Enter a new subject of interest:');
    if (newSubject && newSubject.trim() !== '') {
      setSubjects([...subjects, newSubject.trim()]);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert('Changes saved successfully!');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile Settings</h1>
            <p className="text-slate-500 text-base">
              Manage your account, preferences, and view achievements.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column - Profile Details & Badges */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center pb-6">
                <div className="w-full h-24 bg-indigo-100/70"></div>
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop" 
                      alt="Alex Smith" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 mb-1">Alex Smith</h2>
                <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-4">Student</span>
                
                <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <TbSchool className="text-slate-500 w-4.5 h-4.5" />
                  <span className="text-slate-600 text-xs font-semibold">Undergraduate - Level 3</span>
                </div>
              </div>

              {/* Achievement Badges Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FiAward className="text-indigo-600 w-5 h-5" /> Achievement Badges
                </h3>
                
                <div className="grid grid-cols-3 gap-y-6 gap-x-2 text-center">
                  
                  {/* Badge 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-1.5 text-indigo-600 hover:scale-105 transition-transform cursor-pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 17 6.5 17 11.5C17 14.5 14.7 17 12 17C9.3 17 7 14.5 7 11.5C7 6.5 12 2 12 2Z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">7-Day</span>
                    <span className="text-[10px] text-slate-400 block">Streak</span>
                  </div>

                  {/* Badge 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-1.5 text-teal-600 hover:scale-105 transition-transform cursor-pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-8h-2v3H8v2h3v3h2v-3h3v-2h-3v-3z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">AI Master</span>
                  </div>

                  {/* Badge 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-1.5 text-purple-600 hover:scale-105 transition-transform cursor-pointer">
                      <FiBookOpen className="w-5 height-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">Fast Reader</span>
                  </div>

                  {/* Locked Badge */}
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-1.5 text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">Top 10%</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column - Inputs & Preferences */}
            <div className="flex-1 space-y-6">
              
              {/* Account Fields Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-2">Full Name</label>
                      <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-[11px_16px] border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                        <FiUser className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-2">Email Address</label>
                      <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-[11px_16px] border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                        <FiMail className="text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="max-w-md">
                    <label className="block text-slate-400 text-xs font-semibold uppercase mb-2">Password</label>
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-[11px_16px] border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                      <FiLock className="text-slate-400 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Save Changes button container */}
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>

                </form>
              </div>

              {/* Academic Preferences Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Academic Preferences</h3>
                  
                  {/* Subjects of Interest */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                      Subjects of Interest
                    </h4>

                    <div className="flex flex-wrap items-center gap-2">
                      {subjects.map((subject) => (
                        <div 
                          key={subject}
                          className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium"
                        >
                          {subject}
                          <button 
                            onClick={() => handleRemoveSubject(subject)}
                            className="text-slate-400 hover:text-red-500 font-bold transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={handleAddSubject}
                        className="border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 hover:text-indigo-800 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-lg px-3 py-1.5 flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Add Subject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-5 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FiBell className="text-purple-600 w-4.5 h-4.5" /> Notification Settings
                  </h4>

                  <div className="space-y-4">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Quiz Results</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Get notified when your AI graded quizzes are ready.</p>
                      </div>
                      <button 
                        onClick={() => setQuizNotifications(!quizNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center
                          ${quizNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm absolute mx-0.5 transition-transform"></span>
                        {quizNotifications && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 absolute left-2"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Toggle 2 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Study Plan Reminders</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Daily nudges based on your AI generated schedule.</p>
                      </div>
                      <button 
                        onClick={() => setStudyPlanNotifications(!studyPlanNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center
                          ${studyPlanNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm absolute mx-0.5 transition-transform"></span>
                        {studyPlanNotifications && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 absolute left-2"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Community Alerts</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Updates from study groups and forums.</p>
                      </div>
                      <button 
                        onClick={() => setCommunityNotifications(!communityNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center
                          ${communityNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm absolute mx-0.5 transition-transform"></span>
                        {communityNotifications && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 absolute left-2"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
