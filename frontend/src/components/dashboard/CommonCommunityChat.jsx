import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiUsers, FiSmile, FiPaperclip, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function CommonCommunityChat() {
  const { user } = useAuth();
  const currentUserId = user?.username || (user?.role === 'teacher' ? 'drjenkins' : 'student1');
  const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : (user?.role === 'teacher' ? 'Dr. Sarah Jenkins' : 'John Doe');
  const currentUserRole = user?.role || 'student';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const isUserNearBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 120;
  };

  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await fetch('http://localhost:5000/api/common-messages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(prev => {
          const hasChanged = prev.length !== data.length || 
            (prev.length > 0 && data.length > 0 && prev[prev.length - 1]._id !== data[data.length - 1]._id);

          if (hasChanged || isInitial) {
            if (isInitial || isUserNearBottom()) {
              setTimeout(scrollToBottom, 50);
            }
            return data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error loading common community messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    // Live polling every 3 seconds
    const interval = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    const tempMsg = {
      _id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(currentUserId)}`,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch('http://localhost:5000/api/common-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          senderAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(currentUserId)}`
        })
      });

      if (res.ok) {
        fetchMessages(false);
      }
    } catch (err) {
      console.error('Error sending common message:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[650px] font-sans">
      
      {/* Platform Chat Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/80 flex items-center justify-center text-white shadow-sm border border-indigo-400/30">
            <FiUsers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2 leading-snug">
              AcademiX Common Platform Stream
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Live Platform</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">Public messaging room visible to all students and faculty teachers.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Connected as {currentUserName} ({currentUserRole === 'teacher' ? 'Faculty' : 'Student'})
        </div>
      </div>

      {/* Message Feed Stream (Scoped Scroll Container) */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/60 scroll-smooth"
      >
        {isLoading ? (
          <div className="text-center p-12 text-xs text-slate-400">Loading common platform messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl max-w-sm mx-auto shadow-sm border border-slate-100 my-auto">
            <p className="text-sm font-bold text-slate-800 mb-1">Welcome to the Common Stream!</p>
            <p className="text-xs text-slate-500">Be the first student or teacher to send a public platform message.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            const isTeacher = msg.senderRole === 'teacher';

            return (
              <div key={msg._id} className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <img 
                  src={msg.senderAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(msg.senderId)}`} 
                  alt={msg.senderName} 
                  className="w-9 h-9 rounded-full border border-slate-200 shrink-0 mt-0.5 shadow-sm"
                />

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="font-bold text-slate-900 text-xs">{msg.senderName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${isTeacher ? 'bg-teal-600 text-white flex items-center gap-0.5' : 'bg-slate-200 text-slate-700'}`}>
                      {isTeacher && <FiCheckCircle className="w-2.5 h-2.5" />}
                      {isTeacher ? 'Instructor' : 'Student'}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm relative leading-relaxed whitespace-pre-line ${isMe ? 'bg-[#3b28cc] text-white rounded-tr-none' : isTeacher ? 'bg-teal-50 border border-teal-200 text-slate-900 rounded-tl-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'}`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Message Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-3 shrink-0">
        <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer">
          <FiSmile className="w-5 h-5" />
        </button>
        <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer">
          <FiPaperclip className="w-5 h-5" />
        </button>

        <input 
          type="text"
          placeholder="Send a message to all students and teachers in the common platform..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border focus:border-indigo-500 transition-all"
        />

        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="bg-[#3b28cc] hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm transition-colors cursor-pointer"
        >
          <FiSend className="w-4 h-4" /> Send Stream
        </button>
      </form>

    </div>
  );
}
