import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { navigate } from '../../App';
import {
  FiFileText, FiVideo, FiFile, FiArrowLeft, FiSearch,
  FiExternalLink, FiBookOpen, FiFolder, FiLink, FiGlobe,
  FiHelpCircle, FiDownloadCloud, FiLoader, FiCheckSquare,
  FiPlay, FiX
} from 'react-icons/fi';

export default function Lessons() {
  const [activeNav, setActiveNav] = useState('lessons');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getYouTubeEmbedUrl = (urlStr) => {
    if (!urlStr) return null;
    const str = urlStr.trim();
    const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    if (str.includes('youtube.com/embed/')) return str;
    return null;
  };

  // Hierarchy Navigation state
  // views: 'lessons' (Level 1), 'modules' (Level 2), 'resources' (Level 3)
  const [currentView, setCurrentView] = useState('lessons');
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // Live Database states with Instant Cache for 0ms Page Refresh
  const [lessons, setLessons] = useState(() => {
    try {
      const cached = sessionStorage.getItem('academiX_lessons');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [modules, setModules] = useState(() => {
    try {
      const cached = sessionStorage.getItem('academiX_modules');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [resources, setResources] = useState(() => {
    try {
      const cached = sessionStorage.getItem('academiX_resources');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('academiX_lessons');
    } catch {
      return true;
    }
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch all lessons, modules, and resources on mount (parallel fetch)
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    if (!sessionStorage.getItem('academiX_lessons')) {
      setIsLoading(true);
    }
    try {
      const [lessonsRes, modulesRes, resourcesRes] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/modules'),
        fetch('/api/resources')
      ]);

      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        const lList = lessonsData || [];
        setLessons(lList);
        try { sessionStorage.setItem('academiX_lessons', JSON.stringify(lList)); } catch (_) {}
      }
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        const mList = modulesData || [];
        setModules(mList);
        try { sessionStorage.setItem('academiX_modules', JSON.stringify(mList)); } catch (_) {}
      }
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        const rList = resourcesData || [];
        setResources(rList);
        try { sessionStorage.setItem('academiX_resources', JSON.stringify(rList)); } catch (_) {}
      }
    } catch (err) {
      console.error('Error fetching student learning materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Browser History & Navigation Stack Handlers
  const navigateToLessons = (push = true) => {
    setCurrentView('lessons');
    setActiveLesson(null);
    setActiveModule(null);
    setSearchQuery('');
    if (push) {
      window.history.pushState({ view: 'lessons' }, '', window.location.pathname);
    }
  };

  const navigateToModules = (lesson, push = true) => {
    const lIdStr = String(lesson._id || lesson.id);
    setActiveLesson(lesson);
    setActiveModule(null);
    setCurrentView('modules');
    setSearchQuery('');
    if (push) {
      window.history.pushState(
        { view: 'modules', lessonId: lIdStr },
        '',
        window.location.pathname
      );
    }
  };

  const navigateToResources = (module, push = true) => {
    const activeLId = activeLesson?._id || activeLesson?.id;
    const lIdStr = activeLId ? String(activeLId) : '';
    const mIdStr = String(module._id || module.id);
    setActiveModule(module);
    setCurrentView('resources');
    setResourceFilter('All');
    if (push) {
      window.history.pushState(
        { view: 'resources', lessonId: lIdStr, moduleId: mIdStr },
        '',
        window.location.pathname
      );
    }
  };

  const handleGoBack = () => {
    if (window.history.state && window.history.state.view) {
      window.history.back();
    } else {
      if (currentView === 'resources') {
        if (activeLesson) navigateToModules(activeLesson, false);
        else navigateToLessons(false);
      } else if (currentView === 'modules') {
        navigateToLessons(false);
      }
    }
  };

  // Sync state with Browser History
  useEffect(() => {
    const syncStateFromUrl = (stateFromEvent) => {
      const currentState = stateFromEvent || window.history.state;
      const lessonIdParam = currentState?.lessonId;
      const moduleIdParam = currentState?.moduleId;
      const viewParam = currentState?.view || 'lessons';

      if (viewParam === 'resources' && moduleIdParam && lessons.length > 0 && modules.length > 0) {
        const foundLesson = lessons.find(l => String(l._id || l.id) === String(lessonIdParam));
        const foundModule = modules.find(m => String(m._id || m.id) === String(moduleIdParam));
        if (foundLesson) setActiveLesson(foundLesson);
        if (foundModule) setActiveModule(foundModule);
        setCurrentView('resources');
      } else if (viewParam === 'modules' && lessonIdParam && lessons.length > 0) {
        const foundLesson = lessons.find(l => String(l._id || l.id) === String(lessonIdParam));
        if (foundLesson) setActiveLesson(foundLesson);
        setActiveModule(null);
        setCurrentView('modules');
      } else if (viewParam === 'lessons') {
        setCurrentView('lessons');
        setActiveLesson(null);
        setActiveModule(null);
      }
    };

    const handlePopState = (e) => {
      syncStateFromUrl(e.state);
    };

    window.addEventListener('popstate', handlePopState);

    // Initial sync when lessons or modules data is loaded
    if (lessons.length > 0 || modules.length > 0) {
      syncStateFromUrl(window.history.state);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [lessons, modules]);

  const handleDownloadResource = async (res) => {
    const resId = res._id || res.id;
    setDownloadingId(resId);
    try {
      if (res.url && !res.url.startsWith('data:') && res.url !== '#' && !res.url.startsWith('/public/uploads/')) {
        const externalUrl = /^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`;
        window.open(externalUrl, '_blank');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resId}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Server error downloading resource file');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      const safeTitle = (res.title || 'resource-file').trim();
      link.download = safeTitle.endsWith('.pdf') ? safeTitle : `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error('Error downloading resource:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Helper classification functions for student dashboard categories
  const isMcqResource = (r) => {
    const titleLower = (r.title || '').toLowerCase();
    const descLower = (r.description || '').toLowerCase();
    return r.type === 'MCQ' || titleLower.includes('mcq') || titleLower.includes('question') || titleLower.includes('paper') || titleLower.includes('quiz') || descLower.includes('mcq');
  };

  const isLessonMainPdf = (r) => {
    return !isMcqResource(r) && r.lessonId && !r.moduleId && ['PDF', 'Document', 'Presentation'].includes(r.type);
  };

  const isModulePdf = (r) => {
    return !isMcqResource(r) && r.moduleId && ['PDF', 'Document', 'Presentation'].includes(r.type);
  };

  const isResourceVideoOrLink = (r) => {
    return r.type === 'Video' || r.type === 'Link' || /youtube\.com|youtu\.be/i.test(r.url || '');
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
      return matchesSearch;
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

        {/* Lessons Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
                <div className="w-full h-40 bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(lesson => {
              const lessonIdStr = lesson._id || lesson.id;
              const moduleCount = modules.filter(m => m.lessonId === lessonIdStr).length;
              return (
                <div
                  key={lessonIdStr}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => navigateToModules(lesson)}
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
            onClick={() => navigateToLessons()}
            className="hover:text-[#3b28cc] transition-colors cursor-pointer"
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
            onClick={handleGoBack}
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
              const pdfsCount = moduleResources.filter(r => ['PDF', 'Document', 'Presentation', 'MCQ'].includes(r.type) || (r.title && r.title.toLowerCase().includes('pdf')) || isMcqResource(r)).length;
              const videosCount = moduleResources.filter(r => isResourceVideoOrLink(r)).length;

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

                  {/* Resource Counts: Only PDFs & Videos */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-center text-slate-500 mt-auto">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5">
                      <span className="block text-base font-extrabold text-slate-800">{pdfsCount}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">PDFs</span>
                    </div>
                    <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-2.5">
                      <span className="block text-base font-extrabold text-indigo-900">{videosCount}</span>
                      <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">Videos</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToResources(module)}
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

  const renderSingleResourceCard = (res) => {
    const style = getResourceDetails(res.type);
    const resourceIdStr = res._id || res.id;
    const isDownloading = downloadingId === resourceIdStr;

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
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{res.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                {res.type}
              </span>
              {res.lessonId && !res.moduleId && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center gap-0.5">
                  <FiGlobe className="w-2.5 h-2.5" />
                  Lesson Main PDF
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

        <div className="shrink-0">
          {res.type === 'Link' ? (
            <a
              href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              Open Link
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : res.type === 'Video' || /youtube\.com|youtu\.be/i.test(res.url || '') ? (
            <button
              onClick={() => setSelectedVideo(res)}
              className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer border-none"
            >
              Watch Video
              <FiPlay className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              disabled={isDownloading}
              onClick={() => handleDownloadResource(res)}
              className="bg-[#3b28cc] hover:bg-indigo-700 disabled:opacity-75 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer border-none"
            >
              {isDownloading ? (
                <>
                  <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  Download
                  <FiDownloadCloud className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResourcesView = () => {
    const activeModuleResources = getResourcesForActiveModule();

    const mcqResources = activeModuleResources.filter(isMcqResource);
    const lessonPdfResources = activeModuleResources.filter(isLessonMainPdf);
    const modulePdfResources = activeModuleResources.filter(isModulePdf);
    const videoLinkResources = activeModuleResources.filter(isResourceVideoOrLink);

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => navigateToLessons()}
            className="hover:text-[#3b28cc] transition-colors cursor-pointer"
          >
            Lessons
          </button>
          <span>/</span>
          <button
            onClick={() => navigateToModules(activeLesson)}
            className="hover:text-[#3b28cc] transition-colors max-w-[150px] truncate cursor-pointer"
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
            <p className="text-xs text-slate-500 mt-1">Structured curriculum materials categorized by resource type.</p>
          </div>
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white font-semibold py-2 px-3.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Modules
          </button>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'All', label: 'All Resources' },
            { id: 'MCQ', label: 'MCQ Practice PDFs' },
            { id: 'Lesson PDF', label: 'Lesson Main PDFs' },
            { id: 'Module PDF', label: 'Module PDFs' },
            { id: 'Videos', label: 'Resource Videos & Links' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setResourceFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                ${resourceFilter === tab.id
                  ? 'bg-[#3b28cc] text-white border-[#3b28cc] font-bold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Categorized Content Grid */}
        <div className="space-y-8 pt-2">
          {/* 1. MCQ Practice PDFs */}
          {(resourceFilter === 'All' || resourceFilter === 'MCQ') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <FiCheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">MCQ Practice PDFs</h3>
                  <p className="text-[11px] text-slate-400">Multiple choice question sheets for student practice</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {mcqResources.length} Items
                </span>
              </div>
              {mcqResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcqResources.map(renderSingleResourceCard)}
                </div>
              ) : (
                <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                  No MCQ Practice PDFs uploaded yet for this module.
                </div>
              )}
            </div>
          )}

          {/* 2. Lesson Main PDFs */}
          {(resourceFilter === 'All' || resourceFilter === 'Lesson PDF') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <FiBookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Lesson Main PDFs & Syllabus Guides</h3>
                  <p className="text-[11px] text-slate-400">Main lesson notes shared across all chapters</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {lessonPdfResources.length} Items
                </span>
              </div>
              {lessonPdfResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessonPdfResources.map(renderSingleResourceCard)}
                </div>
              ) : (
                <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                  No general Lesson Main PDFs uploaded for this lesson.
                </div>
              )}
            </div>
          )}

          {/* 3. Module PDFs */}
          {(resourceFilter === 'All' || resourceFilter === 'Module PDF') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <FiFileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Module Chapter PDFs & Documents</h3>
                  <p className="text-[11px] text-slate-400">Chapter notes, presentations, and documents</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {modulePdfResources.length} Items
                </span>
              </div>
              {modulePdfResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modulePdfResources.map(renderSingleResourceCard)}
                </div>
              ) : (
                <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                  No Module PDFs uploaded yet for this chapter.
                </div>
              )}
            </div>
          )}

          {/* 4. Resource Videos & Links */}
          {(resourceFilter === 'All' || resourceFilter === 'Videos') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <FiVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Resource Videos & Links</h3>
                  <p className="text-[11px] text-slate-400">Educational resource videos, YouTube links, and simulation web tools</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {videoLinkResources.length} Items
                </span>
              </div>
              {videoLinkResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoLinkResources.map(renderSingleResourceCard)}
                </div>
              ) : (
                <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                  No resource videos or web links uploaded for this module.
                </div>
              )}
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
                ? 'Access curriculum lessons and study materials.'
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

      {/* Embedded Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <FiPlay className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-800 truncate" title={selectedVideo.title}>
                    {selectedVideo.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {selectedVideo.description || 'AcademiX Educational Video Resource'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200/60"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Video Container (16:9 Aspect Ratio) */}
            <div className="relative w-full pb-[56.25%] bg-black">
              {getYouTubeEmbedUrl(selectedVideo.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.title}
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={/^https?:\/\//i.test(selectedVideo.url) ? selectedVideo.url : `https://${selectedVideo.url}`}
                  controls
                  autoPlay
                  className="absolute top-0 left-0 w-full h-full object-contain"
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-500">
                Playing in AcademiX Player
              </span>
              <a
                href={/^https?:\/\//i.test(selectedVideo.url) ? selectedVideo.url : `https://${selectedVideo.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                Open in YouTube / External Tab
                <FiExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
