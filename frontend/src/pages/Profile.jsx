import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Briefcase, Star, Settings, Shield, Zap, Send, 
  LayoutDashboard, Rocket, Save, X, Phone, GraduationCap, 
  Code, Heart, Users, Loader, Camera, MapPin, Search, 
  Clock, Lock, Smartphone, Monitor, Bell, Moon, Eye, 
  LockKeyhole, CheckCircle, ChevronRight, AlertCircle, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, loading: authLoading, updateProfile, changePassword, fetchCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    college: '',
    branch: '',
    year: '',
    lookingFor: '',
    skills: [],
    interests: [],
    availability: [],
    otpEnabled: false,
    preferences: {
      theme: 'dark',
      privacy: 'Public',
      notifications: { email: true, push: true, sms: false }
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        college: user.college || '',
        branch: user.branch || '',
        year: user.year || '',
        lookingFor: user.lookingFor || '',
        skills: user.skills || [],
        interests: user.interests || [],
        availability: user.availability || [],
        otpEnabled: user.otpEnabled || false,
        preferences: user.preferences || {
          theme: 'dark',
          privacy: 'Public',
          notifications: { email: true, push: true, sms: false }
        }
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) return toast.error('Authority identity name required');
    if (!formData.username) return toast.error('Identity identifier (username) required');
    
    setLoading(true);
    const loadId = toast.loading('Synchronizing Identity Vault...');
    try {
      await updateProfile(formData);
      await fetchCurrentUser();
      toast.success('Identity Refined Successfully', { id: loadId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Identity Resolution Sync Interrupted', { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Identity Credential Mismatch');
    }
    setLoading(true);
    const loadId = toast.loading('Resealing Vault...');
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Vault Sealed with New Authority', { id: loadId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Vault Reseal Failed', { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    const fields = ['name', 'username', 'bio', 'location', 'college', 'branch', 'year', 'lookingFor'];
    const filled = fields.filter(f => !!formData[f]).length;
    const arrayFields = ['skills', 'interests'];
    const arrayFilled = arrayFields.filter(f => formData[f]?.length > 0).length;
    return Math.round(((filled + arrayFilled) / (fields.length + arrayFields.length)) * 100);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
            <Loader className="animate-spin text-primary-400" size={64} />
            <div className="absolute inset-0 bg-primary-400/20 blur-2xl animate-pulse"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 animate-pulse italic">Establishing Secure Identity Link...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:w-80 space-y-8">
            <div className="glass-card p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary-600/5 group-hover:bg-primary-600/10 transition-all -z-10"></div>
                <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-5xl font-black shadow-2xl relative group/avatar cursor-pointer overflow-hidden border-4 border-background-dark">
                        {user.name?.[0]}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-background-dark flex items-center justify-center shadow-lg">
                        <CheckCircle size={16} className="text-white" />
                    </div>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter mb-1 italic">{user.name}</h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-6 italic">@{formData.username || 'unassigned_id'}</p>
                
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${calculateCompletion()}%` }} className="h-full bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></motion.div>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 flex justify-between italic">
                    <span>Identity Strength</span>
                    <span className="text-primary-400">{calculateCompletion()}%</span>
                </p>
            </div>

            <nav className="glass-card p-4 space-y-2">
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile Info" />
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Security Vault" />
                <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} icon={Settings} label="Preferences" />
            </nav>

            <div className="glass-card p-8 border-yellow-500/20 bg-yellow-500/5">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-4 flex items-center italic">
                    <AlertCircle size={12} className="mr-2" /> Compliance Alert
                </h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-relaxed italic">Your campus legacy is partially synced. Verify phone to unlock premium master ledger features.</p>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.section key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <section className="glass-card p-10 md:p-12 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-widest italic">Identity <span className="text-primary-400">Ledger</span></h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic mt-2">Manage your public campus authority nodes</p>
                                </div>
                                <button onClick={handleUpdateProfile} disabled={loading} className="btn-primary py-3 px-8 text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl">
                                    {loading ? <Loader className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />} Save Sync
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Full Authority Name" icon={User} value={formData.name} onChange={(v) => setFormData({...formData, name: v})} placeholder="Real Identity" />
                                <InputField label="Campus Username" icon={Rocket} value={formData.username} onChange={(v) => setFormData({...formData, username: v.toLowerCase().replace(/\s/g, '_')})} placeholder="unique_identifier" />
                                
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 block italic ml-1">Identity Bio / Manifesto ({formData.bio.length}/500)</label>
                                    <textarea 
                                        maxLength={500}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none text-white italic min-h-[120px] shadow-inner transition-all"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        placeholder="Briefly define your campus existence..."
                                    />
                                </div>

                                <InputField label="Operational Location" icon={MapPin} value={formData.location} onChange={(v) => setFormData({...formData, location: v})} placeholder="City, Campus Node" />
                                <SelectField label="Current Objective (Looking For)" icon={Search} value={formData.lookingFor} onChange={(v) => setFormData({...formData, lookingFor: v})} options={['', 'Friends', 'Study Partner', 'Gym Buddy', 'Project Collaborator', 'Mentor', 'Expertise']} />
                                
                                <InputField label="Academic Base (College)" icon={GraduationCap} value={formData.college} onChange={(v) => setFormData({...formData, college: v})} placeholder="Institution" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Branch" icon={Briefcase} value={formData.branch} onChange={(v) => setFormData({...formData, branch: v})} placeholder="Stream" />
                                    <InputField label="Year" icon={Star} value={formData.year} onChange={(v) => setFormData({...formData, year: v})} placeholder="Batch" />
                                </div>

                                <div className="md:col-span-2">
                                    <TagInput label="Mastery Skills" icon={Code} tags={formData.skills} setTags={(tags) => setFormData({...formData, skills: tags})} placeholder="Add skill and press enter..." />
                                </div>
                                <div className="md:col-span-2">
                                    <TagInput label="Sync Interests" icon={Heart} tags={formData.interests} setTags={(tags) => setFormData({...formData, interests: tags})} placeholder="Add interest and press enter..." />
                                </div>
                                <div className="md:col-span-2">
                                    <TagInput label="Operational Availability" icon={Clock} tags={formData.availability} setTags={(tags) => setFormData({...formData, availability: tags})} placeholder="e.g. Mon 2-4 PM, Weekends..." />
                                </div>
                            </div>
                        </section>

                        <section className="glass-card p-10 md:p-12">
                             <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center italic">
                                <Phone size={16} className="mr-3 text-primary-400" /> Secure Contact Node
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 opacity-60 grayscale cursor-not-allowed">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Authority (Read Only)</label>
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-bold text-gray-400 italic">
                                        <Mail size={16} className="mr-4" /> {user.email}
                                    </div>
                                </div>
                                <InputField label="Phone Node" icon={Phone} value={user.phone} onChange={() => {}} placeholder="Mobile identity" disabled />
                             </div>
                        </section>
                    </motion.section>
                )}

                {activeTab === 'security' && (
                    <motion.section key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <section className="glass-card p-10 md:p-12">
                            <h3 className="text-2xl font-black uppercase tracking-widest mb-10 italic">Secure <span className="text-primary-400">Vault</span> Auth</h3>
                            <form onSubmit={handleChangePassword} className="space-y-8 max-w-xl">
                                <InputField type="password" label="Current Access Credential" icon={LockKeyhole} value={passwordData.currentPassword} onChange={(v) => setPasswordData({...passwordData, currentPassword: v})} placeholder="••••••••" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputField type="password" label="New Master Credential" icon={Shield} value={passwordData.newPassword} onChange={(v) => setPasswordData({...passwordData, newPassword: v})} placeholder="••••••••" />
                                    <InputField type="password" label="Confirm Credential" icon={CheckCircle} value={passwordData.confirmPassword} onChange={(v) => setPasswordData({...passwordData, confirmPassword: v})} placeholder="••••••••" />
                                </div>
                                <button disabled={loading} className="btn-primary py-4 px-10 text-[10px] font-black uppercase tracking-widest flex items-center">
                                    {loading ? <Loader className="animate-spin mr-2" size={14} /> : <Lock className="mr-2" size={14} />} Update Vault Authority
                                </button>
                            </form>
                        </section>

                        <section className="glass-card p-10 md:p-12">
                             <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest italic flex items-center">
                                        <Smartphone size={16} className="mr-3 text-primary-400" /> Multi-Factor Authorization
                                    </h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic mt-2">Add secondary verification for ledger access</p>
                                </div>
                                <button 
                                    onClick={() => setFormData({...formData, otpEnabled: !formData.otpEnabled})}
                                    className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.otpEnabled ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}
                                >
                                    <motion.div animate={{ x: formData.otpEnabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-lg shadow-xl" />
                                </button>
                             </div>
                        </section>

                        <section className="glass-card p-10 md:p-12 opacity-50">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-10 italic flex items-center">
                                <Monitor size={16} className="mr-3 text-primary-400" /> Active Session Mapping
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center space-x-6">
                                        <div className="p-3 bg-primary-600/20 rounded-xl text-primary-400"><Monitor size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Chrome on MacOS (Current Node)</p>
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest italic mt-1">Delhi, India · 127.0.0.1</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500">Authorized</span>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                                    <div className="flex items-center space-x-6">
                                        <div className="p-3 bg-white/5 rounded-xl text-gray-500"><Smartphone size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Safari on iPhone 15</p>
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest italic mt-1">Last Active: 2h ago</p>
                                        </div>
                                    </div>
                                    <button className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">Terminate</button>
                                </div>
                            </div>
                        </section>
                    </motion.section>
                )}

                {activeTab === 'preferences' && (
                    <motion.section key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <section className="glass-card p-10 md:p-12">
                            <h3 className="text-2xl font-black uppercase tracking-widest mb-12 italic">System <span className="text-primary-400">Environment</span></h3>
                            
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest italic flex items-center">
                                            <Moon size={16} className="mr-3 text-primary-400" /> interface aesthetic (Dark Mode)
                                        </h4>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase mt-2">Optimized for low-light campus development</p>
                                    </div>
                                    <Toggle active={formData.preferences.theme === 'dark'} onClick={() => setFormData({...formData, preferences: {...formData.preferences, theme: formData.preferences.theme === 'dark' ? 'light' : 'dark'}})} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest italic flex items-center">
                                            <Eye size={16} className="mr-3 text-primary-400" /> Identity Visibility (Public)
                                        </h4>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase mt-2">Allow your node to be discoverable in campus searches</p>
                                    </div>
                                    <Toggle active={formData.preferences.privacy === 'Public'} onClick={() => setFormData({...formData, preferences: {...formData.preferences, privacy: formData.preferences.privacy === 'Public' ? 'Private' : 'Public'}})} />
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest italic flex items-center mb-8">
                                        <Bell size={16} className="mr-3 text-primary-400" /> Notification Dispatch Rules
                                    </h4>
                                    <div className="space-y-6">
                                        <Checkbox label="Email Synchronization Alerts" description="Critical vault and message updates via SMTP" checked={formData.preferences.notifications.email} onChange={(v) => setFormData({...formData, preferences: {...formData.preferences, notifications: {...formData.preferences.notifications, email: v}}})} />
                                        <Checkbox label="Push Authority Signals" description="Real-time browser notifications for node interactions" checked={formData.preferences.notifications.push} onChange={(v) => setFormData({...formData, preferences: {...formData.preferences, notifications: {...formData.preferences.notifications, push: v}}})} />
                                        <Checkbox label="SMS Link Dispatch" description="Mobile network alerts for identity synchronization" checked={formData.preferences.notifications.sms} onChange={(v) => setFormData({...formData, preferences: {...formData.preferences, notifications: {...formData.preferences.notifications, sms: v}}})} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-10 border-t border-white/10 flex justify-end">
                                <button onClick={handleUpdateProfile} disabled={loading} className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                    Store Environment State
                                </button>
                            </div>
                        </section>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* Sub-components for modularity */

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center p-5 rounded-2xl transition-all group ${active ? 'bg-primary-600 text-white shadow-xl translate-x-1' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
    >
        <Icon size={18} className={`mr-4 transition-colors ${active ? 'text-white' : 'group-hover:text-primary-400'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        {active && <ChevronRight size={14} className="ml-auto animate-pulse" />}
    </button>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false }) => (
    <div className="space-y-2 group">
        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 transition-colors group-focus-within:text-primary-400">{label}</label>
        <div className="relative">
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={16} />
            <input 
                type={type}
                disabled={disabled}
                placeholder={placeholder} 
                className={`w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-600 outline-none text-white italic shadow-inner transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/20'}`} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
            />
        </div>
    </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options }) => (
    <div className="space-y-2 group">
        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 transition-colors group-focus-within:text-primary-400">{label}</label>
        <div className="relative">
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors pointer-events-none" size={16} />
            <select 
                className="w-full pl-14 pr-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-600 outline-none text-white italic shadow-inner appearance-none transition-all hover:border-white/20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(opt => <option key={opt} value={opt} className="bg-background-dark">{opt || 'Select Objective'}</option>)}
            </select>
        </div>
    </div>
);

