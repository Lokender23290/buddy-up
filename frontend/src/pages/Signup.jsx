import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Rocket, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const { signup, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passcodes do not match for secure sync');
      return;
    }

    const loadId = toast.loading('Initializing Campus Identity...');
    try {
      await signup(formData);
      toast.success('Identity Created. Finalizing Sync...', { id: loadId });
      navigate('/otp-verification', { state: { email: formData.email, phone: formData.phone } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identity Sync Failed', { id: loadId });
    }
  };

  const handleGoogleSuccess = async (response) => {
    const loadId = toast.loading('Synchronizing Google Identity...');
    try {
      await googleLogin(response.credential);
      toast.success('Identity Verified. Welcome to BuddyUp!', { id: loadId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Auth Failed', { id: loadId });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-40 px-6 bg-background-dark/95 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-40 left-10 w-64 h-64 bg-primary-600/30 blur-[150px] -z-10 rounded-full animate-float"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-600/20 blur-[150px] -z-10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl glass-card p-12 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-600/10 blur-3xl -z-10 bg-blue-600/20"></div>
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter leading-tight tracking-widest">Join <span className="gradient-text">BuddyUp</span></h2>
            <p className="text-gray-400 font-bold italic opacity-70 mb-6 uppercase tracking-widest text-[10px] tracking-widest">Create your premium campus profile</p>
        </div>



        <div className="flex flex-col items-center justify-center mb-10 w-full">
            <div className="w-full flex justify-center scale-110 mb-2">
                <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Node Sync Failed')}
                    theme="filled_black"
                    shape="pill"
                />
            </div>
            <div className="flex items-center w-full my-6 opacity-20">
                <div className="flex-1 h-px bg-white"></div>
                <span className="px-4 text-[8px] font-black uppercase tracking-[0.3em]">Identity Hub Matrix</span>
                <div className="flex-1 h-px bg-white"></div>
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input type="text" placeholder="FULL NAME" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black tracking-widest text-xs" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input type="email" placeholder="EMAIL (EDU)" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black tracking-widest text-xs" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
            </div>
            <div className="group relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input type="text" placeholder="PHONE NUMBER" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black tracking-widest text-xs" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                    <input type={showPassword ? "text" : "password"} placeholder="PASSWORD" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black tracking-widest text-xs" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                    <input type={showPassword ? "text" : "password"} placeholder="CONFIRM" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black tracking-widest text-xs" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                </div>
            </div>
            <button disabled={loading} className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center shadow-2xl relative">
              {loading ? <Loader className="animate-spin text-white" /> : 'Begin Your Journey'}
            </button>
            <div className="text-center mt-8 p-4 glass rounded-xl border-white/10 cursor-pointer hover:bg-white/5 transition-all">
                <p className="text-gray-400 text-xs font-bold uppercase transition-all tracking-widest italic opacity-60">
                   Already have an account? <Link to="/login" className="text-primary-400 hover:text-white underline underline-offset-4 decoration-dashed tracking-widest">Sign In</Link>
                </p>
            </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
