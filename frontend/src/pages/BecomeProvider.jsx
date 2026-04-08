import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Rocket, Star, CheckCircle, Briefcase, 
  IndianRupee, X, Loader, ShieldCheck, Cpu, 
  Layers, ArrowRight, Target, TrendingUp, Info
} from 'lucide-react';
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
        if (!formData.hourlyRate) return toast.error('Authority rate required for monetization');
        
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
            toast.error(error.response?.data?.message || 'Authority Sync Failed', { id: loadId });
        } finally {
            setLoading(false);
        }
    };

    const isUpdateMode = user?.isProvider;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                
                {/* Visual Narrative Side */}
                <div className="lg:w-1/2 space-y-12">
                    <header className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <span className="flex items-center space-x-2 px-4 py-1.5 bg-primary-600/10 text-primary-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-500/20 w-fit">
                                <Zap size={12} className="animate-pulse" />
                                <span>Authority Escalation Matrix</span>
                            </span>
                        </motion.div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                            {isUpdateMode ? 'EXpanding' : 'INITIATING'} <br /> 
                            <span className="gradient-text italic">Pro Authority</span>
                        </h1>
                        <p className="text-gray-500 font-bold italic uppercase tracking-widest text-[11px] max-w-lg leading-relaxed opacity-70">
                            {isUpdateMode 
                                ? 'Refining your professional identity node to dominate the campus marketplace with enhanced specializations.'
                                : 'Transition from a consumer to an Authority Node. Monetize your expertise and influence the campus ledger.'}
                        </p>
                    </header>

                    <div className="space-y-8 relative">
                        <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary-600/40 via-primary-600/10 to-transparent -z-10"></div>
                        <StepItem 
                            num="01" 
                            icon={Target} 
                            title="Define Expertise Area" 
                            desc="Categorize your authority to align with specific campus needs and mission sets." 
                        />
                        <StepItem 
                            num="02" 
                            icon={TrendingUp} 
                            title="Set Marketplace Value" 
                            desc="Quantify your expertise legay in credits per hour. Higher rankings allow for premium rate tiers." 
                        />
                        <StepItem 
                            num="03" 
                            icon={ShieldCheck} 
                            title="Execute Compliance" 
                            desc="Commit to the BuddyUp high-integrity sync protocol for superior campus reputation." 
                        />
                    </div>
                    
                    <div className="glass-card p-8 border-primary-500/10 bg-primary-600/5 relative overflow-hidden group">
                        <Layers className="absolute -bottom-6 -right-6 text-primary-500/5 group-hover:scale-110 transition-transform duration-700" size={160} />
                        <div className="flex items-center space-x-6 relative z-10">
                            <div className="p-4 bg-primary-600/20 rounded-2xl text-primary-400">
                                <Info size={24} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1 italic">Identity Impact</h4>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter leading-relaxed italic pr-12">Providers with matched skillsets see a 300% increase in connection handshakes within the first week.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authority Form Side */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="lg:w-1/2 w-full"
                >
                    <div className="glass-card p-12 md:p-16 relative overflow-hidden shadow-2xl border-primary-500/20">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 blur-[150px] -z-10 bg-blue-600/20"></div>
                        
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-10">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 block ml-1 italic">Primary Authority Category</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors pointer-events-none" size={20} />
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-12 text-sm font-black focus:ring-2 focus:ring-primary-600 outline-none text-white tracking-[0.2em] appearance-none shadow-inner transition-all hover:border-white/20"
                                            value={formData.providerCategory}
                                            onChange={(e) => setFormData({...formData, providerCategory: e.target.value})}
                                        >
                                            <option value="Study" className="bg-background-dark">STUDY SESSION</option>
                                            <option value="Project" className="bg-background-dark">PROJECT SYNC</option>
                                            <option value="Sports" className="bg-background-dark">EVENT / SPORTS</option>
                                            <option value="Tech" className="bg-background-dark">TECH SUPPORT</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 block ml-1 italic">Identity Specializations</label>
                                    
                                    <div className="space-y-6">
                                        {activeSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-3">
                                                {activeSkills.map(skill => (
                                                    <motion.span 
                                                        key={skill} 
                                                        layout
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="px-5 py-2.5 bg-primary-600/10 text-primary-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary-500/20 flex items-center shadow-xl group/tag"
                                                    >
                                                        {skill}
                                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-3 hover:text-red-400 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </motion.span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative group">
                                            <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="PYTHON, REACT, NODE, AI..." 
                                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-8 text-xs font-black focus:ring-2 focus:ring-primary-600 outline-none text-white tracking-widest shadow-inner uppercase transition-all"
                                                value={formData.skills}
                                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                            />
                                            <div className="p-4 mt-3 bg-primary-500/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-gray-500 flex items-center italic">
                                                    <Info size={12} className="mr-2 text-primary-400" /> Use commas to separate multi-node skills.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 block ml-1 italic">Operational Rate (Credits/Hour)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center text-primary-400">
                                            <IndianRupee size={20} />
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="500" 
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-7 pl-20 pr-8 text-3xl font-black italic focus:ring-2 focus:ring-primary-600 outline-none text-white shadow-inner transition-all hover:border-white/20"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                disabled={loading}
                                className="btn-primary w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(99,102,241,0.3)] flex items-center justify-center transition-all group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loading ? (
                                    <Loader className="animate-spin mr-3" size={20} />
                                ) : (
                                    <>
                                        <Rocket size={20} className="mr-3 group-hover:rotate-12 group-hover:-translate-y-1 transition-all" />
                                        {isUpdateMode ? 'Update Authority' : 'Execute Escalation'}
                                    </>
                                )}
                            </button>
                            
                            <p className="text-[10px] text-center text-gray-600 font-extrabold uppercase italic px-6 leading-relaxed opacity-50">
                                Authority escalation requires compliance with the 
                                <span className="text-primary-500/80 mx-1 cursor-pointer hover:underline">Campus Identity Protocol</span> 
                                and maintaining verified high-integrity syncs.
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StepItem = ({ num, icon: Icon, title, desc }) => (
    <motion.div 
        whileHover={{ x: 10 }}
        className="flex items-start space-x-8 group cursor-default"
    >
        <div className="relative">
            <div className="w-12 h-12 bg-background-dark border border-white/10 rounded-2xl flex items-center justify-center text-primary-400 z-10 relative group-hover:border-primary-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                <Icon size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 text-[40px] font-black text-white/5 italic select-none group-hover:text-primary-600/10 transition-colors">
                {num}
            </div>
        </div>
        <div className="pt-1">
            <h3 className="text-base font-black uppercase tracking-tight mb-2 group-hover:text-primary-400 transition-colors italic">{title}</h3>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase italic opacity-60 leading-relaxed max-w-sm">{desc}</p>
        </div>
    </motion.div>
);

export default BecomeProvider;
