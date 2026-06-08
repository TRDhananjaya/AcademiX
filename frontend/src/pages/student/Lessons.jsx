import { useState } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';

const modules = [
  {
    id: 1,
    title: 'Introduction to Algorithms',
    description: 'Core concepts of algorithmic thinking, Big O notation, and...',
    progress: 78,
    videos: 4,
    documents: 2,
    files: 0,
    status: 'Draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 2,
    title: 'Advanced Data Structures',
    description: 'Trees, graphs, hash tables, and their implementation in real-...',
    progress: 45,
    videos: 8,
    documents: 5,
    files: 1,
    status: 'Published',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="14" x2="4" y2="14"></line>
      </svg>
    ),
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    description: 'Supervised vs unsupervised learning, neural networks, and...',
    progress: 12,
    videos: 12,
    documents: 2,
    files: 0,
    status: 'Published',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 5.4 3.6 7.2 4.6 9h6.8c1-1.8 4.6-3.6 4.6-9a8 8 0 0 0-8-8z"></path>
        <line x1="9" y1="22" x2="15" y2="22"></line>
        <line x1="12" y1="12" x2="12" y2="12.01"></line>
      </svg>
    ),
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  {
    id: 4,
    title: 'Introduction to Algorithms',
    description: 'Core concepts of algorithmic thinking, Big O notation, and...',
    progress: 78,
    videos: 4,
    documents: 2,
    files: 0,
    status: 'Draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 5,
    title: 'Introduction to Algorithms',
    description: 'Core concepts of algorithmic thinking, Big O notation, and...',
    progress: 78,
    videos: 4,
    documents: 2,
    files: 0,
    status: 'Draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 6,
    title: 'Introduction to Algorithms',
    description: 'Core concepts of algorithmic thinking, Big O notation, and...',
    progress: 78,
    videos: 4,
    documents: 2,
    files: 0,
    status: 'Draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  }
];

export default function Lessons() {
  const [activeNav, setActiveNav] = useState('lessons');

  return (
    <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="lessons-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          
          <div className="mb-6">
            <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">
              Lesson & Resource Section
            </h1>
            <p className="text-slate-500 text-[15px] mt-1">
              Access lessons, modules and learning resources
            </p>
          </div>

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-8">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                <svg className="text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Find lessons or modules..." className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400" />
              </div>
              
              <div className="w-[1px] h-6 bg-slate-200 hidden sm:block"></div>

              {/* Filter */}
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filter
              </button>

              {/* Sort */}
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                Sort by: Date
              </button>
            </div>

            {/* View Toggles */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-6">Current Modules</h2>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => (
              <div key={module.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-12 h-12 rounded-xl ${module.iconBg} ${module.iconColor} flex items-center justify-center shrink-0`}>
                    {module.icon}
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>

                <h3 className="text-[17px] font-bold text-slate-800 mb-2 leading-tight">
                  {module.title}
                </h3>
                <p className="text-[13px] text-slate-500 mb-6 leading-relaxed flex-1">
                  {module.description}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500">Class Progress</span>
                    <span className="text-xs font-bold text-indigo-600">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${module.progress}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        {module.videos}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        {module.documents}
                      </div>
                      {module.files > 0 && (
                        <div className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                          {module.files}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${module.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-600'}`}>
                      {module.status}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
