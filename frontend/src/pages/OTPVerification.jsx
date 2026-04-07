import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Phone, Mail, Loader, CheckCircle, AlertCircle, Rocket, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendPhoneOTP, sendEmailOTP, verifyOTP } = useAuth();

  const email = location.state?.email;
  const phone = location.state?.phone;

  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [type, setType] = useState('email'); 
  const [loading, setLoading] = useState(false);

  const identifier = type === 'email' ? email : phone;

  useEffect(() => {
    if (!email && !phone) {
      navigate('/signup');
      return;
    }
    
    handleSendOTP();
  }, [type]); 

  const handleSendOTP = async () => {
    const currentIdentifier = type === 'email' ? email : phone;
    if (!currentIdentifier) return;

    setLoading(true);
    const loadId = toast.loading(`Dispatching Sync Code to ${type.toUpperCase()}...`);
    try {
      if (type === 'email') {
        await sendEmailOTP(email);
        toast.success(`Verification code dispatched to ${email}`, { id: loadId });
      } else {
        await sendPhoneOTP(phone);
        toast.success(`Verification code dispatched to ${phone}`, { id: loadId });
      }
    } catch (err) {
      toast.error(`Verification service offline. Retry in ${import.meta.env.VITE_OTP_RETRY || '60s'}.`, { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (val) => {
    const code = val || otp;
    if (code.length !== 6) return;
    const currentIdentifier = type === 'email' ? email : phone;
    
    setLoading(true);
    const loadId = toast.loading('Synchronizing Identity with Vault...');
    try {
      await verifyOTP(currentIdentifier, code, type);
      setVerified(true);
      toast.success('Identity Authorized. Finalizing Session Sync...', { id: loadId });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Security Warning: Incorrect Access Token', { id: loadId });
      setOtp(''); // Reset on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-40 px-6 bg-background-dark/95 flex items-center justify-center relative overflow-hidden text-center">
      <div className="absolute top-40 left-10 w-64 h-64 bg-primary-600/30 blur-[150px] -z-10 rounded-full animate-float"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-600/20 blur-[150px] -z-10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl glass-card p-12 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-600/10 blur-3xl -z-10 bg-blue-600/20"></div>
        
        <header className="mb-12">
            <div className="w-20 h-20 bg-primary-600/20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl border border-primary-500/30">
               <Shield size={40} className="text-primary-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter leading-tight tracking-widest">Identify <span className="gradient-text">Sync</span></h2>
            <p className="text-gray-400 font-bold italic opacity-70 uppercase tracking-widest text-xs tracking-widest leading-relaxed">Enter the 6-digit synchronization code</p>
        </header>

        {/* Type Selector */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 border border-white/10">
           <button onClick={() => setType('email')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'email' ? 'bg-primary-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Email Verification</button>
           <button onClick={() => setType('phone')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'phone' ? 'bg-primary-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Phone Verification</button>
        </div>

        <div className={`w-full p-10 rounded-3xl transition-all duration-300 relative overflow-hidden ${verified ? 'bg-green-600/10 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
          <div className="flex items-center space-x-6 mb-8 justify-center">
            <div className={`p-4 rounded-2xl ${verified ? 'bg-green-500 text-white shadow-2xl' : 'bg-primary-600/20 text-primary-400'}`}>
              {type === 'email' ? <Mail size={24} /> : <Phone size={24} />}
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{type === 'email' ? 'Registered Email' : 'Registered Phone'}</h4>
              <p className="text-xs text-white font-black truncate max-w-[200px] italic">{type === 'email' ? email : phone}</p>
            </div>
          </div>

          {!verified ? (
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="000 000" 
                maxLength="6"
                className="w-full bg-white/5 border border-white/10 text-white text-center rounded-2xl py-6 font-black text-3xl tracking-[0.5em] focus:ring-2 focus:ring-primary-600 transition-all outline-none shadow-2xl"
                value={otp}
                onChange={(e) => {
                   const val = e.target.value.replace(/\D/g, '');
                   setOtp(val);
                   if (val.length === 6) handleVerify(val);
                }}
              />
              <div className="flex space-x-4">
                  <button 
                      onClick={() => handleVerify(otp)}
                      disabled={loading || otp.length !== 6}
                      className="flex-[3] py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 shadow-2xl"
                  >
                      {loading ? <Loader className="animate-spin mx-auto" size={18} /> : 'Verify Access Token'}
                  </button>
                  <button 
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl transition-all border border-white/5 flex items-center justify-center"
                  >
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                  <CheckCircle size={32} className="text-white" />
               </div>
               <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Identity Authorized</span>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
           <button onClick={() => navigate('/signup')} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-primary-400 transition-all flex items-center justify-center mx-auto group">
              <ArrowRight size={14} className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" /> Start Registration Over
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;

