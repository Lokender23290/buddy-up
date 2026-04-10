import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Briefcase, PlusCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const UserCard = ({ user: targetUser }) => {
  const { user: currentUser, sendConnectionRequest } = useAuth();
  const { isUserOnline } = useSocket();
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(currentUser?.sentRequests?.includes(targetUser._id));

  const isConnected = currentUser?.connections?.includes(targetUser._id);
  const isPending = currentUser?.pendingRequests?.includes(targetUser._id);

  const handleConnect = async () => {
    if (requestSent || isConnected || isPending) return;
    setLoading(true);
    const loadId = toast.loading(`Synchronizing with ${targetUser.name.split(' ')[0]}...`);
    try {
      await sendConnectionRequest(targetUser._id);
      setRequestSent(true);
      toast.success('Sync Request Dispatched', { id: loadId });
    } catch (error) {
      toast.error('Identity Sync Request Failed', { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card flex flex-col items-center group relative overflow-hidden p-8"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl -z-10 group-hover:bg-primary-500/20 transition-all duration-300"></div>
      
      <Link to={`/buddy/${targetUser._id}`} className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl mb-4 flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-all duration-300 relative cursor-pointer">
        <span className="text-white text-3xl font-black uppercase tracking-widest">{targetUser.name[0]}</span>
        {(isUserOnline(targetUser._id) || targetUser.isOnline) && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background-dark rounded-full group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
        )}
      </Link>
      
      <Link to={`/buddy/${targetUser._id}`} className="text-xl font-black mb-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight cursor-pointer">
         {targetUser.name}
      </Link>
      <div className="flex items-center label-dashboard-md text-gray-400 mb-2">
        <Briefcase size={12} className="mr-1 text-primary-400" />
        {targetUser.branch || 'Buddy'} · {targetUser.year || 'N/A'}
      </div>
      <div className={`label-chat-sm mb-4 flex items-center ${isUserOnline(targetUser._id) || targetUser.isOnline ? 'text-green-500' : 'text-gray-600 opacity-50'}`}>
        <span className={`w-1 h-1 rounded-full mr-1.5 ${isUserOnline(targetUser._id) || targetUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
        {isUserOnline(targetUser._id) || targetUser.isOnline ? 'Identity Active' : 'Node Offline'}
      </div>

      {targetUser.isProvider && targetUser.hourlyRate > 0 && (
        <div className="mb-4 inline-flex items-center bg-primary-600/10 border border-primary-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary-400">
          <DollarSign size={10} className="mr-1" /> ₹{targetUser.hourlyRate}/session
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 justify-center min-h-[60px]">
        {targetUser.skills && targetUser.skills.length > 0 ? targetUser.skills.map(skill => (
          <span key={skill} className="label-stats text-gray-400 hover:bg-white/10 hover:text-white transition-all">
            {skill}
          </span>
        )) : (
          <span className="text-[9px] text-gray-500 font-bold uppercase italic tracking-widest opacity-40">No skills listed</span>
        )}
      </div>

      <button 
        onClick={handleConnect}
        disabled={loading || requestSent || isConnected || isPending}
        className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 transition-all duration-300 ${
          isConnected 
            ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
            : requestSent || isPending
            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
            : 'bg-primary-600/20 text-primary-400 hover:bg-primary-600 hover:text-white border border-primary-600/30 shadow-xl'
        }`}
      >
        {isConnected ? (
          <><CheckCircle size={14} /> <span>Connected</span></>
        ) : requestSent ? (
          <><Clock size={14} className="animate-pulse" /> <span>Requested</span></>
        ) : isPending ? (
          <><PlusCircle size={14} /> <span>Respond</span></>
        ) : (
          <><PlusCircle size={14} /> <span>Connect Buddy</span></>
        )}
      </button>
    </motion.div>
  );
};

export default UserCard;
