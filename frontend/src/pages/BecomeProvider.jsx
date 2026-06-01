import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Rocket, Star, CheckCircle, Briefcase, 
  IndianRupee, X, Loader, ShieldCheck, Cpu, 
  Layers, ArrowRight, ArrowLeft, Target, TrendingUp, Info,
  Upload, Check, MapPin, Calendar, FileText, Phone, CreditCard, Link as LinkIcon, User, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InputField = ({ icon: Icon, label, value, onChange, placeholder, type = 'text', prefix }) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors pointer-events-none" size={18} />}
            {prefix && !Icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">{prefix}</span>}
            <input 
                type={type} 
                placeholder={placeholder} 
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${Icon ? 'pl-12' : prefix ? 'pl-10' : 'pl-6'} pr-6 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner placeholder-gray-600/50 text-white`}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    </div>
);

const ToggleField = ({ label, description, checked, onChange }) => (
    <div className="flex items-start justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
        <div>
           <h4 className="text-xs font-black uppercase tracking-widest text-gray-200">{label}</h4>
           {description && <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1 opacity-70 italic">{description}</p>}
        </div>
        <div className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors ${checked ? 'bg-primary-500' : 'bg-background-dark shadow-inner border border-white/10'}`}>
            <motion.div layout className={`w-3 h-3 rounded-full bg-white shadow-md ${checked ? 'ml-auto' : ''}`} />
        </div>
    </div>
);

