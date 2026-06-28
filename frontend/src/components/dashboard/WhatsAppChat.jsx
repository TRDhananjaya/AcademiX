import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSearch, FiCheck, FiCheckCircle, FiUser, FiMoreVertical, FiPaperclip, FiSmile } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function WhatsAppChat({ defaultSelectedContactId = null }) {
  const { user } = useAuth();
  const currentUserId = user?.username || (user?.role === 'teacher' ? 'drjenkins' : 'student1');
  const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : (user?.role === 'teacher' ? 'Dr. Sarah Jenkins' : 'John Doe');
  const currentUserRole = user?.role || 'student';

  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messages/conversations?currentUserId=${currentUserId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0) {
          if (defaultSelectedContactId) {
            const match = data.find(c => c.contact.id === defaultSelectedContactId);
            setSelectedContact(match ? match.contact : data[0].contact);
          } else if (!selectedContact) {
            setSelectedContact(data[0].contact);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchThread = async (contactId) => {
    if (!contactId) return;
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/thread/${contactId}?currentUserId=${currentUserId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat thread:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedContact) {
      fetchThread(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const tempMsg = {
      _id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      text: textToSend,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          receiverName: selectedContact.name,
          text: textToSend,
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          senderAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(currentUserId)}`
        })
      });

      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row h-[680px] font-sans">
      
      {/* Left Sidebar (Contacts & Recent Chats) */}
      <div className="w-full md:w-[320px] lg:w-[360px] border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
        
        {/* User Profile Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={`https://i.pravatar.cc/150?u=${encodeURIComponent(currentUserId)}`} 
              alt={currentUserName} 
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{currentUserName}</h3>
              <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wide">{currentUserRole === 'teacher' ? 'Faculty Instructor' : 'Verified Student'}</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-white border-b border-slate-100">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search chat or start new message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border focus:border-indigo-300 transition-all"
            />
          </div>
        </div>

        {/* Contacts / Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60">
          {isLoadingConversations ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading contacts...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No contacts found</div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.contact.id}
                onClick={() => setSelectedContact(conv.contact)}
                className={`p-4 flex items-center gap-3.5 cursor-pointer transition-colors hover:bg-slate-100/70
                  ${selectedContact?.id === conv.contact.id ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600' : 'bg-white'}`}
              >
                <div className="relative shrink-0">
                  <img src={conv.contact.avatar} alt={conv.contact.name} className="w-11 h-11 rounded-full border border-slate-100" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{conv.contact.name}</h4>
                    {conv.timestamp && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate pr-2">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Pane (WhatsApp Main Chat Box) */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-[#efeae2]/30 relative">
          
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0 z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full border border-slate-200" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{selectedContact.name}</h3>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {selectedContact.status || 'Active now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                AcademiX Direct Chat
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {isLoadingMessages ? (
              <div className="text-center p-8 text-xs text-slate-400">Loading chat history...</div>
            ) : messages.length === 0 ? (
              <div className="text-center p-8 bg-white/80 rounded-2xl max-w-sm mx-auto shadow-sm border border-slate-100 my-auto">
                <p className="text-sm font-bold text-slate-800 mb-1">Start a conversation!</p>
                <p className="text-xs text-slate-500">Send a direct message to communicate with {selectedContact.name}.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isSentByMe = msg.senderId === currentUserId;
                return (
                  <div 
                    key={msg._id} 
                    className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSentByMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm relative leading-relaxed whitespace-pre-line
                      ${isSentByMe ? 'bg-[#3b28cc] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}
                    >
                      {!isSentByMe && (
                        <p className="text-[10px] font-bold text-indigo-600 mb-1">{msg.senderName}</p>
                      )}
                      <p>{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isSentByMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isSentByMe && <FiCheck className="w-3 h-3 text-cyan-300 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
            <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer">
              <FiSmile className="w-5 h-5" />
            </button>
            <button type="button" className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors cursor-pointer">
              <FiPaperclip className="w-5 h-5" />
            </button>

            <input 
              type="text"
              placeholder={`Type a message to ${selectedContact.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border focus:border-indigo-400 transition-all"
            />

            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#3b28cc] hover:bg-indigo-700 disabled:opacity-40 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <p className="text-base font-bold text-slate-700">Select a contact to start messaging</p>
        </div>
      )}

    </div>
  );
}
