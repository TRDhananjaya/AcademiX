import { useState } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAward, FiPlus, FiBell } from 'react-icons/fi';
import { TbSchool, TbCertificate } from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/authService';

export default function TeacherProfileSettings() {
  const { user, setUser } = useAuth();
  const [activeNav, setActiveNav] = useState('profile');

  // Fields state
  const [fullName, setFullName] = useState(() => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    }
    return '';
  });
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // New password
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm new password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate password fields if filled
    if (password || confirmPassword) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    // Split full name into first and last name
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const payload = {
      firstName,
      lastName,
      email,
      profilePicture,
    };

    // Only send password if user entered a new one
    if (password && password.trim() !== '') {
      payload.password = password;
    }

    try {
      const res = await updateProfile(payload);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      // Update AuthContext user state & localStorage
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess(true);
      setPassword(''); // clear password field
      setConfirmPassword(''); // clear confirm password field
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('An unexpected error occurred while saving profile changes.');
    }
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
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative group">
                    <img
                      src={profilePicture || 'https://i.pravatar.cc/150?img=47'}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-1">{fullName}</h2>
                <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-4">Teacher</span>

                <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <TbSchool className="text-slate-500 w-4.5 h-4.5" />
                  <span className="text-slate-600 text-xs font-semibold">INSTRUCTOR - ICT</span>
                </div>
              </div>


            </div>

            {/* Right Column - Inputs & Preferences */}
            <div className="flex-1 space-y-6">

              {/* Account Fields Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold text-center animate-shake">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-semibold text-center animate-fade-in-up">
                      ✓ Profile changes saved successfully!
                    </div>
                  )}

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

                  {/* Password section with double fields */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-slate-400">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* New Password */}
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold uppercase mb-2">New Password</label>
                        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-[11px_16px] border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                          <FiLock className="text-slate-400 shrink-0" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans"
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

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold uppercase mb-2">Confirm New Password</label>
                        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-[11px_16px] border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                          <FiLock className="text-slate-400 shrink-0" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="border-none outline-none bg-transparent text-[14px] text-slate-800 w-full font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
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






            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
