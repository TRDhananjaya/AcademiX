import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { FiUserPlus, FiEdit, FiSearch, FiSliders, FiUsers, FiCheckCircle, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';

export default function StudentManagement() {
  const [activeNav, setActiveNav] = useState('students');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentMobile: '',
    parentMobile: '',
    grade: 'Grade 11',
    status: 'Active',
    _id: null
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Handlers
  const handleEditStudent = (student) => {
    setNewStudent({
      name: student.name,
      email: student.email,
      studentMobile: student.studentMobile,
      parentMobile: student.parentMobile,
      grade: student.grade,
      status: student.status,
      _id: student._id
    });
    setIsModalOpen(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.studentMobile.trim() || !newStudent.parentMobile.trim()) return;

    try {
      const url = newStudent._id ? `http://localhost:5000/api/students/${newStudent._id}` : 'http://localhost:5000/api/students';
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
        }
        setIsModalOpen(false);
        setNewStudent({
          name: '',
          email: '',
          studentMobile: '',
          parentMobile: '',
          grade: 'Grade 11',
          status: 'Active',
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
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All Grades' || student.grade === gradeFilter;
    const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Calculate stats
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const atRiskCount = students.filter(s => s.status === 'At Risk').length;
  const inactiveCount = students.filter(s => s.status === 'Inactive').length;

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
                setNewStudent({ name: '', email: '', studentMobile: '', parentMobile: '', grade: 'Grade 11', status: 'Active', _id: null });
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
                
                {/* Grade Filter */}
                <select 
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all cursor-pointer"
                >
                  <option>All Grades</option>
                  {/* Additional grades (Grade 6 to 10) can be added here easily */}
                  <option>Grade 11</option>
                </select>

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
                          <div className={`w-9 h-9 rounded-full ${student.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                            {student.initials}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                        </td>

                        {/* Email */}
                        <td className="p-4 text-slate-600 text-sm">{student.email}</td>

                        {/* Grade */}
                        <td className="p-4 text-slate-700 text-sm font-medium">{student.grade}</td>

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
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{newStudent._id ? 'Edit Student' : 'Add New Student'}</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-lg bg-transparent border-none cursor-pointer p-1"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleAddStudent}>
                  <div className="p-6 space-y-4">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
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
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
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
                        onChange={(e) => setNewStudent({...newStudent, studentMobile: e.target.value})}
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
                        onChange={(e) => setNewStudent({...newStudent, parentMobile: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                        required
                      />
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Grade</label>
                      <select 
                        value={newStudent.grade}
                        onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans cursor-pointer bg-white"
                      >
                        {/* Additional grades (Grade 6 to 10) can be added here easily */}
                        <option>Grade 11</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Status</label>
                      <select 
                        value={newStudent.status}
                        onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
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
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      {newStudent._id ? 'Save Changes' : 'Add Student'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
