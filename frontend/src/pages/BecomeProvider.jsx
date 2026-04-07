import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Rocket, Star, CheckCircle, Smartphone, Globe, Mail, MessageSquare, Phone, Info, Briefcase, IndianRupee, CreditCard, HelpCircle, Save, X, Settings, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BecomeProvider = () => {
    const { user, updateProfile, fetchCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        hourlyRate: '',
        providerCategory: 'Study',
        isProvider: true,
        skills: ''
    });

    const [activeSkills, setActiveSkills] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                hourlyRate: user.hourlyRate || '',
                providerCategory: user.providerCategory || 'Study',
                isProvider: true,
                skills: ''
            });
            setActiveSkills(Array.isArray(user.skills) ? user.skills : []);
        }
    }, [user]);

    const handleRemoveSkill = (skillToRemove) => {
        setActiveSkills(prev => prev.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadId = toast.loading('Synchronizing Provider Authority...');
        try {
            const newSkillsTyped = String(formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
            const finalSkills = [...new Set([...activeSkills, ...newSkillsTyped])];

            const updatedData = {
                ...formData,
                skills: finalSkills,
                hourlyRate: Number(formData.hourlyRate) || 0
            };
            await updateProfile(updatedData);
            await fetchCurrentUser();
            toast.success('Authority Escalated: Provider Rights Active', { id: loadId });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            const errDetails = error.response?.data?.message || error.message || 'Check Connection';
            toast.error(`Authority Sync Failed: ${errDetails}`, { id: loadId });
        } finally {
            setLoading(false);
        }
    };

    const isUpdateMode = user?.isProvider;

    return (
        <div className="max-w-7xl mx-auto px-6">
            <header className="flex flex-col md:flex-row items-center justify-between mb-20 animate-fade-in text-center md:text-left">
                <div>
                   <span className="flex items-center space-x-2 px-3 py-1 bg-primary-600/10 text-primary-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-primary-500/20 mb-3 w-fit mx-auto md:mx-0">
                      <Zap size={10} className="animate-pulse" />
                      <span>{isUpdateMode ? 'Update Pro Authority' : 'Request Pro Authority Handshake'}</span>
                   </span>
                   <h1 className="text-4xl md:text-7xl font-black mb-1 uppercase tracking-tighter tracking-widest leading-none">
                       {isUpdateMode ? 'Expand your' : 'Become a'} <span className="gradient-text italic">Provider</span>
                   </h1>
                   <p className="text-gray-400 font-bold italic opacity-70 uppercase tracking-widest text-[10px] max-w-lg mt-4 leading-relaxed">
                       {isUpdateMode 
                        ? 'Update your category, rate, or add more skills to offer a wider range of academic support.'
                        : 'Monetize your campus expertise legacy by helping fellow buddies with the skills you\'ve mastered.'}
                   </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <Feature num="01" icon={Briefcase} title="List Your Expertise" desc="Select categories and list specialized skills that you want to offer to the campus network." />
                   <Feature num="02" icon={IndianRupee} title="Set Your Rate" desc="Decide your credit per hour value. Higher ratings allow for escalation of your authority level." />
                   <Feature num="03" icon={Star} title="Build Legacy" desc="Every successful sync handshake boosts your reputation in the campus ranking." />
                </div>

                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-12 relative overflow-hidden shadow-2xl border-primary-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[120px] -z-10 bg-blue-600/10"></div>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-1 italic">Provider Category</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-primary-600 outline-none text-white tracking-widest appearance-none shadow-xl"
                                    value={formData.providerCategory}
                                    onChange={(e) => setFormData({...formData, providerCategory: e.target.value})}
                                >
                                    <option value="Study">Study Session</option>
                                    <option value="Project">Project Sync</option>
                                    <option value="Sports">Event / Sports</option>
                                    <option value="Tech">Technical Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block ml-1 italic">Active Specializations</label>
                                
                                {activeSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {activeSkills.map(skill => (
                                            <span key={skill} className="px-4 py-2 bg-primary-600/20 text-primary-300 text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-500/30 flex items-center shadow-lg">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-red-400 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-1 italic mt-6">Add New Skills (Comma Separated)</label>
                                <div className="text-left">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. PYTHON, CLOUD COMPUTING..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-black focus:ring-2 focus:ring-primary-600 outline-none text-white tracking-widest shadow-xl uppercase"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                    />
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 text-gray-400 ml-2 mt-2 block">These will be appended to your active skills above.</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-1 italic">Your Rate (Credits/Hour)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                                    <input 
                                        type="number" 
                                        placeholder="500" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-black italic focus:ring-2 focus:ring-primary-600 outline-none text-white shadow-xl"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="btn-primary w-full py-6 text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(139,92,246,0.3)] flex items-center justify-center transition-all group"
                        >
                            {loading ? <Loader className="animate-spin mr-3" size={18} /> : <Rocket size={18} className="mr-3 group-hover:rotate-12 transition-all" />}
                            Execute Escalation
                        </button>
                        <p className="text-[9px] text-center text-gray-600 font-extrabold uppercase italic px-10 leading-relaxed opacity-60">
                            By escalating your authority, you agree to comply with the Campus Buddy Protocol and maintaining high-integrity syncs.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

const Feature = ({ num, icon: Icon, title, desc }) => (
    <div className="flex items-start space-x-8 group">
        <div className="text-5xl font-black text-primary-600/20 group-hover:text-primary-600/40 transition-colors italic">{num}</div>
        <div>
           <div className="flex items-center mb-3">
              <Icon size={20} className="text-primary-400 mr-3" />
              <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
           </div>
           <p className="text-sm font-extrabold text-gray-500 uppercase italic opacity-60 leading-relaxed max-w-md">{desc}</p>
        </div>
    </div>
);

export default BecomeProvider;
