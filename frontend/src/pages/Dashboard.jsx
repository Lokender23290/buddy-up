import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Send, Settings, Bell, Star, MoreVertical, Plus, Zap, Shield, Rocket, ClipboardList, Check, X, UserPlus, ArrowRight, Wallet, Loader, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user, acceptConnectionRequest, rejectConnectionRequest, getAllUsers, fetchCurrentUser, createPost, getPosts, resolvePost, joinPost, leavePost } = useAuth();
  const { isUserOnline } = useSocket();
  const [pendingBuddies, setPendingBuddies] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', category: 'Study' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  const [activeBuddiesList, setActiveBuddiesList] = useState([]);

  const listRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [allUsers, postsData] = await Promise.all([
        getAllUsers(),
        getPosts()
      ]);
      
      if (user?.pendingRequests?.length > 0 && allUsers?.users) {
        const pending = allUsers.users.filter(u => user.pendingRequests.includes(u._id));
        setPendingBuddies(pending);
      }
      if (user?.connections?.length > 0 && allUsers?.users) {
        const activeList = allUsers.users.filter(u => user.connections.includes(u._id));
        setActiveBuddiesList(activeList);
      }
      
      setBroadcasts(postsData?.posts || []);
    } catch (e) {
      toast.error('Identity Resolution Sync Interrupted');
    } finally {
      setLoading(false);
    }
  }, [user?.pendingRequests, getAllUsers, getPosts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIdentitySync = async (id, action) => {
    const loadId = toast.loading(`Identity Sync ${action === 'accept' ? 'Handshake' : 'Termination'}...`);
    try {
      if (action === 'accept') {
        await acceptConnectionRequest(id);
        toast.success('Sync Established: Connection Secure', { id: loadId });
      } else {
        await rejectConnectionRequest(id);
        toast.success('Sync Terminated', { id: loadId });
      }
      setPendingBuddies(prev => prev.filter(p => p._id !== id));
      await fetchCurrentUser();
    } catch (e) {
      toast.error('Identity Sync Resolution Error', { id: loadId });
    }
  };

  const handleLaunchBroadcast = async () => {
    if (!broadcastData.title) return toast.error('Broadcast payload empty');
    setSubmitting(true);
    const loadId = toast.loading('Synchronizing Community with Network...');
    try {
        await createPost(broadcastData);
        toast.success('Community Dispatched to Campus Network', { id: loadId });
        setIsModalOpen(false);
        setBroadcastData({ title: '', category: 'Study' });
        fetchData();
    } catch (e) {
        toast.error('Community Dispatch Failed', { id: loadId });
    } finally {
        setSubmitting(false);
    }
  };

  const handleDiscardBroadcast = async (postId) => {
    const loadId = toast.loading('Terminating Community Sequence...');
    try {
      await resolvePost(postId);
      toast.success('Community Terminated Successfully', { id: loadId });
      fetchData();
    } catch (e) {
      toast.error('Termination Failed', { id: loadId });
    }
  };

  const handleJoinCommunity = async (postId) => {
    const loadId = toast.loading('Securing Node Access...');
    try {
      await joinPost(postId);
      toast.success('Successfully Joined Community', { id: loadId });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Access Denied', { id: loadId });
    }
  };

  const handleLeaveCommunity = async (postId) => {
    const loadId = toast.loading('Detaching from Community Node...');
    try {
      await leavePost(postId);
      toast.success('Successfully Left Community', { id: loadId });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Termination Failed', { id: loadId });
    }
  };

  const stats = [
    { id: 'requests', label: 'Pending Invitations', value: user?.pendingRequests?.length || 0, icon: UserPlus, color: 'text-yellow-400' },
    { id: 'buddies', label: 'Active Buddies', value: user?.connections?.length || 0, icon: Users, color: 'text-blue-400' },
    { id: 'broadcasts', label: 'Network Reach', value: broadcasts.length, icon: Rocket, color: 'text-purple-400' },
    { id: 'safety', label: 'Safety Index', value: 'S+', icon: Shield, color: 'text-green-400', noTab: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row items-center justify-between mb-16 animate-fade-in relative">
          <div className="text-center md:text-left">
            <div className="flex items-center space-x-3 mb-2 justify-center md:justify-start">
               <span className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                  <span className={`w-1.5 h-1.5 bg-green-500 rounded-full ${isUserOnline(user?._id || user?.id) ? 'animate-pulse' : 'opacity-40'}`}></span>
                  <span>{isUserOnline(user?._id || user?.id) ? 'Network Live: Node Authorized' : 'Network Standby'}</span>
               </span>
               <span className="flex items-center space-x-2 px-3 py-1 bg-primary-600/10 text-primary-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-primary-500/20">
                  <Shield size={10} className="animate-pulse" />
                  <span>Secure Session AES-256</span>
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-1 uppercase tracking-tighter">Campus <span className="gradient-text tracking-widest">Dashboard</span></h1>
            <p className="text-gray-400 font-bold italic opacity-70 uppercase tracking-widest text-xs">Welcome back, <span className="text-white font-bold">{user?.name || 'Buddy'}</span>!</p>
          </div>
          <div className="flex space-x-4 mt-8 md:mt-0">
             <button onClick={() => setIsModalOpen(true)} className="btn-primary py-4 px-10 shadow-2xl font-black uppercase text-[10px] tracking-widest flex items-center">
                <Plus size={18} className="mr-3" /> Launch Community
             </button>
          </div>
        </header>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card max-w-lg w-full p-12 border-primary-500/30 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-widest">New <span className="text-primary-400">Community</span></h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                  </div>
                  <div className="space-y-8">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block ml-1 italic">Community Purpose: Current Need</label>
                        <input type="text" placeholder="e.g. Identity Sync for Physics Lab Data" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none text-white shadow-inner" value={broadcastData.title} onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block ml-1 italic">Category</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none text-white shadow-inner" value={broadcastData.category} onChange={(e) => setBroadcastData({...broadcastData, category: e.target.value})}>
                           <option value="Study">Study Session</option>
                           <option value="Project">Project Collaboration</option>
                           <option value="Sports">Sports / Event</option>
                           <option value="Other">Other</option>
                        </select>
                     </div>
                     <div className="flex space-x-4 pt-4">
                        <button disabled={submitting} onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-gray-500">Discard</button>
                        <button disabled={submitting} onClick={handleLaunchBroadcast} className="flex-1 py-5 bg-primary-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-primary-500 transition-all text-white flex items-center justify-center">
                           {submitting ? <Loader className="animate-spin mr-2" size={14} /> : 'Execute Sync'}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, idx) => (
            <motion.div 
               key={stat.id} 
               onClick={() => {
                   if (!stat.noTab) {
                       setActiveTab(stat.id);
                       setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                   }
               }}
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ delay: idx * 0.1 }} 
               className={`glass p-10 rounded-[2.5rem] group transition-all duration-300 relative overflow-hidden shadow-2xl border-white/5 ${!stat.noTab && 'cursor-pointer hover:border-primary-500/50'} ${activeTab === stat.id ? 'border-primary-500/70 shadow-[0_0_30px_rgba(79,70,229,0.15)] bg-primary-600/5 scale-[1.02]' : ''}`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-600/5 blur-3xl -z-10 bg-blue-600/10 opacity-50 group-hover:opacity-100 transition-all"></div>
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} mb-6 w-fit shadow-xl ${activeTab === stat.id && 'bg-primary-600/20 shadow-primary-500/20'}`}>
                 <stat.icon size={28} />
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-2 italic">{stat.value}</h3>
              <p className="text-gray-500 font-extrabold text-[9px] uppercase tracking-widest opacity-60 italic">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16" ref={listRef}>
            <div className="lg:col-span-2 space-y-16">
                <div className="glass-card p-12 bg-primary-600/5 border-primary-500/10 rounded-[3rem]">
                   <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center italic">
                      <Rocket size={18} className="mr-3 text-primary-400" /> Identity Matrix Compliance
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TaskItem done={!!user?.bio} label="Write Bio" href="/profile" />
                      <TaskItem done={user?.skills?.length > 0} label="List Skills" href="/profile" />
                      <TaskItem done={user?.isProvider} label="Auth Provider" href="/become-provider" />
                      <TaskItem done={user?.connections?.length > 0} label="Sync Buddy" href="/find-buddies" />
                   </div>
                </div>

                {activeTab === 'requests' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                       <h2 className="text-xl font-black uppercase tracking-widest mb-10 opacity-50 flex items-center italic">
                          <Zap size={22} className="mr-3 text-primary-400" /> Pending Handshakes
                       </h2>
                       {pendingBuddies.length === 0 ? (
                           <div className="glass p-20 rounded-[3rem] text-center border-dashed border-2 border-white/5 opacity-40">
                              <p className="text-[10px] font-black uppercase tracking-widest italic leading-loose opacity-60">No pending identity sync requests identified.</p>
                           </div>
                       ) : (
                           <div className="space-y-6">
                               <AnimatePresence>
                                   {pendingBuddies.map((buddy) => (
                                       <motion.div key={buddy._id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 flex items-center justify-between group hover:border-primary-500/30 transition-all shadow-2xl rounded-[2rem]">
                                           <div className="flex items-center space-x-8">
                                               <Link to={`/buddy/${buddy._id}`} className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center font-black text-2xl text-primary-400 border border-primary-500/20 shadow-inner hover:scale-105 transition-transform">
                                                   {buddy?.name?.[0] || '?'}
                                               </Link>
                                               <div>
                                                   <Link to={`/buddy/${buddy._id}`} className="font-black uppercase text-base tracking-tight mb-1 hover:text-primary-400 transition-colors">{buddy.name}</Link>
                                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">{buddy.branch} · {buddy.year}</p>
                                               </div>
                                           </div>
                                           <div className="flex space-x-4">
                                               <button onClick={() => handleIdentitySync(buddy._id, 'accept')} className="p-4 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-2xl transition-all border border-green-500/20 shadow-xl active:scale-95">
                                                   <Check size={24} />
                                               </button>
                                               <button onClick={() => handleIdentitySync(buddy._id, 'reject')} className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-xl active:scale-95">
                                                   <X size={24} />
                                               </button>
                                           </div>
                                       </motion.div>
                                   ))}
                               </AnimatePresence>
                           </div>
                       )}
                    </motion.div>
                )}

                {activeTab === 'buddies' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                       <h2 className="text-xl font-black uppercase tracking-widest mb-10 opacity-50 flex items-center italic">
                          <Users size={22} className="mr-3 text-primary-400" /> Active Master Ledger
                       </h2>
                       {activeBuddiesList.length === 0 ? (
                           <div className="glass p-20 rounded-[3rem] text-center border-dashed border-2 border-white/5 opacity-40">
                              <p className="text-[10px] font-black uppercase tracking-widest italic leading-loose opacity-60">Your Identity matrix has no active buddy nodes.</p>
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                               {activeBuddiesList.map(buddy => (
                                   <div key={buddy._id} className="glass-card p-8 border-white/5 group hover:border-primary-500/20 transition-all rounded-[2rem] shadow-xl flex items-center justify-between">
                                      <div className="flex items-center space-x-6">
                                          <div className="relative">
                                               <Link to={`/buddy/${buddy._id}`} className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center font-black text-xl text-blue-400 border border-blue-500/20 shadow-inner hover:scale-105 transition-transform cursor-pointer">
                                                   {buddy.name?.[0]}
                                               </Link>
                                               {(isUserOnline(buddy._id) || buddy.isOnline) && (
                                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-background-dark rounded-full shadow-lg"></div>
                                               )}
                                          </div>
                                          <div>
                                              <Link to={`/buddy/${buddy._id}`} className="font-black uppercase text-sm tracking-tight hover:text-primary-400 transition-colors leading-none block mb-1.5">{buddy.name}</Link>
                                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">{isUserOnline(buddy._id) || buddy.isOnline ? 'ACTIVE NODE' : 'OFFLINE'}</p>
                                          </div>
                                      </div>
                                      <Link to="/messages" className="p-4 bg-white/5 hover:bg-primary-600/20 text-gray-500 hover:text-primary-400 rounded-2xl transition-all border border-white/5 hover:border-primary-500/20 shadow-xl"><Send size={18} /></Link>
                                   </div>
                               ))}
                           </div>
                       )}
                    </motion.div>
                )}

                {activeTab === 'broadcasts' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                       <h2 className="text-xl font-black uppercase tracking-widest mb-10 opacity-50 flex items-center italic">
                          <Globe size={22} className="mr-3 text-primary-400" /> Campus Communities
                       </h2>
                       <div className="space-y-6 pb-20">
                          {broadcasts.length === 0 ? (
                             <div className="p-10 text-center opacity-30 italic font-black uppercase text-[10px]">No active communities in network.</div>
                          ) : broadcasts.map(post => {
                            const isAuthor = post.author?._id === user?._id || post.author === user?._id;
                            const hasJoined = post.members?.includes(user?._id);

                            return (
                                <div key={post._id} className="glass-card p-8 border-white/5 group hover:border-primary-500/20 transition-all rounded-[2rem] shadow-xl relative">
                                   <div className="flex justify-between items-start mb-6">
                                      <span className="px-3 py-1 bg-primary-600/20 text-primary-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-primary-500/20 shadow-inner">
                                         {post.category}
                                      </span>
                                      
                                      <div className="flex items-center space-x-4">
                                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                                          {isAuthor && (
                                             <button onClick={() => handleDiscardBroadcast(post._id)} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 transition-colors shadow-inner flex items-center">
                                                <X size={10} className="mr-1" /> Discard
                                             </button>
                                          )}
                                      </div>
                                   </div>
                                   <h4 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-primary-400 transition-colors italic">{post.title}</h4>
                                   
                                   {post.members?.length > 0 && (
                                       <div className="mb-4 flex items-center space-x-2">
                                           <div className="flex -space-x-2">
                                              {post.members.slice(0, 3).map((m, i) => (
                                                 <div key={i} className="w-6 h-6 rounded-full bg-primary-600/20 border border-background-dark flex items-center justify-center text-[8px] font-black text-primary-400">U</div>
                                              ))}
                                           </div>
                                           <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{post.members.length} {post.members.length === 1 ? 'Node' : 'Nodes'} Attached</span>
                                       </div>
                                   )}

                                   <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                      <div className="flex items-center space-x-4">
                                         <Link to={`/buddy/${post.author?._id}`} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-sm text-gray-500 border border-white/10 shadow-inner hover:scale-105 transition-transform">{post.author?.name?.[0]}</Link>
                                         <div>
                                            <p className="text-[10px] font-black uppercase tracking-tight text-white">{post.author?.name}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600 italic">{post.author?.branch} · {post.author?.year}</p>
                                         </div>
                                      </div>
                                      
                                      {!isAuthor && (
                                        <button 
                                          onClick={() => hasJoined ? handleLeaveCommunity(post._id) : handleJoinCommunity(post._id)}
                                          className={`px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center transition-all group/btn ${
                                            hasJoined 
                                              ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-inner hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
                                              : 'bg-primary-600 text-white hover:bg-primary-500 shadow-xl border border-primary-500'
                                          }`}
                                        >
                                          {hasJoined ? (
                                            <>
                                              <Check size={14} className="mr-2 group-hover/btn:hidden" />
                                              <X size={14} className="mr-2 hidden group-hover/btn:block" />
                                              <span className="group-hover/btn:hidden">Joined</span>
                                              <span className="hidden group-hover/btn:block">Leave Community</span>
                                            </>
                                          ) : (
                                            <><Zap size={14} className="mr-2" /> Join Array</>
                                          )}
                                        </button>
                                      )}

                                   </div>
                                </div>
                            )
                          })}
                       </div>
                    </motion.div>
                )}
            </div>

            <div className="glass-card p-12 h-fit sticky top-12 border-white/5 flex flex-col items-center rounded-[3rem] shadow-2xl backdrop-blur-3xl">
                <Link to="/profile" className="w-32 h-32 rounded-[2.5rem] bg-primary-600/20 flex items-center justify-center font-black text-4xl text-primary-400 mb-8 border border-primary-500/30 shadow-2xl animate-fade-in group overflow-hidden">
                   <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-10 transition-all"></div>
                   {user?.name?.[0] || 'U'}
                </Link>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 italic opacity-70">Identity Hub</h3>
                <div className="space-y-4 w-full">
                    <QuickLink icon={Users} label="Discovery Network" href="/find-buddies" />
                    <QuickLink icon={Settings} label="Identity Config" href="/profile" />
                </div>
                
                <div className="mt-16 p-10 bg-primary-600/5 rounded-[2.5rem] border border-primary-500/10 relative overflow-hidden group shadow-inner w-full">
                   <Zap className="absolute -bottom-2 -right-2 text-primary-500/5 group-hover:scale-150 transition-all duration-1000" size={120} />
                   
                   {user?.isProvider ? (
                       <div className="relative z-10">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-green-400 mb-4 flex items-center italic">
                             <Check size={14} className="mr-2" /> Active Provider
                           </h4>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-relaxed italic opacity-80 mb-4">
                               Providing: {Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || 'No Skills Listed')}
                           </p>
                           <Link to="/become-provider" className="mt-6 block text-center py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl relative z-20">Expand Expertise</Link>
                       </div>
                   ) : (
                       <div className="relative z-10">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-primary-400 mb-4 flex items-center italic">
                             <Star size={14} className="mr-2" /> Provider Perk
                           </h4>
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-relaxed italic opacity-80">Enable provider authority to monetize your campus expertise legacy.</p>
                           <Link to="/become-provider" className="mt-8 block text-center py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-2xl hover:shadow-primary-600/40 relative z-20">Enable Pro Authority</Link>
                       </div>
                   )}
                </div>
        </div>
      </div>
    </div>
  );
};

const QuickLink = ({ icon: Icon, label, href }) => (
    <Link to={href} className="flex items-center p-5 bg-white/5 hover:bg-primary-600/15 border border-white/5 hover:border-primary-500/30 rounded-3xl transition-all group w-full shadow-lg">
        <Icon size={22} className="text-gray-600 group-hover:text-primary-400 transition-colors mr-5" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{label}</span>
    </Link>
);

const TaskItem = ({ done, label, href }) => (
  <Link to={href} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/5 shadow-xl">
     <div className="flex items-center space-x-4">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-white/20'}`}>
           {done && <Check size={12} className="text-white" />}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${done ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
     </div>
     {!done && <ArrowRight size={16} className="text-primary-400 group-hover:translate-x-1 transition-transform" />}
  </Link>
);

export default Dashboard;
