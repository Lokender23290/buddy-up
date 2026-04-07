import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Briefcase, Star, Settings, Shield, Zap, Send, LayoutDashboard, Rocket, Save, X, Phone, GraduationCap, Code, Heart, Users, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, loading: authLoading, updateProfile, fetchCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    college: '',
    branch: '',
    year: '',
    skills: '',
    interests: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        college: user.college || '',
        branch: user.branch || '',
        year: user.year || '',
        skills: user.skills ? user.skills.join(', ') : '',
        interests: user.interests ? user.interests.join(', ') : '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    const loadId = toast.loading('Syncing Identity Vault...');
    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      };
      await updateProfile(updatedData);
      await fetchCurrentUser();
      toast.success('Identity Sync Stable', { id: loadId });
      setIsEditing(false);
    } catch (error) {
      toast.error('Identity Resolution Sync Interrupted', { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader className="animate-spin text-primary-400" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 animate-pulse">Establishing Identity Sync...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 md:p-20 mb-16 relative overflow-hidden group shadow-2xl border-white/5"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 blur-[150px] -z-10 bg-blue-600/20 opacity-50 group-hover:opacity-100 transition-all"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-12 md:space-y-0 md:space-x-16">
            <div className="relative">
              <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-primary-400 to-primary-700 rounded-[3rem] flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500 overflow-hidden group">
                <span className="text-white text-6xl md:text-8xl font-black uppercase drop-shadow-2xl">{formData.name?.[0] || user?.name?.[0] || '?'}</span>
                <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-all"></div>
                <div className="absolute -bottom-4 -right-4 w-15 h-15 bg-green-500 border-8 border-background-dark rounded-full shadow-2xl"></div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                {isEditing ? (
                  <input 
                    className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-full outline-none focus:ring-2 focus:ring-primary-600 transition-all italic text-white shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black mb-2 uppercase tracking-tighter italic">{user.name}</h1>
                )}
                <div className="flex space-x-3 justify-center md:justify-start mt-6 md:mt-0">
                  {isEditing ? (
                    <>
                      <button onClick={handleUpdate} disabled={loading} className="p-4 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-[1.2rem] transition-all border border-green-500/30 shadow-lg active:scale-95">
                        {loading ? <Loader className="animate-spin" size={24} /> : <Save size={24} />}
                      </button>
                      <button onClick={() => setIsEditing(false)} className="p-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-[1.2rem] transition-all border border-red-500/30 shadow-lg active:scale-95">
                        <X size={24} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-secondary font-black uppercase text-[10px] tracking-[0.2em] flex items-center px-8 py-3.5 shadow-2xl">
                      <Settings size={14} className="mr-3" /> Identity Config
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-8">
                  <textarea 
                    placeholder="Describe your campus identity..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-300 italic min-h-[120px] outline-none focus:ring-2 focus:ring-primary-600 transition-all shadow-inner text-sm font-bold"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input icon={GraduationCap} placeholder="College" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} />
                    <Input icon={Briefcase} placeholder="Branch" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                    <Input icon={Star} placeholder="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input icon={Code} placeholder="Skills (comma separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
                    <Input icon={Heart} placeholder="Interests (comma separated)" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl text-gray-400 max-w-3xl leading-loose italic mb-10 opacity-80 uppercase tracking-widest font-extrabold text-[10px]">
                     "{user.bio || 'Identity bio pending synchronization...'}"
                  </p>
                  
                  <div className="flex flex-wrap gap-x-10 gap-y-4 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <div className="flex items-center"><GraduationCap size={16} className="mr-3 text-primary-400" /> {user.college || 'College Unassigned'}</div>
                    <div className="flex items-center"><Briefcase size={16} className="mr-3 text-primary-400" /> {user.branch || 'Branch Unassigned'}</div>
                    <div className="flex items-center"><Star size={16} className="mr-3 text-primary-400" /> {user.year || 'Year Unassigned'}</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {user.skills && user.skills.map(skill => (
                      <span key={skill} className="px-6 py-2.5 bg-primary-600/10 border border-primary-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-300 shadow-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-32">
            <StatCard icon={Users} label="Identity Connections" value={user.connections?.length || 0} color="text-blue-400" />
            <StatCard icon={Zap} label="Discovery Requests" value={user.sentRequests?.length || 0} color="text-yellow-400" />
            <StatCard icon={Shield} label="Security Index" value="S+" color="text-green-400" />
        </div>
      </div>
    </div>
  );
};

const Input = ({ icon: Icon, placeholder, value, onChange }) => (
    <div className="relative group">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={18} />
        <input 
            placeholder={placeholder} 
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-600 outline-none shadow-inner" 
            value={value} 
            onChange={onChange} 
        />
    </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-12 rounded-[2.5rem] text-center group transition-all duration-300 shadow-2xl overflow-hidden relative border border-white/5"
  >
    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/5 blur-3xl -z-10 bg-blue-600/10 opacity-30 group-hover:opacity-100 transition-all"></div>
    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner border border-white/5">
      <Icon className={color + " group-hover:text-white transition-all"} size={36} />
    </div>
    <h3 className="text-5xl font-black mb-3 uppercase tracking-tighter italic">{value}</h3>
    <p className="text-gray-500 font-extrabold uppercase text-[10px] tracking-[0.2em] opacity-60 italic">{label}</p>
  </motion.div>
);

export default Profile;