const BecomeProvider = () => {
    const { user, updateProfile, fetchCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const isUpdateMode = user?.isProvider;
    // If they are already a provider, they see the dashboard first.
    const [showDashboard, setShowDashboard] = useState(isUpdateMode);
    
    // Step starts at 2 if they are adding an additional service (skip identity step)
    const [step, setStep] = useState(1);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '', collegeEmail: '', college: '', rollNumber: '', branch: '', year: '',
        professionalTitle: '', providerCategory: 'Study', skills: '', bio: '', experienceLevel: 'Beginner', languages: '',
        pricingType: 'Per Hour', hourlyRate: '', availability: '', serviceMode: 'Both', location: '',
        previousExperience: '', socialLinks: '',
        phone: '', contactMethod: 'In-App Chat', upiId: '', canTravel: false, emergencyHelp: false, urgentRequests: false, preferredSpot: '', termsAccepted: false, guidelinesAccepted: false,
    });

    const [activeSkills, setActiveSkills] = useState([]);

    useEffect(() => {
        if (user && !isUpdateMode) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '', college: user.college || '', branch: user.branch || '',
                year: user.year || '', phone: user.phone || ''
            }));
        }
    }, [user, isUpdateMode]);

    const handleRemoveSkill = (skillToRemove) => {
        setActiveSkills(prev => prev.filter(s => s !== skillToRemove));
    };

    const handleNext = () => {
        const minStep = isUpdateMode ? 2 : 1;
        if (step === 1 && (!formData.name || !formData.college || !formData.branch)) {
            return toast.error('Required Identity Fields Missing');
        }
        if (step === 2 && !formData.providerCategory) {
            return toast.error('Category is required');
        }
        if (step === 3 && (!formData.hourlyRate || !formData.location)) {
            return toast.error('Pricing and Location required');
        }
        setStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrev = () => {
        const minStep = isUpdateMode ? 2 : 1;
        setStep(prev => Math.max(prev - 1, minStep));
    };

    const startAdditionalService = () => {
        // Reset form for new service fields but jump to Step 2
        setFormData(prev => ({
            ...prev,
            professionalTitle: '', providerCategory: 'Study', skills: '', bio: '', experienceLevel: 'Beginner', languages: '',
            pricingType: 'Per Hour', hourlyRate: '', availability: '', serviceMode: 'Both', location: '',
            previousExperience: '', socialLinks: '', termsAccepted: false, guidelinesAccepted: false
        }));
        setActiveSkills([]);
        setStep(2);
        setShowDashboard(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.termsAccepted || !formData.guidelinesAccepted) {
            return toast.error('You must accept the terms and guidelines to proceed');
        }

        setLoading(true);
        const loadId = toast.loading('Saving your profile...');
        try {
            const newSkillsTyped = String(formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
            const finalSkills = [...new Set([...activeSkills, ...newSkillsTyped])];

            let updatedData = {};

            if (isUpdateMode) {
                // Adding an additional service layer!
                const newService = {
                    title: formData.professionalTitle || 'Additional Service',
                    category: formData.providerCategory,
                    skills: finalSkills,
                    bio: formData.bio || formData.previousExperience,
                    rate: Number(formData.hourlyRate) || 0,
                    pricingType: formData.pricingType,
                    experienceLevel: formData.experienceLevel,
                    location: formData.location + (formData.preferredSpot ? ` | Spot: ${formData.preferredSpot}` : ''),
                    mode: formData.serviceMode,
                    availability: formData.availability ? formData.availability.split(',').map(s=>s.trim()) : [],
                    addedAt: new Date().toISOString()
                };

                updatedData = {
                    skills: [...new Set([...(user.skills || []), ...finalSkills])], // Merge skills for global search
                    additionalServices: [...(user.additionalServices || []), newService]
                };
            } else {
                // First time provider registration configuration
                updatedData = {
                    name: formData.name,
                    college: formData.college,
                    branch: formData.branch,
                    year: formData.year,
                    bio: formData.bio || formData.previousExperience,
                    location: formData.location + (formData.preferredSpot ? ` | Spot: ${formData.preferredSpot}` : ''),
                    hourlyRate: Number(formData.hourlyRate) || 0,
                    providerCategory: formData.providerCategory,
                    skills: finalSkills,
                    availability: formData.availability ? formData.availability.split(',').map(s=>s.trim()) : [],
                    isProvider: true,
                    phone: formData.phone || user.phone,
                    preferences: { ...(user?.preferences || {}), isVerifiedProvider: true }
                };
            }
            
            await updateProfile(updatedData);
            await fetchCurrentUser();
            toast.success(isUpdateMode ? 'Service successfully added!' : 'Registration Complete! Welcome to the Provider Network.', { id: loadId });
            
            if (isUpdateMode) {
                setShowDashboard(true);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authorization Failed', { id: loadId });
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    // DASHBOARD VIEW
    if (showDashboard) {
        const primaryService = {
            title: 'Primary Service',
            category: user.providerCategory,
            rate: user.hourlyRate,
            skills: user.skills || [],
            bio: user.bio,
            availability: user.availability || []
        };
        const allServices = [primaryService, ...(user.additionalServices || [])];

        return (
            <div className="max-w-6xl mx-auto py-12 px-6 pt-28 min-h-screen">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Your Active <span className="text-primary-400">Services</span></h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] italic max-w-sm">Review and manage the services you offer to fellow students on BuddyUp.</p>
                    </div>
                    <button onClick={startAdditionalService} className="btn-primary py-3 px-8 text-[10px] uppercase font-black tracking-widest shadow-2xl flex items-center">
                        <Plus size={16} className="mr-2" /> Add New Service
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {allServices.map((svc, idx) => (
                        <div key={idx} className="glass-card p-8 border-white/5 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                            {idx === 0 && <div className="absolute top-4 right-4 bg-primary-600/20 text-primary-400 border border-primary-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Primary Identity</div>}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-white capitalize mb-1">{svc.title || 'Service'}</h3>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">{svc.category}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-primary-400 flex items-center justify-end"><IndianRupee size={16}/>{svc.rate}</div>
                                    <span className="text-[8px] uppercase tracking-widest font-black text-gray-600">{svc.pricingType || 'Per Hour'}</span>
                                </div>
                            </div>
                            
                            <p className="text-xs font-medium text-gray-400 mb-6 line-clamp-3 italic">"{svc.bio || 'No description provided.'}"</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {svc.skills?.slice(0, 5).map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-white/5 text-gray-300 rounded text-[9px] font-black uppercase tracking-widest border border-white/10">{skill}</span>
                                ))}
                                {(svc.skills?.length > 5) && <span className="px-3 py-1 bg-white/5 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-white/10">+{svc.skills.length - 5}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // WIZARD START
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 pt-28">
            <div className="glass-card p-8 md:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 backdrop-blur-3xl min-h-[600px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
                
                {isUpdateMode && (
                   <button onClick={() => setShowDashboard(true)} className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center text-[10px] font-black uppercase tracking-widest transition-all z-20">
                      <ArrowLeft size={14} className="mr-2" /> Back to Dashboard
                   </button>
                )}

                {/* Header Progress */}
                <div className={`mb-10 z-10 relative ${isUpdateMode ? 'mt-10' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 border border-primary-500/20 bg-primary-500/10 px-3 py-1 rounded-full shadow-inner">
                           Step {isUpdateMode ? step - 1 : step} of {isUpdateMode ? '4' : '5'}
                       </span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {step === 1 && "Identity"}
                          {step === 2 && "Profile Details"}
                          {step === 3 && "Pricing"}
                          {step === 4 && "Credibility"}
                          {step === 5 && "Confirm"}
                       </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                       <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 via-primary-500 to-primary-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${((isUpdateMode ? step - 1 : step) / (isUpdateMode ? 4 : 5)) * 100}%` }}
                          transition={{ duration: 0.4 }}
                       />
                    </div>
                </div>

                {/* Form Steps */}
                <div className="flex-1 z-10 relative custom-scrollbar overflow-x-hidden py-4">
                    <AnimatePresence mode="wait">
                        {step === 1 && !isUpdateMode && (
                           <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8" key="step1">
                                <div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Identity <span className="text-primary-400">Verification</span></h2><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Verify your identity as a student</p></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <InputField icon={User} label="Full Name *" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="John Doe" />
                                   <InputField icon={Briefcase} label="College / University *" value={formData.college} onChange={v => setFormData({...formData, college: v})} placeholder="IIT Bombay" />
                                   <InputField icon={Layers} label="Branch / Department *" value={formData.branch} onChange={v => setFormData({...formData, branch: v})} placeholder="Computer Science" />
                                </div>
                                <div className="glass-card flex items-center justify-center p-6 border-dashed border-white/20 hover:border-primary-500/50 cursor-pointer transition-colors group bg-white/5">
                                   <div className="text-center">
                                      <Upload className="mx-auto mb-3 text-gray-500 group-hover:text-primary-400 transition-colors" size={24} />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Upload Identity Documentation</p>
                                   </div>
                                </div>
                           </motion.div>
                        )}
                        {step === 2 && (
                           <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8" key="step2">
                               <div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{isUpdateMode ? 'New Service' : 'Provider'} <span className="text-primary-400">Profile Setup</span></h2><p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Tell us about what you can offer</p></div>
                               <InputField icon={Star} label="Professional Title / Headline" value={formData.professionalTitle} onChange={v => setFormData({...formData, professionalTitle: v})} placeholder="e.g. Senior Frontend Developer | Math Tutor" />
                               <div>
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">Service Category *</label>
                                   <div className="relative group">
                                       <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors pointer-events-none" size={18} />
                                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-inner appearance-none text-white tracking-widest uppercase" value={formData.providerCategory} onChange={e => setFormData({...formData, providerCategory: e.target.value})}>
                                           <option value="Study" className="bg-background-dark">STUDY SESSION & TUTORING</option>
                                           <option value="Project" className="bg-background-dark">PROJECT DEVELOPMENT</option>
                                           <option value="Sports" className="bg-background-dark">SPORTS & EVENTS</option>
                                           <option value="Tech" className="bg-background-dark">TECHNICAL SUPPORT</option>
                                       </select>
                                   </div>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">Expertise Tags</label>
                                   <div className="flex flex-wrap gap-2 mb-3">
                                       {activeSkills.map(skill => (
                                           <span key={skill} className="px-3 py-1 bg-primary-600/10 text-primary-300 text-[10px] font-black uppercase tracking-widest rounded border border-primary-500/20 flex items-center">
                                               {skill} <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-red-400"><X size={12}/></button>
                                           </span>
                                       ))}
                                   </div>
                                   <InputField icon={Cpu} label="Add Skills (Comma separated)" value={formData.skills} onChange={v => setFormData({...formData, skills: v})} placeholder="React, Data Structures, Guitar..." />
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">Service Description / Bio</label>
                                   <textarea rows="3" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500 shadow-inner custom-scrollbar" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe what you offer in a few sentences..." />
                               </div>
                           </motion.div>
                        )}
                        {step === 3 && (
                           <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8" key="step3">
                                <div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Pricing & <span className="text-primary-400">Availability</span></h2></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="relative">
                                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">Pricing Type</label>
                                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-inner appearance-none text-white tracking-widest uppercase" value={formData.pricingType} onChange={e => setFormData({...formData, pricingType: e.target.value})}>
                                           <option value="Per Hour" className="bg-background-dark">Per Hour</option>
                                           <option value="Per Session" className="bg-background-dark">Per Session</option>
                                           <option value="Fixed" className="bg-background-dark">Fixed Total</option>
                                       </select>
                                   </div>
                                   <InputField icon={IndianRupee} label="Base Rate (Credits) *" value={formData.hourlyRate} onChange={v => setFormData({...formData, hourlyRate: v})} placeholder="500" type="number" />
                                </div>
                                <InputField icon={Calendar} label="Availability" value={formData.availability} onChange={v => setFormData({...formData, availability: v})} placeholder="Mon-Fri Evenings, Weekends Only..." />
                                <InputField icon={MapPin} label="Service Location *" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="Library, Hostel A, Online..." />
                           </motion.div>
                        )}
                        {step === 4 && (
                           <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8" key="step4">
                                <div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Credibility <span className="text-primary-400">& Achievements</span></h2></div>
                                <div className="glass-card flex items-center justify-center p-6 border-dashed border-white/20 hover:border-primary-500/50 cursor-pointer transition-colors group bg-white/5">
                                   <div className="text-center">
                                      <FileText className="mx-auto mb-3 text-gray-500 group-hover:text-primary-400 transition-colors" size={24} />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Upload Media / Portfolio Samples</p>
                                   </div>
                                </div>
                                <div>
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block ml-1 italic">Experience & Achievements</label>
                                   <textarea rows="3" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500 shadow-inner custom-scrollbar" value={formData.previousExperience} onChange={e => setFormData({...formData, previousExperience: e.target.value})} placeholder="Won campus hackathon, tutored 20+ juniors..." />
                                </div>
                           </motion.div>
                        )}
                        {step === 5 && (
                           <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8" key="step5">
                                <div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Platform <span className="text-primary-400">Setup</span></h2></div>
                                <div className="space-y-3 mt-6">
                                    <ToggleField label="Can Travel Across Campus" description="Offer services at target node location" checked={formData.canTravel} onChange={v => setFormData({...formData, canTravel: v})} />
                                    <ToggleField label="Available for Emergency Help" description="Prioritize urgent assignment syncs" checked={formData.emergencyHelp} onChange={v => setFormData({...formData, emergencyHelp: v})} />
                                </div>
                                <div className="glass-card p-6 bg-red-500/5 border-red-500/20 mt-6 space-y-4">
                                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setFormData({...formData, termsAccepted: !formData.termsAccepted})}>
                                        <div className={`w-5 h-5 rounded shadow-inner flex items-center justify-center border ${formData.termsAccepted ? 'bg-primary-500 border-primary-500' : 'bg-background-dark border-white/20'}`}>
                                            {formData.termsAccepted && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">I accept Provider Terms & Conditions *</span>
                                    </div>
                                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setFormData({...formData, guidelinesAccepted: !formData.guidelinesAccepted})}>
                                        <div className={`w-5 h-5 rounded shadow-inner flex items-center justify-center border ${formData.guidelinesAccepted ? 'bg-primary-500 border-primary-500' : 'bg-background-dark border-white/20'}`}>
                                            {formData.guidelinesAccepted && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">I agree to Campus Community Guidelines *</span>
                                    </div>
                                </div>
                           </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                <div className="pt-8 mt-4 border-t border-white/10 flex items-center justify-between z-10 relative">
                   <button 
                       onClick={handlePrev}
                       disabled={step === (isUpdateMode ? 2 : 1)}
                       className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${step === (isUpdateMode ? 2 : 1) ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                   >
                       <ArrowLeft size={16} /> <span>Back</span>
                   </button>
                   
                   {step < 5 ? (
                       <button onClick={handleNext} className="flex items-center space-x-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/20 transition-all shadow-2xl hover:shadow-primary-500/20 active:scale-95">
                           <span>Continue</span> <ArrowRight size={16} />
                       </button>
                   ) : (
                       <button onClick={handleSubmit} disabled={loading} className="btn-primary py-3 px-8 flex items-center text-[10px] tracking-widest relative overflow-hidden group shadow-2xl justify-center font-black uppercase">
                           {loading ? <Loader className="animate-spin text-white" size={16} /> : (
                               <>{isUpdateMode ? 'Save New Service' : 'Complete Registration'}</>
                           )}
                       </button>
                   )}
                </div>
            </div>
        </div>
    );
};

export default BecomeProvider;
