import { useState } from 'react';
import { FiMessageSquare, FiTrendingUp, FiPlus, FiFileText, FiLink, FiPlay } from 'react-icons/fi';
import { TbMessageReport, TbFlag, TbChevronUp, TbChevronDown } from 'react-icons/tb';

export default function CommunityMonitor() {
  const [activeTab, setActiveTab] = useState('Unanswered'); // Default matches unanswered highlighted in mockup

  const [flaggedPosts, setFlaggedPosts] = useState([
    {
      id: 1,
      text: '"Is it okay to use ChatGPT for the calculus final."',
      course: 'Calculus 101',
    }
  ]);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      votes: 14,
      subject: 'PHYSICS 202',
      subjectClass: 'bg-teal-50 text-teal-700 border-teal-150',
      student: 'Student ID #892',
      time: '2 hours ago',
      title: 'Clarification needed on Maxwell\'s Equations in non-vacuum media',
      body: 'I\'m struggling to understand how the permittivity and permeability constants change when we move from a vacuum to a dielectric material like glass. Does it',
      replies: 2,
    },
    {
      id: 2,
      votes: 8,
      subject: 'LITERATURE 101',
      subjectClass: 'bg-purple-50 text-purple-700 border-purple-150',
      student: 'Student ID #142',
      time: '5 hours ago',
      title: 'Theme of isolation in Frankenstein vs modern digital age',
      body: 'For the upcoming essay, would it be acceptable to draw parallels between the creature\'s isolation in the novel and the isolation experienced by youth heavily...',
      replies: 0,
    }
  ]);

  const handleVote = (id, amount) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, votes: q.votes + amount } : q));
  };

  const handleDismissFlag = (id) => {
    setFlaggedPosts(flaggedPosts.filter((p) => p.id !== id));
    alert('Post sent for review.');
  };

  const handleProvideGuidance = (title) => {
    alert(`Opening interface to provide guidance on: "${title}"`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Teacher Lounge</h1>
          <p className="text-slate-500 text-base max-w-3xl leading-relaxed">
            Connect with peers, moderate student discussions, and share academic resources in your dedicated community hub.
          </p>
        </div>
        
        <button 
          onClick={() => alert('New faculty discussion thread...')}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
        >
          <FiMessageSquare className="w-4 h-4 text-indigo-600" />
          New Discussion
        </button>
      </div>

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
                    {flaggedPosts.length} student posts have been flagged by the system for faculty review regarding academic integrity.
                  </p>
                </div>

                {flaggedPosts.map((post) => (
                  <div key={post.id} className="bg-slate-50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      <p className="text-xs text-slate-700 font-medium truncate">{post.text}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {post.course}
                      </span>
                      <button 
                        onClick={() => handleDismissFlag(post.id)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors"
                      >
                        Review
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
              <h2 className="text-xl font-bold text-slate-900">Academic Q&A</h2>
              
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
                      ? 'bg-indigo-55/90 text-[#3b28cc] bg-indigo-50 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Unanswered
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                  
                  {/* Upvote controller */}
                  <div className="flex flex-col items-center bg-slate-50 border border-slate-200/50 rounded-xl p-1.5 shrink-0">
                    <button 
                      onClick={() => handleVote(q.id, 1)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    >
                      <TbChevronUp className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 my-0.5">{q.votes}</span>
                    <button 
                      onClick={() => handleVote(q.id, -1)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    >
                      <TbChevronDown className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${q.subjectClass}`}>
                        {q.subject}
                      </span>
                      <span className="text-slate-400 text-xs">Asked by {q.student} • {q.time}</span>
                    </div>

                    {/* Question Title & Description */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      {q.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {q.body}
                    </p>

                    {/* Action Row */}
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                        <FiMessageSquare className="w-4 h-4 text-slate-400" />
                        {q.replies} Answers
                      </div>
                      
                      <button 
                        onClick={() => handleProvideGuidance(q.title)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors"
                      >
                        Provide Guidance
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidecards) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Trending Topics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-600" /> Trending Topics
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {['#MidtermPrep', '#AI_in_Education', '#LabSafety Protocol', '#SyllabusUpdate', '#PeerReview'].map((tag) => (
                <span 
                  key={tag}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-semibold cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Faculty Discussions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5">Faculty Discussions</h3>
            
            <div className="space-y-4 flex-1">
              {/* Row 1 */}
              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  JD
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-800 text-[13px] leading-snug group-hover:text-indigo-600 transition-colors truncate">
                    Best practices for hybrid seminar attendance?
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">12 Replies • Last active 10m ago</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-3 group cursor-pointer border-t border-slate-50 pt-4">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  SL
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-800 text-[13px] leading-snug group-hover:text-indigo-600 transition-colors truncate">
                    Integrating new research tool into the core syllabus
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">5 Replies • Last active 1h ago</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert('Viewing all faculty discussions...')}
              className="w-full mt-6 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors text-center"
            >
              View All Discussions
            </button>
          </div>

          {/* Shared Resources (Gradient Card) */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#e6f7f8] to-[#f0f1fa] shadow-sm relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Shared Resources
                </h3>
                <button 
                  onClick={() => alert('Add new shared resource...')}
                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-50 text-indigo-600 flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File 1 */}
                <div className="flex items-center gap-3 bg-white/70 hover:bg-white rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow border border-white/50">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <FiFileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-[12px] leading-snug truncate">2024 Academic Integrity Policy.pdf</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Added by Admin</p>
                  </div>
                </div>

                {/* File 2 */}
                <div className="flex items-center gap-3 bg-white/70 hover:bg-white rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow border border-white/50">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <FiPlay className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-[12px] leading-snug truncate">Template: Interactive Lecture Decl</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Added by Dr. Smith</p>
                  </div>
                </div>

                {/* File 3 */}
                <div className="flex items-center gap-3 bg-white/70 hover:bg-white rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow border border-white/50">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                    <FiLink className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-[12px] leading-snug truncate">Database of approved citation toc</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">External Link</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
