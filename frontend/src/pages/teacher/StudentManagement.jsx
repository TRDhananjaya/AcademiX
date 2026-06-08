import { useState } from 'react';
import Sidebar from '../../components/common/teacher/Sidebar';
import TopBar from '../../components/dashboard/TopBar';
import { FiUserPlus, FiTrash2, FiSearch, FiSliders, FiUsers, FiCheckCircle, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';

const initialStudents = [
  { id: 1, name: 'Alice Smith', email: 'alice.smith@university.edu', level: 'Level 3', enrolled: '2024-09-01', status: 'Active', initials: 'AS', color: 'bg-teal-500' },
  { id: 2, name: 'Bob Johnson', email: 'bob.johnson@university.edu', level: 'Level 2', enrolled: '2025-01-15', status: 'At Risk', initials: 'BJ', color: 'bg-red-500' },
  { id: 3, name: 'Clara Oswald', email: 'clara.o@university.edu', level: 'Level 3', enrolled: '2024-09-01', status: 'Active', initials: 'CO', color: 'bg-indigo-500' },
  { id: 4, name: 'David Miller', email: 'd.miller@university.edu', level: 'Level 1', enrolled: '2025-05-10', status: 'Active', initials: 'DM', color: 'bg-purple-500' },
  { id: 5, name: 'Emma Watson', email: 'emma.w@university.edu', level: 'Level 2', enrolled: '2025-01-20', status: 'Suspended', initials: 'EW', color: 'bg-amber-500' },
  { id: 6, name: 'Frank Castle', email: 'f.castle@university.edu', level: 'Level 3', enrolled: '2024-09-05', status: 'Active', initials: 'FC', color: 'bg-slate-500' }
];

export default function StudentManagement() {
  const [activeNav, setActiveNav] = useState('students');
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    level: 'Level 1',
    status: 'Active'
  });

  // Handlers
  const handleDeleteStudent = (id, name) => {
    if (window.confirm(`Are you sure you want to remove student "${name}" from the system?`)) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim()) return;

    const names = newStudent.name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const studentToAdd = {
      id: Date.now(),
      name: newStudent.name,
      email: newStudent.email,
      level: newStudent.level,
      enrolled: new Date().toISOString().split('T')[0],
      status: newStudent.status,
      initials: initials || 'ST',
      color: randomColor
    };

    setStudents([studentToAdd, ...students]);
    setIsModalOpen(false);
    setNewStudent({
      name: '',
      email: '',
      level: 'Level 1',
      status: 'Active'
    });
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'All Levels' || student.level === levelFilter;
    const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Calculate stats
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const atRiskCount = students.filter(s => s.status === 'At Risk').length;
  const suspendedCount = students.filter(s => s.status === 'Suspended').length;

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
              onClick={() => setIsModalOpen(true)}
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
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Suspended</span>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-2">{suspendedCount}</h3>
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
                
                {/* Level Filter */}
                <select 
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-indigo-300 transition-all cursor-pointer"
                >
                  <option>All Levels</option>
                  <option>Level 1</option>
                  <option>Level 2</option>
                  <option>Level 3</option>
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
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Level</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment Date</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${student.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                            {student.initials}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                        </td>

                        {/* Email */}
                        <td className="p-4 text-slate-600 text-sm">{student.email}</td>

                        {/* Level */}
                        <td className="p-4 text-slate-700 text-sm font-medium">{student.level}</td>

                        {/* Enrollment Date */}
                        <td className="p-4 text-slate-500 text-sm">{student.enrolled}</td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider
                            ${student.status === 'Active' ? 'bg-teal-50 text-teal-600' : ''}
                            ${student.status === 'At Risk' ? 'bg-red-50 text-red-500' : ''}
                            ${student.status === 'Suspended' ? 'bg-amber-50 text-amber-600' : ''}
                          `}>
                            {student.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-2 bg-transparent border-none text-slate-400 hover:text-red-500 transition-colors cursor-pointer inline-flex items-center"
                            title="Delete Student"
                          >
                            <FiTrash2 className="w-4.5 h-4.5" />
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
                  <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
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

                    {/* Academic Level */}
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">Academic Level</label>
                      <select 
                        value={newStudent.level}
                        onChange={(e) => setNewStudent({...newStudent, level: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans cursor-pointer bg-white"
                      >
                        <option>Level 1</option>
                        <option>Level 2</option>
                        <option>Level 3</option>
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
                      Add Student
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
