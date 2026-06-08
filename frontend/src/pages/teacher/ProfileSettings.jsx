import { useState } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAward, FiPlus, FiBell } from 'react-icons/fi';
import { TbSchool, TbCertificate } from 'react-icons/tb';

export default function TeacherProfileSettings() {
  const [activeNav, setActiveNav] = useState('profile');

  // Fields state
  const [fullName, setFullName] = useState('Dr. Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@university.edu');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);

  // Courses state
  const [courses, setCourses] = useState(['Advanced Mathematics', 'Computer Science 101', 'Calculus 101']);

  // Toggles state
  const [quizNotifications, setQuizNotifications] = useState(true);
  const [flagNotifications, setFlagNotifications] = useState(true);
  const [boardNotifications, setBoardNotifications] = useState(false);

  const handleRemoveCourse = (courseToRemove) => {
    setCourses(courses.filter((c) => c !== courseToRemove));
  };

  const handleAddCourse = () => {
    const newCourse = prompt('Enter a new course to manage:');
    if (newCourse && newCourse.trim() !== '') {
      setCourses([...courses, newCourse.trim()]);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert('Profile changes saved successfully!');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="teacher-profile-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile Settings</h1>
            <p className="text-slate-500 text-base">
              Manage your teacher account, class preferences, and view instructor achievements.
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
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop" 
                      alt="Dr. Sarah Jenkins" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 mb-1">Dr. Sarah Jenkins</h2>
                <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-4">Instructor</span>
                
                <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <TbSchool className="text-slate-500 w-4.5 h-4.5" />
                  <span className="text-slate-600 text-xs font-semibold">Department Head - ICT</span>
                </div>
              </div>

              {/* Instructor Badges Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FiAward className="text-indigo-600 w-5 h-5" /> Educator Badges
                </h3>
                
                <div className="grid grid-cols-3 gap-y-6 gap-x-2 text-center">
                  
                  {/* Badge 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-1.5 text-indigo-600 hover:scale-105 transition-transform cursor-pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 17 6.5 17 11.5C17 14.5 14.7 17 12 17C9.3 17 7 14.5 7 11.5C7 6.5 12 2 12 2Z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">AI Integrator</span>
                  </div>

                  {/* Badge 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-1.5 text-teal-600 hover:scale-105 transition-transform cursor-pointer">
                      <TbCertificate className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">Top Educator</span>
                  </div>

                  {/* Badge 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-1.5 text-purple-600 hover:scale-105 transition-transform cursor-pointer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block leading-tight">Active Mentor</span>
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
                          className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans"
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
                          className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans"
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
                        className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Save Changes button container */}
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>

                </form>
              </div>

              {/* Academic Preferences Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Class Management</h3>
                  
                  {/* Courses Managed */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                      Assigned Courses
                    </h4>

                    <div className="flex flex-wrap items-center gap-2">
                      {courses.map((course) => (
                        <div 
                          key={course}
                          className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium"
                        >
                          {course}
                          <button 
                            onClick={() => handleRemoveCourse(course)}
                            className="text-slate-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={handleAddCourse}
                        className="border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 hover:text-indigo-800 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-lg px-3 py-1.5 flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Add Course
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-5 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FiBell className="text-purple-600 w-4.5 h-4.5" /> Alert Settings
                  </h4>

                  <div className="space-y-4">
                    {/* Toggle 1 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Quiz Submissions</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Get notified when a student completes a quiz.</p>
                      </div>
                      <button 
                        onClick={() => setQuizNotifications(!quizNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center cursor-pointer
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
                        <h5 className="text-sm font-bold text-slate-800">Community Moderation Flags</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Get notified immediately when student posts are flagged.</p>
                      </div>
                      <button 
                        onClick={() => setFlagNotifications(!flagNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center cursor-pointer
                          ${flagNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm absolute mx-0.5 transition-transform"></span>
                        {flagNotifications && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 absolute left-2"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Toggle 3 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Faculty Board Announcements</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Receive digests and updates from the faculty department.</p>
                      </div>
                      <button 
                        onClick={() => setBoardNotifications(!boardNotifications)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative flex items-center cursor-pointer
                          ${boardNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm absolute mx-0.5 transition-transform"></span>
                        {boardNotifications && (
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
