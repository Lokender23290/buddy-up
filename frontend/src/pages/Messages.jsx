import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Search, MoreVertical, MessageSquare, Zap, Clock, Check, CheckCheck, Loader, Shield, Lock, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user, getConversations, getChat, sendMessage: sendAPIMessage } = useAuth();
  const { socket, isUserOnline, isUserTyping } = useSocket();
  const [socketConnected, setSocketConnected] = useState(socket?.connected || false);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Auto-focus when chat switching
  useEffect(() => {
    if (activeChat && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [activeChat]);

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
      
      // Mark as read when opening chat
      const unreadMessageIds = (data?.messages || [])
        .filter(m => m.receiver === (user?._id || user?.id) && m.status !== 'read')
        .map(m => m._id);
      
      if (unreadMessageIds.length > 0 && socket) {
        socket.emit('mark_read', { messageIds: unreadMessageIds, senderId: userId });
      }
    } catch (e) {
      toast.error('Handshake History Retrieval Failed');
    } finally {
      setChatLoading(false);
    }
  }, [getChat, user, socket]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      fetchChat(activeChat._id);
    }
  }, [activeChat, fetchChat]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    setSocketConnected(socket.connected);
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('new_message', (payload) => {
      if (activeChat && (payload.sender._id === activeChat._id || payload.sender === activeChat._id)) {
        setMessages(prev => {
            const exists = prev.some(m => m._id === payload._id);
            if (exists) return prev;
            return [...prev, payload];
        });
        socket.emit('mark_read', { messageIds: [payload._id], senderId: activeChat._id });
      } else {
        fetchConversations();
      }
    });

    socket.on('message_received', (payload) => {
        if (activeChat && (payload.receiver === activeChat._id || payload.receiver?._id === activeChat._id)) {
            setMessages(prev => {
                // Remove optimistic message with same content if within last 5 seconds
                const filtered = prev.filter(m => !(m.content === payload.content && (Date.now() - new Date(m.createdAt).getTime() < 5000) && m.status === 'sent' && m._id.length < 20));
                const exists = filtered.some(m => m._id === payload._id);
                if (exists) return filtered;
                return [...filtered, payload];
            });
        }
    });

    socket.on('messages_read', ({ messageIds }) => {
        setMessages(prev => prev.map(m => 
            messageIds.includes(m._id) ? { ...m, status: 'read' } : m
        ));
    });

    socket.on('user_status_change', () => {
        fetchConversations();
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message');
      socket.off('message_received');
      socket.off('messages_read');
      socket.off('user_status_change');
    };
  }, [socket, activeChat, fetchConversations]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || !socket) return;

    const content = message.trim();
    setMessage('');
    
    // Clear typing indicator immediately
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing_stop', { receiverId: activeChat._id });
    }

    try {
        if (!socketConnected) {
            toast.error('Sync Interrupted: Re-establishing neural link...');
            return;
        }

        // Optimistic UI for high-fidelity feel
        const optimisticMsg = {
            _id: Date.now().toString(),
            sender: user?._id || user?.id,
            receiver: activeChat._id,
            content: content,
            status: 'sent',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        socket.emit('send_message', { receiverId: activeChat._id, content });
    } catch (e) {
      toast.error('Payload dispatch failed.');
      setMessage(content);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!socket || !activeChat) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socket.emit('typing_start', { receiverId: activeChat._id });
    
    typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { receiverId: activeChat._id });
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
        case 'sent': return <Check size={12} className="text-gray-600" />;
        case 'delivered': return <CheckCheck size={12} className="text-gray-600" />;
        case 'read': return <CheckCheck size={12} className="text-primary-400" />;
        default: return <Clock size={12} className="text-gray-600" />;
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
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search Verified Buddies..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
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
                      {(isUserOnline(conv._id) || conv.isOnline) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-background-dark rounded-full shadow-lg"></div>
                      )}
                    </div>
                    <div className="ml-4 text-left flex-1 min-w-0">
                       <h4 className={`text-xs font-black uppercase tracking-tight truncate mb-1 flex items-center ${activeChat?._id === conv._id ? 'text-white' : 'text-gray-300'}`}>
                           {conv.name}
                           {conv.isProvider && <Zap size={10} className="ml-2 text-primary-400" />}
                       </h4>
                       <p className={`text-[8px] font-bold uppercase tracking-widest truncate ${activeChat?._id === conv._id ? 'text-white/60' : 'text-gray-600'}`}>
                           {isUserOnline(conv._id) ? 'ACTIVE NODE' : 'OFFLINE'} · {conv.branch}
                       </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest italic mb-2">No Verified Nodes</p>
                   <p className="text-[8px] font-bold uppercase tracking-tighter opacity-70 mb-6">Establish a buddy connection through the network to start syncing.</p>
                   <Link to="/find-buddies" className="px-6 py-3 bg-primary-600/20 text-primary-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all">Search Network</Link>
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
                                {activeChat.isProvider ? 'PROVIDER NODE' : 'BUDDY NODE'}
                            </span>
                        </Link>
                        <div className="flex items-center">
                           <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isUserOnline(activeChat._id) ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                           <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                             {isUserTyping(activeChat._id) ? <span className="text-primary-400 animate-pulse italic">Buddy is typing identity payload...</span> : (isUserOnline(activeChat._id) ? 'Direct Sync Live' : 'Node Disconnected')}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center space-x-3">
                     {!socketConnected && (
                       <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20 shadow-lg animate-pulse">
                          <WifiOff size={10} />
                          <span>SYNC INTERRUPTED</span>
                       </div>
                     )}
                     <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 shadow-lg">
                        <Lock size={10} />
                        <span>E2E ENCRYPTED</span>
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
                  {chatLoading ? (
                    <div className="text-center py-20">
                        <Loader className="animate-spin text-primary-400 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Decrypting History...</p>
                    </div>
                  ) : Array.isArray(messages) && messages.map(msg => {
                    const isOwn = msg.sender === (user?._id || user?.id) || (msg.sender?._id === (user?._id || user?.id));
                    return (
                        <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className={`p-6 rounded-[2rem] text-xs font-bold leading-relaxed shadow-2xl break-words whitespace-pre-wrap overflow-hidden ${isOwn ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-900/40' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none backdrop-blur-md'}`} style={{ wordBreak: 'break-word' }}>
                                 {msg.content}
                              </div>
                              <div className="mt-2.5 flex items-center space-x-2 px-2">
                                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 {isOwn && getStatusIcon(msg.status)}
                              </div>
                           </div>
                        </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input */}
               <div className="p-8 border-t border-white/5 absolute bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-2xl">
                  {isUserTyping(activeChat._id) && (
                      <div className="absolute -top-10 left-10 flex items-center space-x-2 text-[8px] font-black uppercase text-primary-400/60 italic tracking-[0.2em] bg-primary-900/10 px-4 py-2 rounded-full border border-primary-500/10 backdrop-blur-md">
                          <Loader size={10} className="animate-spin" />
                          <span>Buddy is drafting payload...</span>
                      </div>
                  )}
                  <div className="relative group">
                     <textarea 
                        ref={textareaRef}
                        rows="1"
                        value={message}
                        onChange={handleTyping}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend(e);
                           }
                        }}
                        placeholder="Dispatch identity payload..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-8 pr-20 text-xs font-bold italic outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-2xl backdrop-blur-md resize-none custom-scrollbar"
                     />
                     <button 
                        onClick={handleSend}
                        className="absolute right-4 bottom-4 p-4 bg-primary-600 text-white rounded-2xl shadow-2xl hover:bg-primary-500 transition-all group-hover:rotate-3 active:scale-90 flex items-center justify-center">
                        <Send size={20} />
                     </button>
                  </div>
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
