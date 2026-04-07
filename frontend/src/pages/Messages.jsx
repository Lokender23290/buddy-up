import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Search, MoreVertical, Phone, Video, MessageSquare, Zap, Clock, CheckCheck, Loader, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user, getConversations, getChat, sendMessage } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data?.conversations || []);
    } catch (e) {
      toast.error('Identity Ledger Sync Failed');
    } finally {
      setLoading(false);
    }
  }, [getConversations]);

  const fetchChat = useCallback(async (userId) => {
    setChatLoading(true);
    try {
      const data = await getChat(userId);
      setMessages(data?.messages || []);
    } catch (e) {
      toast.error('Handshake History Retrieval Failed');
    } finally {
      setChatLoading(false);
    }
  }, [getChat]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      fetchChat(activeChat._id);
      const interval = setInterval(() => fetchChat(activeChat._id), 5000); // Polling for "authenticity" without websockets
      return () => clearInterval(interval);
    }
  }, [activeChat, fetchChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const tempMsg = message;
    setMessage('');
    try {
      const resp = await sendMessage(activeChat._id, tempMsg);
      setMessages(prev => [...prev, resp.message]);
    } catch (e) {
      toast.error('Payload dispatch failed. Check buddy connection.');
      setMessage(tempMsg);
    }
  };

  return (
    <div className="h-full px-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col glass-card border-white/5 p-0 overflow-hidden shadow-2xl backdrop-blur-3xl">
           <div className="p-8 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center">
                 <MessageSquare size={18} className="mr-3 text-primary-400" /> Identity <span className="text-primary-400 ml-2">Inbox</span>
              </h2>
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-with-in:text-primary-400 transition-colors" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search Verified Buddies..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="p-10 text-center opacity-30 font-black italic uppercase tracking-widest text-[10px]">Syncing Conversations...</div>
              ) : conversations.length > 0 ? (
                conversations.map(conv => (
                  <button 
                    key={conv._id}
                    onClick={() => setActiveChat(conv)}
                    className={`w-full flex items-center p-4 rounded-3xl transition-all group ${activeChat?._id === conv._id ? 'bg-primary-600 shadow-2xl scale-[0.98]' : 'hover:bg-white/5 border border-transparent hover:border-white/5'}`}
                  >
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${activeChat?._id === conv._id ? 'bg-white/20 text-white' : 'bg-primary-600/20 text-primary-400 shadow-inner'}`}>
                         {conv?.name?.[0] || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-background-dark rounded-full shadow-lg"></div>
                    </div>
                    <div className="ml-4 text-left flex-1 min-w-0">
                       <h4 className={`text-xs font-black uppercase tracking-tight truncate mb-1 flex items-center ${activeChat?._id === conv._id ? 'text-white' : 'text-gray-300'}`}>
                           {conv.name}
                           {conv.isProvider && <Zap size={10} className="ml-2 text-primary-400" />}
                       </h4>
                       <p className={`text-[8px] font-bold uppercase tracking-widest truncate ${activeChat?._id === conv._id ? 'text-white/60' : 'text-gray-600'}`}>
                           {conv.isProvider ? 'PROVIDER BUDDY' : 'CONSUMER BUDDY'} · {conv.branch}
                       </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest italic mb-2">Inbox Empty</p>
                   <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Find buddies to start sync.</p>
                </div>
              )}
           </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col glass-card border-white/5 p-0 overflow-hidden shadow-2xl relative backdrop-blur-3xl">
           {activeChat ? (
             <>
               {/* Header */}
               <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center">
                     <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center font-black text-primary-400 shadow-inner">
                        {activeChat?.name?.[0] || '?'}
                     </div>
                     <div className="ml-5">
                        <Link to={`/buddy/${activeChat._id}`} className="text-sm font-black uppercase tracking-tight leading-none mb-1.5 flex items-center hover:text-primary-400 transition-colors">
                            {activeChat.name}
                            <span className={`ml-3 px-2 py-0.5 rounded-md text-[7px] border tracking-widest ${activeChat.isProvider ? 'bg-primary-600/10 text-primary-400 border-primary-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                {activeChat.isProvider ? 'PROVIDER BUDDY' : 'CONSUMER BUDDY'}
                            </span>
                        </Link>
                        <div className="flex items-center">
                           <div className="w-1.5 h-1.5 rounded-full mr-2 bg-green-500 animate-pulse"></div>
                           <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Encrypted Handshake Established</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center space-x-3">
                     <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 shadow-lg">
                        <Lock size={10} />
                        <span>AES-256</span>
                     </div>
                     <Link to={`/buddy/${activeChat._id}`} className="p-3 text-gray-400 hover:text-primary-400 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"><MoreVertical size={20} /></Link>
                  </div>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar pb-32">
                  <div className="flex justify-center mb-12">
                     <span className="text-[8px] font-black uppercase tracking-widest px-5 py-2 bg-primary-600/5 rounded-full text-primary-400 border border-primary-500/10 italic flex items-center shadow-inner">
                        <Shield size={10} className="mr-2" /> Security Handshake Validated
                     </span>
                  </div>
                  {chatLoading && (!messages || messages.length === 0) ? (
                    <div className="text-center opacity-30 font-black italic uppercase tracking-widest text-[10px]">Decrypting History...</div>
                  ) : Array.isArray(messages) && messages.map(msg => (
                    <div key={msg._id} className={`flex ${msg.sender === user?._id || msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[75%] ${msg.sender === user?._id || msg.sender === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`p-6 rounded-[2rem] text-xs font-bold leading-relaxed shadow-2xl ${msg.sender === user?._id || msg.sender === user?.id ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-900/40' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none backdrop-blur-md'}`}>
                             {msg.content}
                          </div>
                          <div className="mt-2.5 flex items-center space-x-2 px-2">
                             <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             {msg.sender === user?._id && <CheckCheck size={10} className="text-primary-400" />}
                          </div>
                       </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input */}
               <div className="p-8 border-t border-white/5 absolute bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-2xl">
                  <form onSubmit={handleSend} className="relative group">
                     <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Dispatch identity payload..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-8 pr-20 text-xs font-bold italic outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-2xl backdrop-blur-md"
                     />
                     <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-primary-600 text-white rounded-2xl shadow-2xl hover:bg-primary-500 transition-all group-hover:rotate-3 active:scale-90">
                        <Send size={20} />
                     </button>
                  </form>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-32 h-32 bg-primary-600/5 rounded-[40px] flex items-center justify-center mb-12 border-dashed border-2 border-primary-500/20 relative shadow-inner">
                   <MessageSquare size={54} className="text-primary-400/20" />
                   <div className="absolute inset-0 bg-primary-600/10 blur-[60px] rounded-full animate-float"></div>
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Hub <span className="text-primary-400">Idle</span></h3>
                <p className="max-w-xs text-[10px] font-black uppercase tracking-widest leading-loose text-gray-600 opacity-60">Select a verified connection to establish a secure synchronization channel.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