const TagInput = ({ label, icon: Icon, tags, setTags, placeholder }) => {
    const [input, setInput] = useState('');
    const addTag = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) setTags([...tags, input.trim()]);
            setInput('');
        }
    };
    const removeTag = (t) => setTags(tags.filter(tag => tag !== t));

    return (
        <div className="space-y-4 group">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 group-focus-within:text-primary-400 transition-colors">{label}</label>
            <div className="relative">
                <Icon className="absolute left-5 top-7 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={16} />
                <div className="flex flex-wrap gap-2 p-4 pt-10 min-h-[100px] bg-white/5 border border-white/10 rounded-3xl shadow-inner focus-within:ring-2 focus-within:ring-primary-600 transition-all">
                    {tags.map(t => (
                        <span key={t} className="px-4 py-1.5 bg-primary-600/10 border border-primary-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary-300 flex items-center shadow-lg group/tag">
                            {t} <button onClick={() => removeTag(t)} className="ml-2 hover:text-red-400 transition-colors"><X size={10} /></button>
                        </span>
                    ))}
                    <input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={addTag}
                        placeholder={placeholder}
                        className="bg-transparent outline-none text-xs font-bold text-white italic p-2 flex-grow min-w-[150px]"
                    />
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-14 h-8 rounded-full transition-all relative p-1 ${active ? 'bg-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}
    >
        <motion.div animate={{ x: active ? 24 : 0 }} className="w-6 h-6 bg-white rounded-lg shadow-xl" />
    </button>
);

const Checkbox = ({ label, description, checked, onChange }) => (
    <label className="flex items-center space-x-6 cursor-pointer group p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
        <div 
            onClick={() => onChange(!checked)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary-600 border-primary-500 shadow-lg' : 'border-white/20 group-hover:border-white/40'}`}
        >
            {checked && <Save size={12} className="text-white" />}
        </div>
        <div onClick={() => onChange(!checked)}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{label}</p>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest opacity-60 mt-1 italic">{description}</p>
        </div>
    </label>
);

export default Profile;
