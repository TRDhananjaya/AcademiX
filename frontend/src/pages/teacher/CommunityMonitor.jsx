import { useState, useEffect } from 'react';
import { FiMessageSquare, FiTrendingUp, FiPlus, FiFileText, FiLink, FiPlay, FiSend, FiX, FiCheckCircle, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { TbMessageReport, TbFlag, TbSpeakerphone } from 'react-icons/tb';
import CommonCommunityChat from '../../components/dashboard/CommonCommunityChat';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

export default function CommunityMonitor() {
  const { user } = useAuth();
  const [hubMode, setHubMode] = useState('discussions'); // 'discussions' | 'messages'
  const [activeTab, setActiveTab] = useState('Unanswered'); // 'Recent' or 'Unanswered'
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guidance modal state
  const [guidancePost, setGuidancePost] = useState(null);
  const [guidanceText, setGuidanceText] = useState('');
  const [isSubmittingGuidance, setIsSubmittingGuidance] = useState(false);

  // Delete confirmation modal state
  const [deletePostId, setDeletePostId] = useState(null);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      // Fetch flagged posts for moderation card
      const flaggedRes = await fetch('/api/community?filter=flagged');
      const flaggedData = await flaggedRes.json();
      if (Array.isArray(flaggedData)) {
        setFlaggedPosts(flaggedData);
      }

      // Fetch questions based on active tab
      const filterParam = activeTab === 'Unanswered' ? 'unanswered' : 'new';
      const qRes = await fetch(`/api/community?filter=${filterParam}`);
      const qData = await qRes.json();
      if (Array.isArray(qData)) {
        setQuestions(qData);
      }
    } catch (err) {
      console.error('Error fetching teacher community data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [activeTab]);

  const handleVote = async (id, amount) => {
    const voteType = amount > 0 ? 'up' : 'down';
    try {
      const res = await fetch(`/api/community/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, userId: 'teacher_user' })
      });
      if (res.ok) {
        const updated = await res.json();
        setQuestions(questions.map(q => q._id === id ? updated : q));
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleDismissFlag = async (id) => {
    try {
      const res = await fetch(`/api/community/${id}/dismiss-flag`, {
        method: 'POST'
      });
      if (res.ok) {
        setFlaggedPosts(flaggedPosts.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Error dismissing flag:', err);
    }
  };

  const confirmDeletePost = async () => {
    if (!deletePostId) return;
    try {
      const res = await fetch(`/api/community/${deletePostId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q._id !== deletePostId));
        setFlaggedPosts(prev => prev.filter(p => p._id !== deletePostId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setDeletePostId(null);
    }
  };

  const handleOpenGuidanceModal = (post) => {
    setGuidancePost(post);
    setGuidanceText('');
  };

  const handleSubmitGuidance = async (e) => {
    e.preventDefault();
    if (!guidancePost || !guidanceText.trim()) return;

    setIsSubmittingGuidance(true);
    try {
      const res = await fetch(`/api/community/${guidancePost._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: guidanceText.trim(),
          authorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Mr. Akila Savinda',
          authorRole: 'teacher',
          authorAvatar: user?.profilePicture || null
        })
      });

      if (res.ok) {
        setGuidancePost(null);
        setGuidanceText('');
        fetchCommunityData();
      }
    } catch (err) {
      console.error('Error submitting guidance:', err);
    } finally {
      setIsSubmittingGuidance(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Teacher Lounge</h1>
          <p className="text-slate-500 text-base max-w-3xl leading-relaxed">
            Connect with peers, moderate student discussions, and participate in the common community platform stream.
          </p>
        </div>
      </div>

      {/* Top Mode Selector Tabs */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-8 max-w-md border border-slate-200/80">
        <button
          onClick={() => setHubMode('discussions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2
            ${hubMode === 'discussions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TbSpeakerphone className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0" />
          <span>Public Q&A & Moderation</span>
        </button>
        <button
          onClick={() => setHubMode('messages')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2
            ${hubMode === 'messages' ? 'bg-[#3b28cc] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FiMessageCircle className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0" />
          <span>Common Platform Stream</span>
        </button>
      </div>

      {hubMode === 'messages' ? (
        <CommonCommunityChat />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Column (Main Moderation & Q&A) */}
          <div className="flex-1 space-y-6">

            {/* Needs Moderation Card */}
            {flaggedPosts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-l-4 border-l-red-500 border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <TbFlag className="w-5 h-5 fill-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Needs Moderation</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {flaggedPosts.length} student post{flaggedPosts.length > 1 ? 's' : ''} flagged for faculty review regarding academic integrity or conduct.
                    </p>
                  </div>

                  {flaggedPosts.map((post) => (
                    <div key={post._id} className="bg-slate-50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/60">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-800 font-bold truncate">{post.title}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">Reason: {post.flagReason || 'User flag'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {post.course}
                        </span>
                        <button
                          onClick={() => handleDismissFlag(post._id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" /> Dismiss Flag
                        </button>
                        <button
                          onClick={() => setDeletePostId(post._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Delete Post"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Q&A Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Academic Q&A & Peer Support</h2>

                <div className="flex bg-slate-100/70 p-1 rounded-xl border border-slate-200/40 gap-1">
                  <button
                    onClick={() => setActiveTab('Recent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer
                      ${activeTab === 'Recent'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setActiveTab('Unanswered')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer
                      ${activeTab === 'Unanswered'
                        ? 'bg-indigo-50 text-[#3b28cc] shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    Unanswered
                  </button>
                </div>
              </div>

              {/* Questions list */}
              {isLoading ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-100">
                  Loading student discussion threads...
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-100">
                  No student questions found in this category.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                      <div className="flex-1 min-w-0 pr-2">
                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase bg-teal-50 text-teal-700 border-teal-150">
                            {q.course || 'GENERAL'}
                          </span>
                          <span className="text-slate-400 text-xs">Asked by {q.authorName} • {q.createdAt ? new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}</span>
                        </div>

                        {/* Question Title & Description */}
                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                          {q.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed mb-4 whitespace-pre-line">
                          {q.body}
                        </p>

                        {/* Show answers list if any */}
                        {q.replies && q.replies.length > 0 && (
                          <div className="mb-4 space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Responses ({q.replies.length}):</span>
                            {q.replies.map((r, i) => (
                              <div key={i} className={`p-2.5 rounded-lg text-xs ${r.authorRole === 'teacher' ? 'bg-teal-50 border border-teal-200 font-medium' : 'bg-white border border-slate-200'}`}>
                                <span className="font-bold text-slate-800">{r.authorName} ({r.authorRole === 'teacher' ? 'Instructor' : 'Student'}):</span> {r.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Row */}
                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                            <FiMessageSquare className="w-4 h-4 text-slate-400" />
                            {q.replies ? q.replies.length : 0} Answers
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDeletePostId(q._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Delete Post"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                            <button
                              onClick={() => handleOpenGuidanceModal(q)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <FiSend className="w-3.5 h-3.5" /> Provide Guidance
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provide Guidance Modal */}
      {guidancePost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-scaleUp">
            <button
              onClick={() => setGuidancePost(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">Provide Academic Guidance</h2>
            <p className="text-xs text-slate-500 mb-4">Official response will be marked with an instructor verified badge.</p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 mb-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">{guidancePost.course}</span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{guidancePost.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{guidancePost.body}</p>
            </div>

            <form onSubmit={handleSubmitGuidance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Instructor Response</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Type your official guidance or explanation for student..."
                  value={guidanceText}
                  onChange={(e) => setGuidanceText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGuidancePost(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGuidance}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingGuidance ? 'Publishing...' : 'Publish Guidance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal using AcademiX ConfirmModal design */}
      <ConfirmModal
        isOpen={Boolean(deletePostId)}
        onClose={() => setDeletePostId(null)}
        onConfirm={confirmDeletePost}
        title="Delete Discussion Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
}
