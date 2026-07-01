import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import CommonCommunityChat from '../../components/dashboard/CommonCommunityChat';
import communityBannerImg from '../../assets/community_banner.png';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiFilter, FiTrendingUp, FiShield, FiMoreHorizontal, FiMessageSquare, FiShare2, FiBookmark, FiX, FiFlag, FiSend, FiMessageCircle } from 'react-icons/fi';
import { BiUpvote, BiDownvote } from 'react-icons/bi';

export default function CommunityHub() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('community');
  const [hubMode, setHubMode] = useState('discussions'); // 'discussions' | 'messages'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Thread states
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const exactModuleTopics = [
    'Module 1.1: Introduction to ICT',
    'Module 1.2: Applications of ICT in daily life',
    'Module 1.3: Benefits and challenges of ICT',
    'Module 2.1: Computer concepts',
    'Module 2.2: Hardware components',
    'Module 2.3: Storage devices',
    'Module 3.1: Number systems',
    'Module 3.2: Decimal, Octal, and Hexadecimal systems',
    'Module 3.3: Character representation',
    'Module 4.1: Introduction to digital logic',
    'Module 4.2: AND, OR, NOT gates',
    'Module 4.3: Boolean expressions',
    'Module 5.1: Introduction to operating systems',
    'Module 5.2: File and folder management',
    'Module 5.3: Utility software',
    'Module 6.1: Introduction to word processing',
    'Module 6.2: Formatting text and pages',
    'Module 6.3: Advanced features',
    'Module 7.1: Spreadsheet basics',
    'Module 7.2: Data entry and formatting',
    'Module 7.3: Charts and data analysis',
    'Module 8.1: Introduction to presentations',
    'Module 8.2: Themes, layouts, and formatting',
    'Module 8.3: Slide transitions and animations',
    'Module 9.1: Introduction to databases',
    'Module 9.2: Tables, records, and fields',
    'Module 9.3: Queries, forms, and reports'
  ];

  const [systemModules, setSystemModules] = useState(exactModuleTopics);
  const [newPostCourse, setNewPostCourse] = useState('Module 1.1: Introduction to ICT');
  const [newPostTags, setNewPostTags] = useState('Homework, Help Needed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error loading community posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemModules = async () => {
    setSystemModules(exactModuleTopics);
  };

  useEffect(() => {
    fetchPosts();
    fetchSystemModules();
  }, []);

  const handleVote = async (postId, voteType) => {
    try {
      const res = await fetch(`/api/community/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteType,
          userId: user?.username || 'student_user'
        })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle,
          body: newPostBody,
          course: newPostCourse,
          tags: newPostTags.split(',').map(t => t.trim()),
          authorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Student Contributor',
          authorRole: 'student',
          authorAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.username || 'student')}`
        })
      });

      if (res.ok) {
        const created = await res.json();
        setPosts([created, ...posts]);
        setShowNewPostModal(false);
        setNewPostTitle('');
        setNewPostBody('');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (postId) => {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/community/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          authorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Peer Student',
          authorRole: 'student',
          authorAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.username || 'peer')}`
        })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        setReplyInputs({ ...replyInputs, [postId]: '' });
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  const handleFlagPost = async (postId) => {
    const reason = prompt('Reason for flagging this post for faculty review:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/community/${postId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert('Post flagged for teacher review.');
        fetchPosts(activeFilter);
      }
    } catch (err) {
      console.error('Error flagging post:', err);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Community Hub</h1>
              <p className="text-slate-500 text-base max-w-2xl">
                Connect with peers, ask academic questions, and communicate in the shared community platform.
              </p>
            </div>
            {hubMode === 'discussions' && (
              <button 
                onClick={() => setShowNewPostModal(true)}
                className="bg-[#3b28cc] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
              >
                <FiEdit className="w-4 h-4" />
                New Post
              </button>
            )}
          </div>

          {/* Top Mode Selector Tabs */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-8 max-w-md border border-slate-200/80">
            <button
              onClick={() => setHubMode('discussions')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2
                ${hubMode === 'discussions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📢 Public Discussions
            </button>
            <button
              onClick={() => setHubMode('messages')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2
                ${hubMode === 'messages' ? 'bg-[#3b28cc] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              💬 Common Platform Stream
            </button>
          </div>

          {hubMode === 'messages' ? (
            <CommonCommunityChat />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Column (Main Content) */}
              <div className="flex-1 space-y-6">
                
                {/* Feed List */}
                {isLoading ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-100">
                    Loading discussion threads...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-100">
                    No discussions found in this section. Click "New Post" to start one!
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={post.authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(post.authorName)}`} 
                            alt={post.authorName} 
                            className="w-10 h-10 rounded-full border border-slate-100" 
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-[15px]">{post.authorName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                ${post.authorRole === 'teacher' ? 'bg-teal-600 text-white flex items-center gap-1' : 'bg-indigo-50 text-indigo-600'}`}
                              >
                                {post.authorRole === 'teacher' && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                )}
                                {post.authorRole === 'teacher' ? 'Instructor' : 'Student'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'} in <span className="font-medium text-indigo-600">{post.course}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleFlagPost(post._id)}
                            title="Flag for faculty review"
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <FiFlag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{post.title}</h3>
                      <p className="text-slate-600 text-[15px] mb-4 leading-relaxed whitespace-pre-line">{post.body}</p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                            <button 
                              onClick={() => handleVote(post._id, 'up')}
                              className={`p-2 hover:bg-slate-200 rounded-l-full transition-colors cursor-pointer ${post.upvotedBy?.includes(user?.username) ? 'text-indigo-600 font-bold' : ''}`}
                            >
                              <BiUpvote className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-700 px-1 min-w-[1.5rem] text-center">{post.votes || 0}</span>
                            <button 
                              onClick={() => handleVote(post._id, 'down')}
                              className="p-2 hover:bg-slate-200 rounded-r-full transition-colors cursor-pointer"
                            >
                              <BiDownvote className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>

                          <button 
                            onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-semibold cursor-pointer"
                          >
                            <FiMessageSquare className="w-4 h-4" />
                            {post.replies ? post.replies.length : 0} Answers
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiShare2 className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiBookmark className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Expandable Discussion & Replies Thread */}
                      {expandedPostId === post._id && (
                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 bg-slate-50/50 p-4 rounded-xl">
                          <h4 className="font-bold text-slate-800 text-sm">Discussion Answers & Peer Support</h4>
                          
                          {post.replies && post.replies.length > 0 ? (
                            post.replies.map((reply, index) => (
                              <div key={index} className={`p-4 rounded-xl border ${reply.authorRole === 'teacher' ? 'bg-teal-50/70 border-teal-200' : 'bg-white border-slate-200/70'} shadow-sm`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-bold text-slate-900 text-xs">{reply.authorName}</span>
                                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${reply.authorRole === 'teacher' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {reply.authorRole === 'teacher' ? 'Official Guidance' : 'Peer'}
                                  </span>
                                  <span className="text-[11px] text-slate-400 ml-auto">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">{reply.text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No answers submitted yet. Be the first to help!</p>
                          )}

                          {/* Submit Peer Answer Box */}
                          <div className="flex items-center gap-2 mt-4 pt-2">
                            <input 
                              type="text" 
                              placeholder="Write a helpful peer response..."
                              value={replyInputs[post._id] || ''}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [post._id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400"
                            />
                            <button 
                              onClick={() => handleAddReply(post._id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <FiSend className="w-3 h-3" /> Answer
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))
                )}

              </div>

              {/* Right Column (Sidebar Photo Card) */}
              <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden group">
                  <div className="rounded-xl overflow-hidden shadow-sm relative">
                    <img 
                      src={communityBannerImg} 
                      alt="AcademiX Collaborative Learning Community" 
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-4 flex flex-col justify-end">
                      <h4 className="text-white font-bold text-base leading-tight">Learning Community</h4>
                      <p className="text-slate-200 text-xs mt-1">Connect, collaborate & share academic knowledge.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-scaleUp">
            <button 
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Discussion Post</h2>
            <p className="text-xs text-slate-500 mb-6">Ask a question or share learning insights with your peers.</p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Module Topic</label>
                <select 
                  value={newPostCourse} 
                  onChange={(e) => setNewPostCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                >
                  {systemModules.map((topic, i) => (
                    <option key={i} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Question Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Help understanding derivative limits..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Details / Context</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Explain your question or thought process in detail..."
                  value={newPostBody}
                  onChange={(e) => setNewPostBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
                <input 
                  type="text"
                  placeholder="Calculus, Homework, Help Needed"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3b28cc] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
