import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Briefcase, Calendar, CheckCircle, Shield, Loader, User, Zap, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUserById, sendConnectionRequest, user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserById(id);
        setProfileUser(data.user);
      } catch (err) {
        toast.error('Identity Resolution Failed: Profile Not Found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, fetchUserById, navigate]);

  const handleConnect = async () => {
    const loadId = toast.loading(`Synchronizing with ${profileUser?.name.split(' ')[0]}...`);
    try {
      await sendConnectionRequest(profileUser._id);
      toast.success('Sync Request Dispatched', { id: loadId });
    } catch (err) {
      toast.error('Identity Sync Request Failed', { id: loadId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
            <Loader size={48} className="animate-spin text-primary-400 mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 animate-pulse">Retrieving Protocol Identity...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  const isConnected = currentUser?.connections?.includes(profileUser._id);
  const isPending = currentUser?.sentRequests?.includes(profileUser._id) || currentUser?.pendingRequests?.includes(profileUser._id);
  const isSelf = currentUser?._id === profileUser._id;

  return (
    <div className="min-h-screen bg-background-dark pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 blur-[150px] -z-10 rounded-full animate-float"></div>
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 text-gray-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest px-4 py-2 bg-white/5 rounded-full hover:bg-white/10"
        >
           <ArrowLeft size={14} /> <span>Return to Matrix</span>
        </button>

        <div className="glass-card p-0 overflow-hidden shadow-2xl border-white/5 relative">
           <div className="h-48 bg-gradient-to-r from-primary-900/50 to-background-dark relative">
              <div className="absolute top-6 right-6 flex space-x-3">
                 {profileUser.isProvider && (
                    <span className="flex items-center space-x-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 shadow-lg backdrop-blur-md">
                       <Zap size={14} /> <span>Verified Provider</span>
                    </span>
                 )}
                 <span className="flex items-center space-x-2 px-4 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20 shadow-lg backdrop-blur-md">
                    <Shield size={14} /> <span>Identity Secured</span>
                 </span>
              </div>
           </div>
           
           <div className="px-12 pb-12 relative -mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                 <div className="flex items-end space-x-8">
                    <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-primary-900/40 flex items-center justify-center font-black text-6xl text-primary-400 border border-primary-500/30 shadow-2xl backdrop-blur-xl relative group">
                        <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-10 transition-all rounded-[2rem]"></div>
                        {profileUser.name?.[0]?.toUpperCase()}
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-background-dark rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                    </div>
                    <div className="pb-4">
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 italic">
                           {profileUser.name.split(' ')[0]} <span className="text-primary-400">{profileUser.name.split(' ')[1] || ''}</span>
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic opacity-80 mb-4">
                            {profileUser.branch || 'Campus Buddy'} · {profileUser.year || 'N/A'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                           <InfoChip icon={Mail} label={profileUser.email} />
                           {profileUser.phone && <InfoChip icon={User} label={profileUser.phone} />}
                        </div>
                    </div>
                 </div>

                 {!isSelf && (
                     <div className="pb-4 flex space-x-4">
                        <button 
                           onClick={handleConnect}
                           disabled={isConnected || isPending}
                           className={`py-4 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center transition-all duration-300 shadow-xl ${
                             isConnected 
                               ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                               : isPending
                               ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                               : 'bg-primary-600 text-white hover:bg-primary-500 border border-primary-500 shadow-primary-500/20 active:scale-95'
                           }`}
                        >
                           {isConnected ? (
                             <><Shield size={16} className="mr-3" /> Sync Active</>
                           ) : isPending ? (
                             <><Loader className="animate-spin mr-3" size={16} /> Handshake Pending</>
                           ) : (
                             <><Zap size={16} className="mr-3" /> Initiate Sync</>
                           )}
                        </button>
                        {isConnected && (
                            <button onClick={() => navigate('/messages')} className="py-4 px-6 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all shadow-xl active:scale-95">
                                <MessageSquare size={18} />
                            </button>
                        )}
                     </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center">
                           <User size={16} className="mr-3 text-primary-400" /> Identity Bio
                        </h3>
                        <p className="text-gray-300 font-bold leading-relaxed text-sm">
                           {profileUser.bio || <span className="opacity-40 italic font-black uppercase tracking-widest text-[10px]">No transmission bio provided.</span>}
                        </p>
                     </div>

                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center">
                           <CheckCircle size={16} className="mr-3 text-primary-400" /> Authorized Skills & Proficiency
                        </h3>
                        <div className="flex flex-wrap gap-3">
                           {profileUser.skills && profileUser.skills.length > 0 ? profileUser.skills.map(skill => (
                              <span key={skill} className="px-4 py-2 bg-primary-600/10 border border-primary-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-300 hover:bg-primary-600/20 hover:border-primary-500/30 transition-all cursor-default">
                                 {skill}
                              </span>
                           )) : (
                              <span className="opacity-40 italic font-black uppercase tracking-widest text-[10px]">No skills uploaded to ledger.</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     {profileUser.isProvider && (
                        <div className="p-8 bg-primary-600/10 border border-primary-500/20 rounded-[2rem] relative overflow-hidden group">
                           <Star size={100} className="absolute -bottom-10 -right-10 text-primary-500/10 group-hover:text-primary-500/20 group-hover:scale-110 transition-all duration-500" />
                           <h3 className="text-xs font-black uppercase tracking-widest text-primary-400 mb-6 flex items-center">
                              <Star size={16} className="mr-3" /> Provider Protocol
                           </h3>
                           <div className="space-y-4">
                              <div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Authorization Tier</p>
                                 <p className="text-sm font-bold text-white">Tier 1 Elite</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Hourly Rate</p>
                                 <p className="text-xl font-black italic text-green-400 tracking-tight">
                                     ₹{profileUser.hourlyRate || 0}
                                     <span className="text-[10px] uppercase tracking-widest opacity-50 ml-1">/ session</span>
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center">
                           <Calendar size={16} className="mr-3 text-primary-400" /> Network Statistics
                        </h3>
                        <div className="space-y-6">
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Member Since</p>
                              <p className="text-sm font-bold text-white uppercase italic tracking-widest">
                                 {new Date(profileUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                              </p>
                           </div>
                           <div className="h-px w-full bg-white/5"></div>
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Sync Nodes Established</p>
                              <p className="text-3xl font-black text-primary-400 italic">
                                 {profileUser.connections?.length || 0}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InfoChip = ({ icon: Icon, label }) => (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
       <Icon size={12} className="text-primary-400" />
       <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
);

export default PublicProfile;
