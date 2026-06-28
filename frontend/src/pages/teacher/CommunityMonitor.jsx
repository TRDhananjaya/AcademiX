import { useState, useEffect } from 'react';
import { FiMessageSquare, FiTrendingUp, FiPlus, FiFileText, FiLink, FiPlay, FiSend, FiX, FiCheckCircle } from 'react-icons/fi';
import { TbMessageReport, TbFlag, TbChevronUp, TbChevronDown } from 'react-icons/tb';
import CommonCommunityChat from '../../components/dashboard/CommonCommunityChat';
import communityBannerImg from '../../assets/community_banner.png';

export default function CommunityMonitor() {
  const [hubMode, setHubMode] = useState('discussions'); // 'discussions' | 'messages'
  const [activeTab, setActiveTab] = useState('Unanswered'); // 'Recent' or 'Unanswered'
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guidance modal state
  const [guidancePost, setGuidancePost] = useState(null);
  const [guidanceText, setGuidanceText] = useState('');
  const [isSubmittingGuidance, setIsSubmittingGuidance] = useState(false);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      // Fetch flagged posts for moderation card
      const flaggedRes = await fetch('http://localhost:5000/api/community?filter=flagged');
      const flaggedData = await flaggedRes.json();
      if (Array.isArray(flaggedData)) {
        setFlaggedPosts(flaggedData);
      }

      // Fetch questions based on active tab
      const filterParam = activeTab === 'Unanswered' ? 'unanswered' : 'new';
      const qRes = await fetch(`http://localhost:5000/api/community?filter=${filterParam}`);
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
      const res = await fetch(`http://localhost:5000/api/community/${id}/vote`, {
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
      const res = await fetch(`http://localhost:5000/api/community/${id}/dismiss-flag`, {
        method: 'POST'
      });
      if (res.ok) {
        setFlaggedPosts(flaggedPosts.filter(p => p._id !== id));
        alert('Flag cleared and post reviewed.');
      }
    } catch (err) {
      console.error('Error dismissing flag:', err);
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
      const res = await fetch(`http://localhost:5000/api/community/${guidancePost._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: guidanceText.trim(),
          authorName: 'Dr. Sarah Jenkins',
          authorRole: 'teacher',
          authorAvatar: 'https://i.pravatar.cc/150?u=drjenkins'
        })
      });

      if (res.ok) {
        alert('Official academic guidance published successfully!');
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
          📢 Public Q&A & Moderation
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
                      
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {post.course}
                        </span>
                        <button 
                          onClick={() => handleDismissFlag(post._id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" /> Dismiss Flag
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
                      
                      {/* Upvote controller */}
                      <div className="flex flex-col items-center bg-slate-50 border border-slate-200/50 rounded-xl p-1.5 shrink-0">
                        <button 
                          onClick={() => handleVote(q._id, 1)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                        >
                          <TbChevronUp className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 my-0.5">{q.votes || 0}</span>
                        <button 
                          onClick={() => handleVote(q._id, -1)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                        >
                          <TbChevronDown className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>

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
                          
                          <button 
                            onClick={() => handleOpenGuidanceModal(q)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <FiSend className="w-3.5 h-3.5" /> Provide Guidance
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar Photo Card) */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden group">
              <div className="rounded-xl overflow-hidden shadow-sm relative">
                <img 
                  src={communityBannerImg} 
                  alt="AcademiX Faculty & Student Community" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-base leading-tight">Faculty & Student Lounge</h4>
                  <p className="text-slate-200 text-xs mt-1">Provide guidance & foster academic excellence.</p>
                </div>
              </div>
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

    </div>
  );
}
