import { useState } from 'react';
import { FiFileText, FiVideo, FiFile, FiGrid, FiList, FiPlus } from 'react-icons/fi';

export default function ResourceUpload() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewType, setViewType] = useState('grid');

  const resources = [
    {
      id: 1,
      title: 'Advanced Calculus',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Documents',
      tag: 'Math Dept',
      tagColor: 'bg-emerald-500',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <FiFileText className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 2,
      title: 'Week 3 Lecture Rec',
      type: 'MP4',
      size: '145 MB',
      category: 'Videos',
      tag: 'Physics 101',
      tagColor: 'bg-indigo-500',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
          <FiVideo className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 3,
      title: 'Midterm Essay Pror',
      type: 'DOCX',
      size: '18 KB',
      category: 'Documents',
      tag: 'Literature',
      tagColor: 'bg-[#00838f]',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
          <FiFile className="w-5 h-5" />
        </div>
      )
    },
    {
      id: 4,
      title: 'Cellular Biology Slic',
      type: 'PPTX',
      size: '12 MB',
      category: 'Presentations',
      tag: 'Biology',
      tagColor: 'bg-amber-500',
      icon: (
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>
        </div>
      )
    }
  ];

  const handleBrowseClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.docx,.pptx,.mp4';
    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        alert(`Selected file: ${e.target.files[0].name}`);
      }
    };
    fileInput.click();
  };

  const handleImportDrive = () => {
    alert('Connecting to Google Drive...');
  };

  const filteredResources = activeFilter === 'All'
    ? resources
    : resources.filter((r) => r.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Resource Manager</h1>
        <p className="text-slate-500 text-base max-w-3xl leading-relaxed">
          Connect with peers, ask academic questions, and participate in teacher-moderated discussions.
        </p>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200/80 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M21.2 15c.6-1.2.8-2.5.5-3.8-.5-2-2-3.5-4-4-1.2-3.3-4.8-5-8.2-3.8-2.5 1-4.2 3.3-4.5 6-1.5.3-2.8 1.4-3 3-.3 2.5 1.7 4.6 4.2 4.6h12.5c1.4 0 2.6-.9 3-2.2z"></path><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="8" x2="12" y2="20"></line></svg>
        <h3 className="text-xl font-bold text-slate-800 mb-1.5">Drag & Drop Materials Here</h3>
        <p className="text-xs text-slate-500 mb-6">
          Support for PDF, DOCX, PPTX, and MP4 up to 50MB
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={handleBrowseClick}
            className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            Browse Files
          </button>
          <button 
            onClick={handleImportDrive}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            Import from Drive
          </button>
        </div>
      </div>

      {/* Filters & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', 'Documents', 'Videos', 'Presentations'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                ${activeFilter === filter
                  ? 'bg-indigo-55/90 text-[#3b28cc] bg-indigo-50 border border-indigo-100'
                  : 'bg-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/40 shrink-0 self-end sm:self-auto">
          <button 
            onClick={() => setViewType('grid')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewType === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewType('list')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${viewType === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResources.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="mb-4">
                  {res.icon}
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug truncate mb-1">{res.title}</h4>
                <p className="text-[11px] text-slate-400 font-semibold">{res.type} • {res.size}</p>
              </div>
              <div className="mt-5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${res.tagColor}`}></span>
                <span className="text-[11px] text-slate-500 font-semibold">{res.tag}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {filteredResources.map((res) => (
            <div key={res.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3">
                {res.icon}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{res.title}</h4>
                  <p className="text-[11px] text-slate-400">{res.type} • {res.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 rounded-lg px-2.5 py-1">
                <span className={`w-2 h-2 rounded-full ${res.tagColor}`}></span>
                <span className="text-[11px] text-slate-600 font-bold">{res.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Resource CTA Button */}
      <button 
        onClick={handleBrowseClick}
        className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        <FiPlus className="w-4 h-4 stroke-[3px]" />
        New Resource
      </button>

    </div>
  );
}
