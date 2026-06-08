import { useState } from 'react';
import Sidebar from '../../components/common/student/Sidebar';
import StudentTopBar from '../../components/dashboard/StudentTopBar';
import { FiEdit, FiFilter, FiTrendingUp, FiShield, FiMoreHorizontal, FiMessageSquare, FiShare2, FiBookmark } from 'react-icons/fi';
import { BiUpvote, BiDownvote } from 'react-icons/bi';
import { MdOutlineImage } from 'react-icons/md';

export default function CommunityHub() {
  const [activeNav, setActiveNav] = useState('community');

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="student-dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <StudentTopBar />
        
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Community Hub</h1>
              <p className="text-slate-500 text-base max-w-2xl">
                Connect with peers, ask academic questions, and participate in teacher-moderated discussions.
              </p>
            </div>
            <button className="bg-[#3b28cc] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shrink-0">
              <FiEdit className="w-4 h-4" />
              New Post
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column (Main Content) */}
            <div className="flex-1 space-y-6">
              
              {/* Filters */}
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <div className="flex gap-4 sm:gap-6 min-w-max pr-4">
                  <button className="flex items-center gap-2 text-slate-800 font-semibold text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                    <span className="text-red-500">🔥</span> Hot
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors px-3 py-1.5">
                    <span className="text-slate-400">🕒</span> New
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors px-3 py-1.5">
                    <span className="text-slate-400">📚</span> Academic Q&A
                  </button>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-2 shrink-0 border-l border-slate-100 pl-4 ml-auto">
                  <FiFilter className="w-5 h-5" />
                </button>
              </div>

              {/* Post 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Alex Chen" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-[15px]">Alex Chen</span>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Student</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">2 hours ago in <span className="font-medium text-indigo-600">Advanced Calculus</span></p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-500"><FiMoreHorizontal className="w-5 h-5" /></button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">Help understanding the Chain Rule application in multi-variable functions?</h3>
                <p className="text-slate-600 text-[15px] mb-4 leading-relaxed">
                  I'm struggling with assignment 4. When applying the chain rule to \( f(x,y) \) where both x and y are functions of t, I keep messing up the partial derivatives. Does anyone have a good mental model or visual...
                </p>
                
                <div className="inline-flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 mb-4 cursor-pointer hover:bg-slate-50">
                  <MdOutlineImage className="text-emerald-500 w-5 h-5" />
                  <span className="text-xs font-medium text-slate-600">calc_work_v2.jpg</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">Calculus</span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">Math 301</span>
                  <span className="bg-red-50 text-red-500 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Help Needed
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                      <button className="p-2 hover:bg-slate-200 rounded-l-full transition-colors"><BiUpvote className="w-4 h-4 text-slate-500" /></button>
                      <span className="text-sm font-bold text-slate-700 px-1 min-w-[1.5rem] text-center">42</span>
                      <button className="p-2 hover:bg-slate-200 rounded-r-full transition-colors"><BiDownvote className="w-4 h-4 text-slate-500" /></button>
                    </div>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                      <FiMessageSquare className="w-4 h-4" /> 12 Answers
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiShare2 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiBookmark className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Post 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
                <div className="absolute top-6 right-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 transform rotate-45"><line x1="18" y1="8" x2="22" y2="12"></line><line x1="12" y1="2" x2="15" y2="5"></line><path d="M12 2L2 12h5l4 4v5l10-10H17l-5-5z"></path></svg>
                </div>
                <div className="flex items-center gap-3 mb-4 pr-8">
                  <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="Dr. Sarah Jenkins" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-[15px]">Dr. Sarah Jenkins</span>
                      <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        Instructor
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">5 hours ago in <span className="font-medium text-teal-600">Weekly Discussion</span></p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">Week 4 Reading Discussion: Implications of AI Ethics</h3>
                <p className="text-slate-600 text-[15px] mb-6 leading-relaxed">
                  Welcome to this week's discussion! After reading Chapter 4, I want everyone to consider the scenario on page 112. If you were the lead engineer, how would you balance the efficiency gains against the potential bias highlighted in the dataset? Please provide at least one peer response by Friday.
                </p>
                
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-100">
                      <button className="p-2 hover:bg-slate-200 rounded-l-full transition-colors"><BiUpvote className="w-4 h-4 text-slate-500" /></button>
                      <span className="text-sm font-bold text-slate-700 px-1 min-w-[1.5rem] text-center">15</span>
                      <button className="p-2 hover:bg-slate-200 rounded-r-full transition-colors"><BiDownvote className="w-4 h-4 text-slate-500" /></button>
                    </div>
                    <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-semibold">
                      <div className="relative">
                        <FiMessageSquare className="w-4 h-4 fill-indigo-600" />
                      </div>
                      34 Replies (2 New)
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiShare2 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><FiBookmark className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Load More */}
              <button className="w-full bg-slate-50/50 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-semibold py-3.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 transition-colors text-sm">
                Load More Discussions
              </button>

            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
              
              {/* Trending Topics Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FiTrendingUp className="text-indigo-600 w-5 h-5" /> Trending Topics
                </h3>
                
                <div className="space-y-5">
                  <div className="group cursor-pointer">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-slate-800 text-[15px] group-hover:text-indigo-600 transition-colors">#FinalsPrep2024</h4>
                      <span className="text-xs text-slate-400">2.4k posts</span>
                    </div>
                    <p className="text-[13px] text-slate-500 line-clamp-1">Study guides and group finding for...</p>
                  </div>
                  
                  <div className="group cursor-pointer">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-slate-800 text-[15px] group-hover:text-indigo-600 transition-colors">#MachineLearningBasics</h4>
                      <span className="text-xs text-slate-400">856 posts</span>
                    </div>
                    <p className="text-[13px] text-slate-500 line-clamp-1">Beginner questions and resource...</p>
                  </div>
                  
                  <div className="group cursor-pointer">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-slate-800 text-[15px] group-hover:text-indigo-600 transition-colors">#CampusLife</h4>
                      <span className="text-xs text-slate-400">512 posts</span>
                    </div>
                    <p className="text-[13px] text-slate-500 line-clamp-1">General discussion about events and...</p>
                  </div>
                </div>
                
                <button className="w-full mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center">
                  View All Topics
                </button>
              </div>

              {/* Moderated Forums Card */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-[#e6f7f8] to-[#f0f1fa] shadow-sm relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                    <FiShield className="text-teal-600 w-5 h-5 fill-teal-100/50" /> Moderated Forums
                  </h3>
                  <p className="text-[13px] text-slate-600 mb-5 leading-relaxed">
                    Official spaces managed by course instructors for focused academic discussion.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5 bg-white/70 hover:bg-white rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow border border-white/50">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold font-serif text-lg shrink-0">
                        Σ
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-800 text-[14px] truncate">Advanced Mathematics</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">Prof. Jenkins • <span className="text-teal-600 font-medium">12 online</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 bg-white/70 hover:bg-white rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow border border-white/50">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold font-mono text-sm shrink-0">
                        {"</>"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-800 text-[14px] truncate">Computer Science 101</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">Dr. Alan • <span className="text-indigo-600 font-medium">45 online</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed pb-4">
                By participating, you agree to the <a href="#" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">Community Guidelines</a>. Be respectful, stay on topic, and help each other learn.
              </p>
              
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
