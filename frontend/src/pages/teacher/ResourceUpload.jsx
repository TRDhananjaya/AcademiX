import { useState, useEffect, useRef } from 'react';
import {
  FiFileText, FiVideo, FiFile, FiPlus, FiArrowLeft, FiEdit2,
  FiTrash2, FiSearch, FiExternalLink, FiUploadCloud, FiBookOpen,
  FiFolder, FiLink, FiGlobe
} from 'react-icons/fi';

// Beautiful Cover presets for Lesson cards (used for styling previews or fallbacks)
const PRESET_COVERS = [
  { id: 'blue', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60', name: 'Tech Blue' },
  { id: 'teal', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=60', name: 'Hardware Teal' },
  { id: 'orange', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', name: 'Math Board' },
  { id: 'indigo', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60', name: 'Code Dark' },
];

export default function LessonManagement() {
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
  const [activeTermTab, setActiveTermTab] = useState('All');

  // Modals & Forms State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', lessonNumber: '', image: '', term: 1 });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', topics: '' });

  const [linkForm, setLinkForm] = useState({ title: '', description: '', url: '' });
  const [isFileShared, setIsFileShared] = useState(false);
  const [isLinkShared, setIsLinkShared] = useState(false);
  const [sharedLinkForm, setSharedLinkForm] = useState({ title: '', description: '', url: '' });

  const fileInputRef = useRef(null);

  const [moduleUploadingFile, setModuleUploadingFile] = useState(null);
  const [moduleProgress, setModuleProgress] = useState(0);

  const [sharedUploadingFile, setSharedUploadingFile] = useState(null);
  const [sharedProgress, setSharedProgress] = useState(0);

  const [pendingModuleFile, setPendingModuleFile] = useState(null);
  const [customModuleTitle, setCustomModuleTitle] = useState('');
  const [customModuleDescription, setCustomModuleDescription] = useState('');

  const [pendingSharedFile, setPendingSharedFile] = useState(null);
  const [customSharedTitle, setCustomSharedTitle] = useState('');
  const [customSharedDescription, setCustomSharedDescription] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    type: '', // 'lesson' | 'module' | 'resource'
    id: null,
    title: '',
    message: ''
  });

  // Fetch all data from database on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // 1. Fetch Lessons
      const lessonsRes = await fetch('/api/lessons');
      const lessonsData = await lessonsRes.json();

      // Seed if database has 0 lessons
      if (!lessonsData || lessonsData.length === 0) {
        console.log('Database empty, seeding curriculum...');
        await seedDatabase();
        return;
      }
      setLessons(lessonsData);

      // 2. Fetch Modules
      const modulesRes = await fetch('/api/modules');
      const modulesData = await modulesRes.json();
      setModules(modulesData);

      // 3. Fetch Resources
      const resourcesRes = await fetch('/api/resources');
      const resourcesData = await resourcesRes.json();
      setResources(resourcesData);
    } catch (err) {
      console.error('Error fetching database values:', err);
    }
  };

  const handleDownloadResource = async (res) => {
    try {
      const response = await fetch(`/api/resources/${res._id || res.id}`);
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

  async function seedDatabase() {
    try {
      const seedLessons = [
        {
          lessonNumber: 1,
          title: 'Information and Communication Technology',
          description: 'Learn basic ICT concepts, its historical evolution, real-world applications, and emerging digital trends.',
          image: PRESET_COVERS[0].url,
          term: 1
        },
        {
          lessonNumber: 2,
          title: 'Fundamentals of a Computer System',
          description: 'Explore hardware, software, processing units, storage layouts, and primary memory components.',
          image: PRESET_COVERS[1].url,
          term: 1
        },
        {
          lessonNumber: 3,
          title: 'Logic Gates with Boolean Functions',
          description: 'Study logic gate operations (AND, OR, NOT), construct truth tables, and analyze digital circuit logic.',
          image: PRESET_COVERS[2].url,
          term: 2
        }
      ];

      // POST Lessons
      const savedLessons = [];
      for (const l of seedLessons) {
        const res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(l)
        });
        const data = await res.json();
        savedLessons.push(data);
      }

      // POST Modules
      const seedModules = [
        { lessonId: savedLessons[0]._id, title: 'Introduction to ICT', topics: ['Definition of ICT', 'Data vs Information', 'Curriculum overview'] },
        { lessonId: savedLessons[0]._id, title: 'Applications of ICT', topics: ['ICT in Education', 'ICT in Medicine', 'Business applications'] },
        { lessonId: savedLessons[1]._id, title: 'Hardware & Inner Workings', topics: ['Central Processing Unit (CPU)', 'Input devices', 'Output systems'] },
        { lessonId: savedLessons[1]._id, title: 'Storage & Memory Systems', topics: ['RAM & ROM', 'Secondary storage media', 'Cache efficiency'] },
        { lessonId: savedLessons[2]._id, title: 'Basic Logic Operations', topics: ['AND, OR, NOT Gate circuits', 'Truth table formulas'] }
      ];

      const savedModules = [];
      for (const m of seedModules) {
        const res = await fetch('/api/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m)
        });
        const data = await res.json();
        savedModules.push(data);
      }

      // POST Resources
      const seedResources = [
        { moduleId: savedModules[0]._id, title: 'Introduction to ICT Basics.pdf', type: 'PDF', size: '2.4 MB', url: 'https://example.com/outline.pdf' },
        { moduleId: savedModules[0]._id, title: 'Weekly Lecture Recording.mp4', type: 'Video', size: '142 MB', url: 'https://example.com/recording.mp4' },
        { moduleId: savedModules[0]._id, title: 'E-Learning Portal Guide', type: 'Link', size: '', url: 'https://example.com' },
        { moduleId: savedModules[2]._id, title: 'Hardware Architecture Slides.pptx', type: 'Presentation', size: '14.5 MB', url: 'https://example.com/slides.pptx' },
        { moduleId: savedModules[2]._id, title: 'Inner Workings CPU.docx', type: 'Document', size: '420 KB', url: 'https://example.com/docs.docx' },
        { moduleId: savedModules[4]._id, title: 'Logicly Circuit Simulator', type: 'Link', size: '', url: 'https://logic.ly/demo' },
        { lessonId: savedLessons[0]._id, title: 'General ICT Outline.pdf', type: 'PDF', size: '1.2 MB', url: 'https://example.com/general.pdf' }
      ];

      for (const r of seedResources) {
        await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r)
        });
      }

      // Refresh final datasets
      const freshLessonsRes = await fetch('/api/lessons');
      const freshLessons = await freshLessonsRes.json();
      setLessons(freshLessons);

      const freshModulesRes = await fetch('/api/modules');
      const freshModules = await freshModulesRes.json();
      setModules(freshModules);

      const freshResourcesRes = await fetch('/api/resources');
      const freshResources = await freshResourcesRes.json();
      setResources(freshResources);
    } catch (err) {
      console.error('Error seeding DB values:', err);
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
        image: lesson.image || '',
        term: lesson.term || 1
      });
    } else {
      setEditingLesson(null);
      // Auto-increment lesson number suggestion
      const maxNum = lessons.reduce((max, l) => l.lessonNumber > max ? l.lessonNumber : max, 0);
      setLessonForm({
        title: '',
        description: '',
        lessonNumber: maxNum + 1,
        image: '',
        term: 1
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    try {
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description,
        lessonNumber: Number(lessonForm.lessonNumber),
        image: lessonForm.image,
        term: Number(lessonForm.term)
      };

      if (editingLesson) {
        await fetch(`/api/lessons/${editingLesson._id || editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowLessonModal(false);
      setEditingLesson(null);
      await fetchData();
    } catch (err) {
      console.error('Save lesson failed:', err);
    }
  };

  const handleLessonImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLessonForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLesson = (lessonId, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      show: true,
      type: 'lesson',
      id: lessonId,
      title: 'Delete Lesson Card',
      message: 'Are you sure you want to delete this Lesson? All its modules and resources will be permanently removed.'
    });
  };

  // --- CRUD: MODULES ---
  const handleOpenModuleModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description || '',
        topics: module.topics.join(', ')
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        description: '',
        topics: ''
      });
    }
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    const activeLId = activeLesson?._id || activeLesson?.id;
    if (!moduleForm.title.trim() || !activeLId) return;

    const parsedTopics = moduleForm.topics
      ? moduleForm.topics.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    try {
      const payload = {
        title: moduleForm.title,
        description: moduleForm.description || '',
        topics: parsedTopics,
        lessonId: activeLId
      };

      if (editingModule) {
        await fetch(`/api/modules/${editingModule._id || editingModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowModuleModal(false);
      setEditingModule(null);
      await fetchData();
    } catch (err) {
      console.error('Save module failed:', err);
    }
  };

  const handleDeleteModule = (moduleId, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      show: true,
      type: 'module',
      id: moduleId,
      title: 'Delete Module Card',
      message: 'Are you sure you want to delete this Module? All its uploaded resources will be lost.'
    });
  };

  // --- CRUD: RESOURCES ---
  const handleAddLinkResource = async (e) => {
    e.preventDefault();
    const activeMId = activeModule?._id || activeModule?.id;
    const activeLId = activeLesson?._id || activeLesson?.id;
    if (!linkForm.title.trim() || !linkForm.url.trim() || !activeMId) return;

    let formattedUrl = linkForm.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Auto-detect video link
    const isVideoUrl = /youtube\.com|youtu\.be|vimeo\.com|streamable\.com|\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(formattedUrl);
    const resolvedType = isVideoUrl ? 'Video' : 'Link';

    try {
      const payload = {
        title: linkForm.title.trim(),
        description: linkForm.description ? linkForm.description.trim() : '',
        type: resolvedType,
        size: '',
        url: formattedUrl,
        moduleId: isLinkShared ? null : activeMId,
        lessonId: isLinkShared ? activeLId : null
      };

      await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setLinkForm({ title: '', description: '', url: '' });
      setIsLinkShared(false);
      await fetchData();
    } catch (err) {
      console.error('Create link resource failed:', err);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const file = filesList[0];

    // File size check: MongoDB document size limit is 16MB. Restrict to 12MB.
    if (file.size > 12 * 1024 * 1024) {
      alert("File size exceeds the 12MB database limit. To save space and ensure reliable performance, please upload a smaller file, or add it as a link reference using the form below.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPendingModuleFile(file);
    setCustomModuleTitle(file.name);
  };

  const startModuleFileUpload = () => {
    if (!pendingModuleFile || !customModuleTitle.trim()) return;

    const file = pendingModuleFile;
    const saveTitle = customModuleTitle.trim();
    const activeMId = activeModule?._id || activeModule?.id;
    const activeLId = activeLesson?._id || activeLesson?.id;
    if (!activeMId) return;

    setPendingModuleFile(null);
    setModuleUploadingFile(saveTitle);
    setModuleProgress(5);

    // Simulate progress updates
    const interval = setInterval(() => {
      setModuleProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    const extension = file.name.split('.').pop().toLowerCase();

    let type = 'Document';
    if (extension === 'pdf') type = 'PDF';
    else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) type = 'Video';
    else if (['pptx', 'ppt'].includes(extension)) type = 'Presentation';
    else if (['docx', 'doc'].includes(extension)) type = 'Document';

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = sizeInMB === '0.0' ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          title: saveTitle,
          description: customModuleDescription ? customModuleDescription.trim() : '',
          type: type,
          size: sizeStr,
          url: reader.result, // base64 payload
          moduleId: isFileShared ? null : activeMId,
          lessonId: isFileShared ? activeLId : null
        };

        await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(interval);
        setModuleProgress(100);

        setTimeout(async () => {
          setModuleUploadingFile(null);
          setModuleProgress(0);
          setIsFileShared(false);
          setCustomModuleTitle('');
          setCustomModuleDescription('');
          await fetchData();
        }, 500);

      } catch (err) {
        clearInterval(interval);
        setModuleUploadingFile(null);
        setModuleProgress(0);
        console.error('File upload failed:', err);
        alert('File upload failed. Please try again.');
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startSharedFileUpload = () => {
    if (!pendingSharedFile || !customSharedTitle.trim() || !activeLesson) return;

    const file = pendingSharedFile;
    const saveTitle = customSharedTitle.trim();
    const activeLessonIdStr = activeLesson._id || activeLesson.id;

    setPendingSharedFile(null);
    setSharedUploadingFile(saveTitle);
    setSharedProgress(5);

    // Simulate progress
    const interval = setInterval(() => {
      setSharedProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    const extension = file.name.split('.').pop().toLowerCase();
    let type = 'Document';
    if (extension === 'pdf') type = 'PDF';
    else if (['mp4', 'mov', 'avi'].includes(extension)) type = 'Video';
    else if (['pptx', 'ppt'].includes(extension)) type = 'Presentation';
    else if (['docx', 'doc'].includes(extension)) type = 'Document';

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = sizeInMB === '0.0' ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          title: saveTitle,
          description: customSharedDescription ? customSharedDescription.trim() : '',
          type: type,
          size: sizeStr,
          url: reader.result,
          moduleId: null,
          lessonId: activeLessonIdStr
        };
        await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(interval);
        setSharedProgress(100);

        setTimeout(async () => {
          setSharedUploadingFile(null);
          setSharedProgress(0);
          setCustomSharedTitle('');
          setCustomSharedDescription('');
          await fetchData();
        }, 500);

      } catch (err) {
        clearInterval(interval);
        setSharedUploadingFile(null);
        setSharedProgress(0);
        console.error('Error uploading shared file:', err);
        alert('Upload failed. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResource = (resourceId) => {
    setDeleteConfirm({
      show: true,
      type: 'resource',
      id: resourceId,
      title: 'Remove Learning Resource',
      message: 'Are you sure you want to delete this resource?'
    });
  };

  async function executeDelete() {
    const { type, id } = deleteConfirm;
    if (!id) return;

    // Close the modal instantly so it disappears immediately
    setDeleteConfirm({ show: false, type: '', id: null, title: '', message: '' });

    try {
      if (type === 'lesson') {
        await fetch(`/api/lessons/${id}`, {
          method: 'DELETE'
        });
        await fetchData();
        if (activeLesson?._id === id || activeLesson?.id === id) {
          setCurrentView('lessons');
          setActiveLesson(null);
        }
      } else if (type === 'module') {
        await fetch(`/api/modules/${id}`, {
          method: 'DELETE'
        });
        await fetchData();
        if (activeModule?._id === id || activeModule?.id === id) {
          setCurrentView('modules');
          setActiveModule(null);
        }
      } else if (type === 'resource') {
        await fetch(`/api/resources/${id}`, {
          method: 'DELETE'
        });
        await fetchData();
      }
    } catch (err) {
      console.error(`Delete ${type} failed:`, err);
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
    const filteredLessons = lessons.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTerm = activeTermTab === 'All' || l.term === Number(activeTermTab);
      return matchesSearch && matchesTerm;
    });

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

        {/* Term Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['All', '1', '2', '3'].map((term) => (
            <button
              key={term}
              onClick={() => setActiveTermTab(term)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                ${(term === 'All' ? activeTermTab === 'All' : Number(activeTermTab) === Number(term))
                  ? 'bg-indigo-55/90 text-[#3b28cc] bg-indigo-50 border border-indigo-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
            >
              {term === 'All' ? 'All Terms' : `Term 0${term}`}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => {
            const lessonIdStr = lesson._id || lesson.id;
            const moduleCount = modules.filter(m => m.lessonId === lessonIdStr).length;
            return (
              <div
                key={lessonIdStr}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col group"
              >
                {/* Cover Photo */}
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

                  {/* Lesson Number Tag */}
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-indigo-750 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Lesson {String(lesson.lessonNumber).padStart(2, '0')}
                  </span>

                  {/* Term Tag */}
                  <span className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Term {lesson.term || 1}
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
                      onClick={(e) => handleDeleteLesson(lessonIdStr, e)}
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
                      className="flex-1 text-center bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 text-slate-700 hover:text-indigo-600 font-bold py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer"
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
            <h4 className="font-bold text-slate-750 group-hover:text-indigo-600 text-sm">Add New Lesson</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Create a new structural syllabus block</p>
          </div>
        </div>
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

        {/* Shared Lesson Resources Section */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-50 pb-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <FiGlobe className="text-indigo-600" />
              Shared Lesson Resources (Applies to all modules)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Files and links in this section are automatically made available to all modules under this lesson.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Forms Column (Left) */}
            <div className="lg:col-span-1 space-y-6">

              {/* File Uploader */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-5 text-center flex flex-col items-center justify-center w-full">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
                  <FiUploadCloud className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-750 text-xs">Upload Shared File</h4>

                {sharedUploadingFile ? (
                  // PROGRESS STATE
                  <div className="w-full mt-2 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600 truncate max-w-full">
                      Uploading: {sharedUploadingFile}
                    </p>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-155"
                        style={{ width: `${sharedProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600">
                      {sharedProgress}% {sharedProgress === 100 ? 'Completed!' : 'Uploading...'}
                    </span>
                  </div>
                ) : pendingSharedFile ? (
                  // RENAME / CONFIRM STATE
                  <div className="w-full mt-2 space-y-2 text-left">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Selected File</p>
                      <p className="text-xs font-semibold text-slate-750 truncate">{pendingSharedFile.name}</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-455 uppercase mb-0.5">Save File Title As</label>
                      <input
                        type="text"
                        value={customSharedTitle}
                        onChange={(e) => setCustomSharedTitle(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-455 uppercase mb-0.5">File Subtitle / Description</label>
                      <input
                        type="text"
                        placeholder="Optional short subtitle"
                        value={customSharedDescription}
                        onChange={(e) => setCustomSharedDescription(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-300 bg-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setPendingSharedFile(null); setCustomSharedTitle(''); setCustomSharedDescription(''); }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={startSharedFileUpload}
                        className="flex-1 bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  // CHOOSE FILE STATE
                  <>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-4 max-w-[170px]">PDF, DOCX, PPTX, MP4 up to 50MB files</p>

                    <input
                      type="file"
                      id="shared-file-picker"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file || !activeLessonIdStr) return;

                        // File size check: MongoDB document size limit is 16MB. Restrict to 12MB.
                        if (file.size > 12 * 1024 * 1024) {
                          alert("File size exceeds the 12MB database limit. To save space and ensure reliable performance, please upload a smaller file, or add it as a link reference using the form below.");
                          e.target.value = '';
                          return;
                        }

                        setPendingSharedFile(file);
                        setCustomSharedTitle(file.name);
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="shared-file-picker"
                      className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center block"
                    >
                      Choose & Upload File
                    </label>
                  </>
                )}
              </div>

              {/* Add Shared Link Form */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-5">
                <h4 className="font-bold text-slate-750 text-xs mb-3 flex items-center gap-1.5">
                  <FiLink className="text-indigo-600" />
                  Add Shared Link
                </h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!sharedLinkForm.title.trim() || !sharedLinkForm.url.trim() || !activeLessonIdStr) return;
                    let url = sharedLinkForm.url.trim();
                    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

                    // Auto-detect video link
                    const isVideoUrl = /youtube\.com|youtu\.be|vimeo\.com|streamable\.com|\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
                    const resolvedType = isVideoUrl ? 'Video' : 'Link';

                    try {
                      const payload = {
                        title: sharedLinkForm.title.trim(),
                        description: sharedLinkForm.description ? sharedLinkForm.description.trim() : '',
                        type: resolvedType,
                        size: '',
                        url: url,
                        moduleId: null,
                        lessonId: activeLessonIdStr
                      };
                      await fetch('/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      });
                      setSharedLinkForm({ title: '', description: '', url: '' });
                      await fetchData();
                    } catch (err) {
                      console.error('Error adding shared link:', err);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Link Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Logic Circuit Simulator"
                      value={sharedLinkForm.title}
                      onChange={(e) => setSharedLinkForm({ ...sharedLinkForm, title: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Link Subtitle / Description</label>
                    <input
                      type="text"
                      placeholder="Optional short subtitle"
                      value={sharedLinkForm.description}
                      onChange={(e) => setSharedLinkForm({ ...sharedLinkForm, description: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Link URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://logic.ly"
                      value={sharedLinkForm.url}
                      onChange={(e) => setSharedLinkForm({ ...sharedLinkForm, url: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-300 bg-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full border border-indigo-150 hover:bg-indigo-50/50 text-indigo-750 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Save Shared Link
                  </button>
                </form>
              </div>

            </div>

            {/* List Column (Right) */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Existing Shared Materials</label>

              {resources.filter(r => r.lessonId === activeLessonIdStr).length > 0 ? (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {resources.filter(r => r.lessonId === activeLessonIdStr).map(res => {
                    const style = getResourceDetails(res.type);
                    const resourceIdStr = res._id || res.id;
                    return (
                      <div key={resourceIdStr} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all bg-slate-50/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs ${style.colorClass}`}>
                            {style.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-xs truncate max-w-[200px]" title={res.title}>
                              {res.title}
                            </h4>
                            {res.description && (
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{res.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {res.type} {res.size ? `• ${res.size}` : ''}
                              </span>
                              {res.url && (
                                res.type === 'Link' ? (
                                  <a
                                    href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                                  >
                                    Open in Website
                                    <FiExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : res.type === 'Video' && (!res.size || /youtube\.com|youtu\.be/i.test(res.url)) ? (
                                  <a
                                    href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                                  >
                                    View in YouTube
                                    <FiExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadResource(res)}
                                    className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 bg-transparent border-none cursor-pointer p-0"
                                  >
                                    Download File
                                    <FiExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteResource(resourceIdStr)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Shared Resource"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-450 bg-slate-50/50">
                  <FiFolder className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                  <p className="text-xs font-semibold">No lesson-wide shared materials yet.</p>
                  <p className="text-[10px] text-slate-350 mt-0.5">Use the upload box or link form on the left to add items.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modules Grid */}
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
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Module Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                      Module
                    </span>
                    <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug mt-1.5">{module.title}</h3>
                    {module.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{module.description}</p>
                    )}
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
                      onClick={(e) => handleDeleteModule(moduleIdStr, e)}
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
            <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 text-sm">Add New Module</h4>
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

    const activeLessonIdStr = activeLesson?._id || activeLesson?.id;
    const activeModuleIdStr = activeModule?._id || activeModule?.id;

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
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col items-center text-center w-full">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-750 text-sm">Upload Material File</h4>

              {moduleUploadingFile ? (
                // LOADING PROGRESS STATE
                <div className="w-full mt-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-600 truncate max-w-full">
                    Uploading: {moduleUploadingFile}
                  </p>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative border border-slate-100">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${moduleProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {moduleProgress}% {moduleProgress === 100 ? 'Completed!' : 'Uploading...'}
                  </span>
                </div>
              ) : pendingModuleFile ? (
                // RENAME / CONFIRM STATE
                <div className="w-full mt-3 space-y-3 text-left">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Selected File</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{pendingModuleFile.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Save File Title As</label>
                    <input
                      type="text"
                      value={customModuleTitle}
                      onChange={(e) => setCustomModuleTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 bg-slate-50/55"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">File Subtitle / Description</label>
                    <input
                      type="text"
                      placeholder="Optional short subtitle"
                      value={customModuleDescription}
                      onChange={(e) => setCustomModuleDescription(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 bg-slate-50/55"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPendingModuleFile(null); setCustomModuleTitle(''); setCustomModuleDescription(''); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startModuleFileUpload}
                      className="flex-1 bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              ) : (
                // DEFAULT CHOOSE FILE STATE
                <>
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

                  <label className="flex items-center gap-2 mt-4 cursor-pointer select-none text-xs font-semibold text-slate-600 justify-center">
                    <input
                      type="checkbox"
                      checked={isFileShared}
                      onChange={(e) => setIsFileShared(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    Share across all modules
                  </label>
                </>
              )}
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
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Resource Subtitle / Description</label>
                  <input
                    type="text"
                    placeholder="Optional short subtitle"
                    value={linkForm.description}
                    onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 bg-slate-50/50"
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
                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    type="checkbox"
                    id="share-link-checkbox"
                    checked={isLinkShared}
                    onChange={(e) => setIsLinkShared(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="share-link-checkbox" className="text-xs font-semibold text-slate-600 cursor-pointer">
                    Share across all modules
                  </label>
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
                      ? 'bg-indigo-55/90 text-[#3b28cc] bg-indigo-50 border border-indigo-100'
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
                  const resourceIdStr = res._id || res.id;
                  return (
                    <div
                      key={resourceIdStr}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:border-slate-200 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon Wrapper */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style.colorClass}`}>
                          {style.icon}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-855 text-xs sm:text-sm truncate pr-2">
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
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-0.5">
                                <FiGlobe className="w-2.5 h-2.5" />
                                Shared (Lesson-wide)
                              </span>
                            )}
                            {res.size && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                {res.size}
                              </span>
                            )}
                            {res.url && (
                              res.type === 'Link' ? (
                                <a
                                  href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  Open in Website
                                  <FiExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : res.type === 'Video' && (!res.size || /youtube\.com|youtu\.be/i.test(res.url)) ? (
                                <a
                                  href={/^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  View in YouTube
                                  <FiExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleDownloadResource(res)}
                                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 bg-transparent border-none cursor-pointer p-0"
                                >
                                  Download File
                                  <FiExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteResource(resourceIdStr)}
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
            {currentView === 'lessons' ? 'Lesson Management' : currentView === 'modules' ? 'Module Management' : 'Resources Upload'}
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
              <div className="grid grid-cols-4 gap-4">
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
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Term</label>
                  <select
                    value={lessonForm.term}
                    onChange={(e) => setLessonForm({ ...lessonForm, term: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 font-bold cursor-pointer"
                    required
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                  </select>
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

              {/* Device Cover Image selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Lesson Cover Image</label>
                <div className="flex items-center gap-4">
                  {lessonForm.image ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-250 bg-slate-50 shrink-0">
                      <img src={lessonForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLessonForm(prev => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 text-white rounded-full p-1 leading-none shadow-sm transition-colors text-[9px] w-4.5 h-4.5 flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-450 bg-slate-50 text-[10px] text-center font-bold px-1 shrink-0">
                      No Image
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      id="lesson-cover-picker"
                      onChange={handleLessonImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="lesson-cover-picker"
                      className="inline-flex items-center justify-center gap-2 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm w-full"
                    >
                      <FiUploadCloud className="w-4 h-4 text-indigo-600" />
                      Choose Image File
                    </label>
                    <span className="block text-[10px] text-slate-400 mt-1">Recommended: PNG or JPG (approx 16:9 ratio)</span>
                  </div>
                </div>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Module Subtitle / Description</label>
                <textarea
                  placeholder="Enter module description or subtitle..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-300 outline-none bg-slate-50/55 min-h-[60px]"
                  rows="2"
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

      {/* Modal: DELETE CONFIRMATION */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                <FiTrash2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                  {deleteConfirm.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  {deleteConfirm.message}
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ show: false, type: '', id: null, title: '', message: '' })}
                  className="flex-1 border border-slate-200 hover:border-slate-350 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-none shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
