import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import {
  FiFileText, FiVideo, FiFile, FiArrowLeft, FiSearch,
  FiExternalLink, FiBookOpen, FiFolder, FiLink, FiGlobe
} from 'react-icons/fi';

export default function Lessons() {
  const [activeNav, setActiveNav] = useState('lessons');

  // Hierarchy Navigation state
  // views: 'lessons' (Level 1), 'modules' (Level 2), 'resources' (Level 3)
  const [currentView, setCurrentView] = useState('lessons');
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // Live Database states
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTermTab, setActiveTermTab] = useState('All');
  const [resourceFilter, setResourceFilter] = useState('All');

  // Fetch all lessons, modules, and resources on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const lessonsRes = await fetch('http://localhost:5000/api/lessons');
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData || []);

      const modulesRes = await fetch('http://localhost:5000/api/modules');
      const modulesData = await modulesRes.json();
      setModules(modulesData || []);

      const resourcesRes = await fetch('http://localhost:5000/api/resources');
      const resourcesData = await resourcesRes.json();
      setResources(resourcesData || []);
    } catch (err) {
      console.error('Error fetching student learning materials:', err);
    }
  };

  const handleDownloadResource = async (res) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${res._id || res.id}`);
      const data = await response.json();
      if (data && data.url) {
        const link = document.createElement('a');
        link.href = data.url;
        link.download = res.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error downloading resource:', err);
    }
  };

  // Helper selectors
  const getModulesForActiveLesson = () => {
    if (!activeLesson) return [];
    const activeLId = activeLesson._id || activeLesson.id;
    return modules.filter(m => m.lessonId === activeLId);
  };

  const getResourcesForActiveModule = () => {
    if (!activeModule) return [];
    const activeMId = activeModule._id || activeModule.id;
    const activeLId = activeLesson?._id || activeLesson?.id;
    return resources.filter(r => r.moduleId === activeMId || r.lessonId === activeLId);
  };

  // Style details helper
  const getResourceDetails = (type) => {
    switch (type) {
      case 'PDF':
        return {
          icon: <FiFileText className="w-5 h-5" />,
          colorClass: 'text-red-600 bg-red-50 border-red-100',
          badge: 'bg-red-100 text-red-700'
        };
      case 'Video':
        return {
          icon: <FiVideo className="w-5 h-5" />,
          colorClass: 'text-purple-600 bg-purple-50 border-purple-100',
          badge: 'bg-purple-100 text-purple-700'
        };
      case 'Presentation':
        return {
          icon: <FiFile className="w-5 h-5" />,
          colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'Link':
        return {
          icon: <FiGlobe className="w-5 h-5" />,
          colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          badge: 'bg-emerald-100 text-emerald-700'
        };
      default:
        return {
          icon: <FiFile className="w-5 h-5" />,
          colorClass: 'text-sky-600 bg-sky-50 border-sky-100',
          badge: 'bg-sky-100 text-sky-700'
        };
    }
  };

  // Renderers
  const renderLessonsView = () => {
    const filteredLessons = lessons.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTerm = activeTermTab === 'All' || l.term === Number(activeTermTab);
      return matchesSearch && matchesTerm;
    });

    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search syllabus lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Term Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['All', '1', '2', '3'].map((term) => (
            <button
              key={term}
              onClick={() => setActiveTermTab(term)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                ${(term === 'All' ? activeTermTab === 'All' : Number(activeTermTab) === Number(term))
                  ? 'bg-indigo-50 text-[#3b28cc] border-indigo-100 font-bold'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
            >
              {term === 'All' ? 'All Terms' : `Term 0${term}`}
            </button>
          ))}
        </div>

        {/* Lessons Cards Grid */}
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(lesson => {
              const lessonIdStr = lesson._id || lesson.id;
              const moduleCount = modules.filter(m => m.lessonId === lessonIdStr).length;
              return (
                <div
                  key={lessonIdStr}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => {
                    setActiveLesson(lesson);
                    setCurrentView('modules');
                    setSearchQuery('');
                  }}
                >
                  {/* Cover image or gradient */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {lesson.image ? (
                      <img
                        src={lesson.image}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white/20 font-extrabold text-5xl">
                        <FiBookOpen className="w-16 h-16 opacity-30 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                    {/* Tags */}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-indigo-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Lesson {String(lesson.lessonNumber).padStart(2, '0')}
                    </span>
                    <span className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Term {lesson.term || 1}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{moduleCount} Modules</span>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-2 leading-tight group-hover:text-[#3b28cc] transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3 flex-grow">
                      {lesson.description || 'No description available for this lesson.'}
                    </p>

                    <div className="mt-auto">
                      <button className="w-full text-center bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 text-slate-700 hover:text-indigo-650 font-bold py-2.5 rounded-xl text-xs transition-all duration-200">
                        View Modules &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-450 bg-slate-50/50">
            <FiBookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No lessons available matching current filter.</p>
          </div>
        )}
      </div>
    );
  };

  const renderModulesView = () => {
    const activeLessonIdStr = activeLesson?._id || activeLesson?.id;
    const activeLessonModules = getModulesForActiveLesson().filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
            className="hover:text-[#3b28cc] transition-colors"
          >
            Lessons
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold max-w-[200px] truncate">{activeLesson?.title}</span>
        </div>

        {/* Selected Lesson Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-150 bg-slate-900 text-white min-h-[160px] p-6 sm:p-8 flex flex-col justify-end">
          {activeLesson?.image ? (
            <img
              src={activeLesson?.image}
              alt={activeLesson?.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-purple-950 opacity-90"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-transparent"></div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Lesson {String(activeLesson?.lessonNumber).padStart(2, '0')}
              </span>
              <span className="inline-block bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Term {activeLesson?.term || 1}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{activeLesson?.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{activeLesson?.description}</p>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Lessons
          </button>
        </div>


        {/* Modules Grid */}
        {activeLessonModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLessonModules.map(module => {
              const moduleIdStr = module._id || module.id;
              const moduleResources = resources.filter(r => r.moduleId === moduleIdStr || r.lessonId === activeLessonIdStr);
              const videosCount = moduleResources.filter(r => r.type === 'Video').length;
              const pdfsCount = moduleResources.filter(r => r.type === 'PDF').length;
              const linksCount = moduleResources.filter(r => r.type === 'Link').length;
              const docsCount = moduleResources.filter(r => ['Document', 'Presentation'].includes(r.type)).length;

              return (
                <div
                  key={moduleIdStr}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col group hover:shadow-[0_6px_25px_-4px_rgba(0,0,0,0.05)] transition-all"
                >
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 self-start">
                    Module
                  </span>
                  <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug mt-3">{module.title}</h3>
                  {module.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{module.description}</p>
                  )}

                  {/* Subtopics */}
                  <div className="flex flex-wrap gap-1.5 mt-3 mb-6">
                    {module.topics && module.topics.length > 0 ? (
                      module.topics.map((topic, index) => (
                        <span key={index} className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/50 rounded-md px-2 py-0.5">
                          {topic}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-slate-400">No topics added</span>
                    )}
                  </div>

                  {/* Resource Counts */}
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center text-slate-500 mt-auto">
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="block text-xs font-extrabold text-slate-800">{videosCount}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">Videos</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="block text-xs font-extrabold text-slate-800">{pdfsCount}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">PDFs</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="block text-xs font-extrabold text-slate-800">{docsCount}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">Docs</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="block text-xs font-extrabold text-slate-800">{linksCount}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">Links</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveModule(module);
                      setCurrentView('resources');
                      setResourceFilter('All');
                    }}
                    className="w-full mt-5 bg-indigo-50 hover:bg-[#3b28cc] border border-indigo-100 hover:border-[#3b28cc] text-indigo-750 hover:text-white font-bold py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer"
                  >
                    Access Resources &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-450 bg-slate-50/50">
            <FiFolder className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No modules available matching your query.</p>
          </div>
        )}
      </div>
    );
  };

  const renderResourcesView = () => {
    const activeModuleResources = getResourcesForActiveModule();
    const filteredResources = resourceFilter === 'All'
      ? activeModuleResources
      : activeModuleResources.filter(r => {
        if (resourceFilter === 'Documents') return ['PDF', 'Document'].includes(r.type);
        if (resourceFilter === 'Videos') return r.type === 'Video';
        if (resourceFilter === 'Presentations') return r.type === 'Presentation';
        if (resourceFilter === 'Links') return r.type === 'Link';
        return true;
      });

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
            className="hover:text-[#3b28cc] transition-colors"
          >
            Lessons
          </button>
          <span>/</span>
          <button
            onClick={() => { setCurrentView('modules'); setSearchQuery(''); }}
            className="hover:text-[#3b28cc] transition-colors max-w-[150px] truncate"
          >
            {activeLesson?.title}
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold max-w-[150px] truncate">{activeModule?.title}</span>
        </div>

        {/* Back and Title Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FiFolder className="text-indigo-650" />
              {activeModule?.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Study materials and learning references uploaded by your teacher.</p>
          </div>
          <button
            onClick={() => { setCurrentView('modules'); setSearchQuery(''); }}
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white font-semibold py-2 px-3.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Modules
          </button>
        </div>

        {/* Filter Tabs & Content grid */}
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['All', 'Documents', 'Videos', 'Presentations', 'Links'].map((filter) => (
              <button
                key={filter}
                onClick={() => setResourceFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                  ${resourceFilter === filter
                    ? 'bg-indigo-50 text-[#3b28cc] border-indigo-100 font-bold'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(res => {
                const style = getResourceDetails(res.type);
                const resourceIdStr = res._id || res.id;
                return (
                  <div
                    key={resourceIdStr}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style.colorClass}`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate pr-2" title={res.title}>
                          {res.title}
                        </h4>
                        {res.description && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{res.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                            {res.type}
                          </span>
                          {res.lessonId && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center gap-0.5">
                              <FiGlobe className="w-2.5 h-2.5" />
                              Shared
                            </span>
                          )}
                          {res.size && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {res.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {res.url && (
                      res.type === 'Link' ? (
                        <a
                          href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          Open in Website
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      ) : res.type === 'Video' && (!res.size || /youtube\.com|youtu\.be/i.test(res.url)) ? (
                        <a
                          href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          View in YouTube
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDownloadResource(res)}
                          className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm cursor-pointer border-none"
                        >
                          Download
                          <FiExternalLink className="w-3 h-3" />
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-450 bg-slate-50/50">
              <FiFolder className="w-12 h-12 mx-auto text-slate-350 mb-3" />
              <p className="text-sm font-semibold">No materials found in this category.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#fcfdff]" id="lessons-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />

        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">
              {currentView === 'lessons' ? 'Syllabus Lessons' : currentView === 'modules' ? 'Lesson Modules' : 'Learning Resources'}
            </h1>
            <p className="text-slate-500 text-[15px] mt-1">
              {currentView === 'lessons'
                ? 'Access curriculum lessons and study materials organized by term.'
                : currentView === 'modules'
                  ? 'Choose a chapter module to view its lecture recordings, PDFs, and notes.'
                  : 'Download files and view web links for your class topics.'
              }
            </p>
          </div>

          {currentView === 'lessons' && renderLessonsView()}
          {currentView === 'modules' && renderModulesView()}
          {currentView === 'resources' && renderResourcesView()}
        </main>
      </div>
    </div>
  );
}
