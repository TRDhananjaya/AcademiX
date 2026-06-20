import { useState, useEffect, useRef } from 'react';
import { 
  FiFileText, FiVideo, FiFile, FiPlus, FiArrowLeft, FiEdit2, 
  FiTrash2, FiSearch, FiExternalLink, FiUploadCloud, FiBookOpen, 
  FiFolder, FiLink, FiGlobe 
} from 'react-icons/fi';

// Beautiful Cover presets for Lesson cards
const PRESET_COVERS = [
  { id: 'blue', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60', name: 'Tech Blue' },
  { id: 'teal', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=60', name: 'Hardware Teal' },
  { id: 'orange', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', name: 'Math Board' },
  { id: 'indigo', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', name: 'Code Dark' },
];

export default function LessonBuilder() {
  // Navigation & Hierarchy State
  // views: 'lessons' (Level 1), 'modules' (Level 2), 'resources' (Level 3)
  const [currentView, setCurrentView] = useState('lessons');
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // Data State
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);

  // UX & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState('All');
  
  // Modals & Forms State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', lessonNumber: '', image: PRESET_COVERS[0].url });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', topics: '' });

  const [linkForm, setLinkForm] = useState({ title: '', url: '' });

  const fileInputRef = useRef(null);

  // Initialize data from localStorage or seed defaults
  useEffect(() => {
    const storedLessons = localStorage.getItem('academix_lessons');
    const storedModules = localStorage.getItem('academix_modules');
    const storedResources = localStorage.getItem('academix_resources');

    if (storedLessons && storedModules && storedResources) {
      setLessons(JSON.parse(storedLessons));
      setModules(JSON.parse(storedModules));
      setResources(JSON.parse(storedResources));
    } else {
      // Seed Data
      const seedLessons = [
        {
          id: 'l-1',
          lessonNumber: 1,
          title: 'Information and Communication Technology',
          description: 'Learn basic ICT concepts, its historical evolution, real-world applications, and emerging digital trends.',
          image: PRESET_COVERS[0].url
        },
        {
          id: 'l-2',
          lessonNumber: 2,
          title: 'Fundamentals of a Computer System',
          description: 'Explore hardware, software, processing units, storage layouts, and primary memory components.',
          image: PRESET_COVERS[1].url
        },
        {
          id: 'l-3',
          lessonNumber: 3,
          title: 'Logic Gates with Boolean Functions',
          description: 'Study logic gate operations (AND, OR, NOT), construct truth tables, and analyze digital circuit logic.',
          image: PRESET_COVERS[2].url
        }
      ];

      const seedModules = [
        { id: 'm-1-1', lessonId: 'l-1', title: 'Introduction to ICT', topics: ['Definition of ICT', 'Data vs Information', 'Curriculum overview'] },
        { id: 'm-1-2', lessonId: 'l-1', title: 'Applications of ICT', topics: ['ICT in Education', 'ICT in Medicine', 'Business applications'] },
        { id: 'm-2-1', lessonId: 'l-2', title: 'Hardware & Inner Workings', topics: ['Central Processing Unit (CPU)', 'Input devices', 'Output systems'] },
        { id: 'm-2-2', lessonId: 'l-2', title: 'Storage & Memory Systems', topics: ['RAM & ROM', 'Secondary storage media', 'Cache efficiency'] },
        { id: 'm-3-1', lessonId: 'l-3', title: 'Basic Logic Operations', topics: ['AND, OR, NOT Gate circuits', 'Truth table formulas'] }
      ];

      const seedResources = [
        { id: 'r-1', moduleId: 'm-1-1', title: 'Introduction to ICT Basics.pdf', type: 'PDF', size: '2.4 MB', url: '#' },
        { id: 'r-2', moduleId: 'm-1-1', title: 'Weekly Lecture Recording.mp4', type: 'Video', size: '142 MB', url: '#' },
        { id: 'r-3', moduleId: 'm-1-1', title: 'E-Learning Portal Guide', type: 'Link', size: '', url: 'https://example.com' },
        { id: 'r-4', moduleId: 'm-2-1', title: 'Hardware Architecture Slides.pptx', type: 'Presentation', size: '14.5 MB', url: '#' },
        { id: 'r-5', moduleId: 'm-2-1', title: 'Inner Workings CPU.docx', type: 'Document', size: '420 KB', url: '#' },
        { id: 'r-6', moduleId: 'm-3-1', title: 'Logicly Circuit Simulator', type: 'Link', size: '', url: 'https://logic.ly/demo' }
      ];

      setLessons(seedLessons);
      setModules(seedModules);
      setResources(seedResources);

      localStorage.setItem('academix_lessons', JSON.stringify(seedLessons));
      localStorage.setItem('academix_modules', JSON.stringify(seedModules));
      localStorage.setItem('academix_resources', JSON.stringify(seedResources));
    }
  }, []);

  // Save changes helper
  const saveState = (updatedLessons, updatedModules, updatedResources) => {
    if (updatedLessons) {
      setLessons(updatedLessons);
      localStorage.setItem('academix_lessons', JSON.stringify(updatedLessons));
    }
    if (updatedModules) {
      setModules(updatedModules);
      localStorage.setItem('academix_modules', JSON.stringify(updatedModules));
    }
    if (updatedResources) {
      setResources(updatedResources);
      localStorage.setItem('academix_resources', JSON.stringify(updatedResources));
    }
  };

  // --- CRUD: LESSONS ---
  const handleOpenLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description,
        lessonNumber: lesson.lessonNumber,
        image: lesson.image
      });
    } else {
      setEditingLesson(null);
      // Auto-increment lesson number suggestion
      const maxNum = lessons.reduce((max, l) => l.lessonNumber > max ? l.lessonNumber : max, 0);
      setLessonForm({
        title: '',
        description: '',
        lessonNumber: maxNum + 1,
        image: PRESET_COVERS[0].url
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    let updatedLessons;
    if (editingLesson) {
      updatedLessons = lessons.map(l => l.id === editingLesson.id ? { 
        ...l, 
        title: lessonForm.title, 
        description: lessonForm.description,
        lessonNumber: Number(lessonForm.lessonNumber),
        image: lessonForm.image
      } : l);
    } else {
      const newLesson = {
        id: `l-${Date.now()}`,
        title: lessonForm.title,
        description: lessonForm.description,
        lessonNumber: Number(lessonForm.lessonNumber),
        image: lessonForm.image
      };
      updatedLessons = [...lessons, newLesson];
    }

    // Sort lessons by lessonNumber
    updatedLessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
    saveState(updatedLessons, null, null);
    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lessonId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this Lesson? All its modules and resources will be permanently removed.")) {
      const updatedLessons = lessons.filter(l => l.id !== lessonId);
      // Delete child modules & resources
      const deletedModuleIds = modules.filter(m => m.lessonId === lessonId).map(m => m.id);
      const updatedModules = modules.filter(m => m.lessonId !== lessonId);
      const updatedResources = resources.filter(r => !deletedModuleIds.includes(r.moduleId));
      
      saveState(updatedLessons, updatedModules, updatedResources);
      if (activeLesson?.id === lessonId) {
        setCurrentView('lessons');
        setActiveLesson(null);
      }
    }
  };

  // --- CRUD: MODULES ---
  const handleOpenModuleModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        topics: module.topics.join(', ')
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        topics: ''
      });
    }
    setShowModuleModal(true);
  };

  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim() || !activeLesson) return;

    const parsedTopics = moduleForm.topics
      ? moduleForm.topics.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    let updatedModules;
    if (editingModule) {
      updatedModules = modules.map(m => m.id === editingModule.id ? {
        ...m,
        title: moduleForm.title,
        topics: parsedTopics
      } : m);
    } else {
      const newModule = {
        id: `m-${Date.now()}`,
        lessonId: activeLesson.id,
        title: moduleForm.title,
        topics: parsedTopics
      };
      updatedModules = [...modules, newModule];
    }

    saveState(null, updatedModules, null);
    setShowModuleModal(false);
    setEditingModule(null);
  };

  const handleDeleteModule = (moduleId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this Module? All its uploaded resources will be lost.")) {
      const updatedModules = modules.filter(m => m.id !== moduleId);
      const updatedResources = resources.filter(r => r.moduleId !== moduleId);
      saveState(null, updatedModules, updatedResources);
      if (activeModule?.id === moduleId) {
        setCurrentView('modules');
        setActiveModule(null);
      }
    }
  };

  // --- CRUD: RESOURCES ---
  const handleAddLinkResource = (e) => {
    e.preventDefault();
    if (!linkForm.title.trim() || !linkForm.url.trim() || !activeModule) return;

    let formattedUrl = linkForm.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newResource = {
      id: `r-${Date.now()}`,
      moduleId: activeModule.id,
      title: linkForm.title.trim(),
      type: 'Link',
      size: '',
      url: formattedUrl
    };

    const updatedResources = [...resources, newResource];
    saveState(null, null, updatedResources);
    setLinkForm({ title: '', url: '' });
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0 || !activeModule) return;

    const file = filesList[0];
    const extension = file.name.split('.').pop().toLowerCase();
    
    let type = 'Document';
    if (extension === 'pdf') type = 'PDF';
    else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) type = 'Video';
    else if (['pptx', 'ppt'].includes(extension)) type = 'Presentation';
    else if (['docx', 'doc'].includes(extension)) type = 'Document';

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = sizeInMB === '0.0' ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;

    const newResource = {
      id: `r-${Date.now()}`,
      moduleId: activeModule.id,
      title: file.name,
      type: type,
      size: sizeStr,
      url: '#'
    };

    const updatedResources = [...resources, newResource];
    saveState(null, null, updatedResources);
    
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteResource = (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      const updatedResources = resources.filter(r => r.id !== resourceId);
      saveState(null, null, updatedResources);
    }
  };

  // Helper selectors
  const getModulesForActiveLesson = () => {
    if (!activeLesson) return [];
    return modules.filter(m => m.lessonId === activeLesson.id);
  };

  const getResourcesForActiveModule = () => {
    if (!activeModule) return [];
    return resources.filter(r => r.moduleId === activeModule.id);
  };

  // Resource styling helper
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

  // Rendering Helpers
  const renderLessonsView = () => {
    const filteredLessons = lessons.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-80 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search lessons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
            />
          </div>
          <button 
            onClick={() => handleOpenLessonModal()}
            className="flex items-center gap-2 bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-sm ml-auto w-full sm:w-auto justify-center"
          >
            <FiPlus className="w-4 h-4 stroke-[3px]" />
            New Lesson
          </button>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => {
            const moduleCount = modules.filter(m => m.lessonId === lesson.id).length;
            return (
              <div 
                key={lesson.id} 
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col group"
              >
                {/* Cover Photo */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={lesson.image} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  
                  {/* Lesson Number Tag */}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-indigo-750 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Lesson {String(lesson.lessonNumber).padStart(2, '0')}
                  </span>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenLessonModal(lesson)}
                      className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                      title="Edit Lesson"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteLesson(lesson.id, e)}
                      className="p-2 bg-red-50/90 backdrop-blur-sm hover:bg-red-100 hover:text-red-700 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                      title="Delete Lesson"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lesson Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{moduleCount} Modules</span>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3 flex-grow">
                    {lesson.description || 'No description available for this lesson.'}
                  </p>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => {
                        setActiveLesson(lesson);
                        setCurrentView('modules');
                        setSearchQuery('');
                      }}
                      className="flex-1 text-center bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 text-slate-700 hover:text-indigo-650 font-bold py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                    >
                      View Modules &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Card */}
          <div 
            onClick={() => handleOpenLessonModal()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/10 min-h-[300px] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors mb-4 border border-slate-100">
              <FiPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-slate-700 group-hover:text-indigo-650 text-sm">Add New Lesson</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Create a new structural syllabus block</p>
          </div>
        </div>
      </div>
    );
  };

  const renderModulesView = () => {
    const activeLessonModules = getModulesForActiveLesson().filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
          <button 
            onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
            className="hover:text-indigo-600 transition-colors"
          >
            Lessons
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold max-w-[200px] truncate">{activeLesson?.title}</span>
        </div>

        {/* Header card with Cover Image background */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-150 bg-slate-900 text-white min-h-[160px] p-6 sm:p-8 flex flex-col justify-end">
          <img 
            src={activeLesson?.image} 
            alt={activeLesson?.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-25" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-transparent"></div>
          <div className="relative z-10 space-y-2">
            <span className="inline-block bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Lesson {String(activeLesson?.lessonNumber).padStart(2, '0')}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{activeLesson?.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{activeLesson?.description}</p>
          </div>
        </div>

        {/* Module Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
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
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
              className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button 
              onClick={() => handleOpenModuleModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-sm"
            >
              <FiPlus className="w-4 h-4 stroke-[3px]" />
              New Module
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeLessonModules.map(module => {
            const moduleResources = resources.filter(r => r.moduleId === module.id);
            const videosCount = moduleResources.filter(r => r.type === 'Video').length;
            const pdfsCount = moduleResources.filter(r => r.type === 'PDF').length;
            const linksCount = moduleResources.filter(r => r.type === 'Link').length;
            const docsCount = moduleResources.filter(r => ['Document', 'Presentation'].includes(r.type)).length;

            return (
              <div 
                key={module.id} 
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Module Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                      Module
                    </span>
                    <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug mt-1.5">{module.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleOpenModuleModal(module)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Module Name/Topics"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteModule(module.id, e)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Module Topics / Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {module.topics && module.topics.length > 0 ? (
                    module.topics.map((topic, index) => (
                      <span key={index} className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/60 rounded-md px-2 py-0.5">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] italic text-slate-400">No topics added</span>
                  )}
                </div>

                {/* Resource Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center text-slate-500">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <span className="block text-sm font-bold text-slate-850">{videosCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Videos</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <span className="block text-sm font-bold text-slate-850">{pdfsCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">PDFs</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <span className="block text-sm font-bold text-slate-850">{docsCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Docs</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <span className="block text-sm font-bold text-slate-850">{linksCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Links</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    setActiveModule(module);
                    setCurrentView('resources');
                    setResourceFilter('All');
                  }}
                  className="w-full mt-5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 text-indigo-750 hover:text-white font-bold py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer text-center"
                >
                  Manage Resources &rarr;
                </button>
              </div>
            );
          })}

          {/* Quick Add Module Card */}
          <div 
            onClick={() => handleOpenModuleModal()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/10 min-h-[180px] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors mb-3 border border-slate-100">
              <FiPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-slate-700 group-hover:text-indigo-650 text-sm">Add New Module</h4>
            <p className="text-xs text-slate-400 mt-0.5">Define a lesson topic block</p>
          </div>
        </div>
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
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
          <button 
            onClick={() => { setCurrentView('lessons'); setSearchQuery(''); }}
            className="hover:text-indigo-600 transition-colors"
          >
            Lessons
          </button>
          <span>/</span>
          <button 
            onClick={() => { setCurrentView('modules'); setSearchQuery(''); }}
            className="hover:text-indigo-600 transition-colors max-w-[120px] truncate"
          >
            {activeLesson?.title}
          </button>
          <span>/</span>
          <span className="text-slate-700 font-bold max-w-[120px] truncate">{activeModule?.title}</span>
        </div>

        {/* Back and Title Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FiFolder className="text-indigo-600" />
              {activeModule?.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Add or remove learning materials for this module.</p>
          </div>
          <button 
            onClick={() => { setCurrentView('modules'); setSearchQuery(''); }}
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white font-semibold py-2 px-3.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Modules
          </button>
        </div>

        {/* Resources Forms & Uploaders Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form left: Mock Uploader & Links form */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* File Drag / Browse Box */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-750 text-sm">Upload Material File</h4>
              <p className="text-[11px] text-slate-400 mt-1 mb-5 max-w-[190px]">PDF, DOCX, PPTX, MP4 up to 50MB files supported</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.mp4" 
                className="hidden" 
              />
              <button 
                onClick={handleBrowseFiles}
                className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm border-none"
              >
                Browse & Upload File
              </button>
            </div>

            {/* Link resource Form */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
              <h4 className="font-bold text-slate-750 text-sm mb-4 flex items-center gap-1.5">
                <FiLink className="text-indigo-600" />
                Add Web Reference
              </h4>
              <form onSubmit={handleAddLinkResource} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Resource Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. YouTube Video, Article link" 
                    value={linkForm.title}
                    onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 bg-slate-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">URL / Link Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://domain.com/notes" 
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 bg-slate-50/50"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full border border-indigo-150 hover:bg-indigo-50/30 text-indigo-750 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Link Resource
                </button>
              </form>
            </div>

          </div>

          {/* List right: Added Resources */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['All', 'Documents', 'Videos', 'Presentations', 'Links'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setResourceFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                    ${resourceFilter === filter
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* List of Resource Cards */}
            {filteredResources.length > 0 ? (
              <div className="space-y-3">
                {filteredResources.map((res) => {
                  const style = getResourceDetails(res.type);
                  return (
                    <div 
                      key={res.id} 
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:border-slate-200 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon Wrapper */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style.colorClass}`}>
                          {style.icon}
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-850 text-xs sm:text-sm truncate pr-2">
                            {res.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                              {res.type}
                            </span>
                            {res.size && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                {res.size}
                              </span>
                            )}
                            {res.type === 'Link' && (
                              <a 
                                href={res.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                              >
                                Visit Link
                                <FiExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Remove Resource"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
                <FiFolder className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-semibold">No materials found in this category.</p>
                <p className="text-xs text-slate-350 mt-0.5">Use the panels on the left to upload docs or links.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {currentView === 'lessons' ? 'Lesson Builder' : currentView === 'modules' ? 'Module Builder' : 'Material Upload'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentView === 'lessons' 
              ? 'Create & structure syllabus lessons. Same cards synchronize automatically on student interface.'
              : currentView === 'modules'
              ? 'Manage chapters and subsections nested inside your primary lesson syllabus.'
              : 'Add relevant documents, lecture clips, PDFs, or links to help students learn.'
            }
          </p>
        </div>
      </div>

      {/* Render current view based on hierarchy level */}
      {currentView === 'lessons' && renderLessonsView()}
      {currentView === 'modules' && renderModulesView()}
      {currentView === 'resources' && renderResourcesView()}

      {/* Modal: ADD/EDIT LESSON */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingLesson ? 'Edit Lesson Parameters' : 'Initialize New Lesson Card'}
              </h3>
              <button 
                onClick={() => { setShowLessonModal(false); setEditingLesson(null); }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Number</label>
                  <input 
                    type="number" 
                    value={lessonForm.lessonNumber}
                    onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 font-bold"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lesson Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Logic Gates with Boolean Functions" 
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea 
                  placeholder="Summarize the core topics covered in this lesson block..." 
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 min-h-[80px]"
                  rows="3"
                />
              </div>

              {/* Cover Presets selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cover Image Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COVERS.map(cover => (
                    <button
                      key={cover.id}
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, image: cover.url })}
                      className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                        ${lessonForm.image === cover.url ? 'border-indigo-600 scale-[1.03] shadow-sm' : 'border-transparent opacity-85 hover:opacity-100'}
                      `}
                    >
                      <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Or Custom Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..." 
                  value={lessonForm.image}
                  onChange={(e) => setLessonForm({ ...lessonForm, image: e.target.value })}
                  className="w-full text-[11px] p-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setShowLessonModal(false); setEditingLesson(null); }}
                  className="flex-1 border border-slate-200 hover:border-slate-350 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none"
                >
                  {editingLesson ? 'Apply Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: ADD/EDIT MODULE */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingModule ? 'Edit Module parameters' : 'Create New Module Card'}
              </h3>
              <button 
                onClick={() => { setShowModuleModal(false); setEditingModule(null); }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveModule} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Module Name / Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Module 4.1: Introduction to Basic Logic" 
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtopics Covered (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. AND gate, OR gate, Truth tables" 
                  value={moduleForm.topics}
                  onChange={(e) => setModuleForm({ ...moduleForm, topics: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Separate key topics using a comma.</span>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setShowModuleModal(false); setEditingModule(null); }}
                  className="flex-1 border border-slate-200 hover:border-slate-350 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none"
                >
                  {editingModule ? 'Apply Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
