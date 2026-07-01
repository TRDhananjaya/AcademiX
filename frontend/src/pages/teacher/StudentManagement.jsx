import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { FiUserPlus, FiEdit, FiSearch, FiSliders, FiUsers, FiCheckCircle, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';

export default function StudentManagement() {
  const [activeNav, setActiveNav] = useState('students');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const gradeFilter = 'All Grades';
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentMobile: '',
    parentMobile: '',
    grade: 'Grade 10',
    status: 'Active',
    username: '',
    password: '',
    _id: null
  });

  const [successStudentDetails, setSuccessStudentDetails] = useState(null);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (newStudent._id || !newStudent.username.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsUsernameTaken(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`/api/users/check-username/${encodeURIComponent(newStudent.username.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setIsUsernameTaken(data.exists);
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [newStudent.username, newStudent._id]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, []);

  // Handlers
  const handleEditStudent = (student) => {
    setNewStudent({
      name: student.name,
      email: student.email,
      studentMobile: student.studentMobile,
      parentMobile: student.parentMobile,
      grade: student.grade,
      status: student.status,
      username: '',
      password: '',
      _id: student._id
    });
    setIsModalOpen(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.studentMobile.trim() || !newStudent.parentMobile.trim()) return;

    try {
      const url = newStudent._id ? `/api/students/${newStudent._id}` : '/api/students';
      const method = newStudent._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        const data = await response.json();
        if (newStudent._id) {
          setStudents(students.map(s => s._id === data._id ? data : s));
        } else {
          setStudents([data, ...students]);
          setSuccessStudentDetails({
            name: data.name,
            email: data.email,
            studentId: data.studentId,
            username: newStudent.username.trim() || data.studentId.toLowerCase(),
            password: newStudent.password.trim() || `${data.studentId.toLowerCase()}123`,
            studentMobile: data.studentMobile,
            parentMobile: data.parentMobile,
            grade: data.grade,
            status: data.status
          });
        }
        setIsModalOpen(false);
        setNewStudent({
          name: '',
          email: '',
          studentMobile: '',
          parentMobile: '',
          grade: 'Grade 10',
          status: 'Active',
          username: '',
          password: '',
          _id: null
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving student');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error connecting to server');
    }
  };

  const filteredStudents = students.filter(student => {
    const name = student.name || '';
    const email = student.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All Grades' || student.grade === gradeFilter;
    const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Calculate stats
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const atRiskCount = students.filter(s => s.status === 'At Risk').length;
  const inactiveCount = students.filter(s => s.status === 'Inactive').length;

  const handleCopyCredentials = () => {
    if (!successStudentDetails) return;
    const text = `Student ID / Username: ${successStudentDetails.username}\nPassword: ${successStudentDetails.password}`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="teacher-students-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />

        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Student Management</h1>
              <p className="text-slate-500 text-base">
                View, search, add, and manage students enrolled in your courses.
              </p>
            </div>

            <button
              onClick={() => {
                setNewStudent({ name: '', email: '', studentMobile: '', parentMobile: '', grade: 'Grade 10', status: 'Active', username: '', password: '', _id: null });
                setIsModalOpen(true);
              }}
              className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <FiUserPlus className="w-4.5 h-4.5" />
              Add Student
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FiUsers className="w-5.5 h-5.5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Students</span>
                <h3 className="text-3xl font-extrabold text-teal-600 mt-2">{activeCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-5.5 h-5.5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">At-Risk Status</span>
                <h3 className="text-3xl font-extrabold text-red-600 mt-2">{atRiskCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5.5 h-5.5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inactive Students</span>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-2">{inactiveCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FiBookOpen className="w-5.5 h-5.5" />
              </div>
            </div>

          </div>

          {/* Search, Filters and Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Filters Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                />
                <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                  <FiSliders className="w-4 h-4" /> Filter By
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>At Risk</option>
                  <option>Suspended</option>
                  <option>Inactive</option>
                </select>
              </div>

            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                    <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment Date</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/40 transition-colors">

                        {/* Name & Avatar */}
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${student.color || 'bg-indigo-500'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                            {student.initials || (student.name ? student.name.charAt(0).toUpperCase() : '?')}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{student.name || 'Unknown Student'}</span>
                        </td>

                        {/* Email */}
                        <td className="p-4 text-slate-600 text-sm">{student.email || 'N/A'}</td>

                        {/* Grade */}
                        <td className="p-4 text-slate-700 text-sm font-medium">{student.grade || 'N/A'}</td>

                        {/* Enrollment Date */}
                        <td className="p-4 text-slate-500 text-sm">{student.enrolled ? new Date(student.enrolled).toISOString().split('T')[0] : 'N/A'}</td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider
                            ${student.status === 'Active' ? 'bg-teal-50 text-teal-600' : ''}
                            ${student.status === 'At Risk' ? 'bg-red-50 text-red-500' : ''}
                            ${student.status === 'Suspended' ? 'bg-orange-50 text-orange-600' : ''}
                            ${student.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : ''}
                          `}>
                            {student.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-2 bg-transparent border-none text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer inline-flex items-center"
                            title="Edit Student"
                          >
                            <FiEdit className="w-4.5 h-4.5" />
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400 font-medium text-sm">
                        No students found matching filters or search queries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Add Student Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <h3 className="text-lg font-bold text-slate-900">{newStudent._id ? 'Edit Student' : 'Add New Student'}</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-lg bg-transparent border-none cursor-pointer p-1"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleAddStudent} className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {!newStudent._id && (
                      <>


                        {/* Username */}
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Username</label>
                          <input
                            type="text"
                            placeholder="e.g. johndoe10"
                            value={newStudent.username}
                            onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-sans ${newStudent.username.trim() && !isCheckingUsername
                              ? isUsernameTaken
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-teal-300 focus:border-teal-400'
                              : 'border-slate-200 focus:border-indigo-300'
                              }`}
                          />
                          {isCheckingUsername && (
                            <span className="text-xs text-slate-400 mt-1 block">Checking availability...</span>
                          )}
                          {!isCheckingUsername && newStudent.username.trim() !== '' && isUsernameTaken && (
                            <span className="text-xs text-red-500 font-semibold mt-1 block">⚠️ Username is already taken!</span>
                          )}
                          {!isCheckingUsername && newStudent.username.trim() !== '' && !isUsernameTaken && (
                            <span className="text-xs text-teal-600 font-semibold mt-1 block">✅ Username is available!</span>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Password</label>
                          <input
                            type="password"
                            placeholder="e.g. secretpassword"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                          />
                        </div>
                      </>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                        required
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. john.doe@university.edu"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                        required
                      />
                    </div>

                    {/* Student Mobile */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Student Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +1234567890"
                        value={newStudent.studentMobile}
                        onChange={(e) => setNewStudent({ ...newStudent, studentMobile: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                        required
                      />
                    </div>

                    {/* Parent Mobile */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Parent Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +1987654321"
                        value={newStudent.parentMobile}
                        onChange={(e) => setNewStudent({ ...newStudent, parentMobile: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                        required
                      />
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Grade</label>
                      <input
                        type="text"
                        value="Grade 10"
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 font-sans cursor-not-allowed font-semibold"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Status</label>
                      <select
                        value={newStudent.status}
                        onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans cursor-pointer bg-white"
                      >
                        <option>Active</option>
                        <option>At Risk</option>
                        <option>Suspended</option>
                        <option>Inactive</option>
                      </select>
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={(!newStudent._id && (isUsernameTaken || isCheckingUsername))}
                      className={`font-semibold py-2 px-5 rounded-xl text-sm transition-all ${(!newStudent._id && (isUsernameTaken || isCheckingUsername))
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#3b28cc] hover:bg-indigo-700 text-white cursor-pointer'
                        }`}
                    >
                      {newStudent._id ? 'Save Changes' : 'Add Student'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* Success Student Registered Modal */}
          {successStudentDetails && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col gap-5">

                {/* Header/Icon */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Student Registered Successfully</h3>
                  <p className="text-slate-400 text-xs leading-normal">
                    Student has been added to AcademiX and their LMS portal account is ready.
                  </p>
                </div>

                {/* Details Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm space-y-3.5 font-sans">

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Full Name</span>
                    <span className="font-bold text-slate-800">{successStudentDetails.name}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Student ID</span>
                    <span className="font-mono text-xs bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-bold">{successStudentDetails.studentId}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">LMS Username</span>
                    <span className="font-bold text-slate-800">{successStudentDetails.username}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">LMS Password</span>
                    <span className="font-mono bg-indigo-50 px-2.5 py-0.5 rounded text-indigo-700 font-bold border border-indigo-100">{successStudentDetails.password}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Email</span>
                    <span className="text-slate-600 font-medium">{successStudentDetails.email}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Mobile Numbers</span>
                    <span className="text-slate-600 font-medium">S: {successStudentDetails.studentMobile} • P: {successStudentDetails.parentMobile}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-semibold uppercase">Grade & Status</span>
                    <span className="text-slate-700 font-bold">{successStudentDetails.grade} — {successStudentDetails.status}</span>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex-1 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-[#3b28cc] text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Copy Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccessStudentDetails(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[#3b28cc] hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Done
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
