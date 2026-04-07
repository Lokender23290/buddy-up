import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Plus, CheckCircle, Shield, IndianRupee, Loader, Filter, Search, FileText, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { walletAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/RazorpayModal';

const Wallet = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('500');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [bankData, setBankData] = useState({ holderName: '', accountNumber: '', ifscCode: '' });
  const [authorizing, setAuthorizing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await walletAPI.getWalletInfo();
      setBalance(response.data.balance);
      setTransactions(response.data.transactions);
    } catch (e) {
      toast.error('Ledger Audit Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInitiatePayment = async () => {
    if (!amount || amount <= 0) return;
    const loadId = toast.loading('Connecting Gateway...');
    try {
      const response = await walletAPI.createOrder(Number(amount));
      setActiveOrder(response.data.order);
      setIsRazorpayOpen(true);
      toast.dismiss(loadId);
    } catch (e) {
      toast.error('Gateway Connection Offline', { id: loadId });
    }
  };

  const handlePaymentSuccess = async (razorpayResponse) => {
    const loadId = toast.loading('Verifying Security Signature...');
    try {
      await walletAPI.verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      });
      setIsRazorpayOpen(false);
      toast.success('Sync Successful: Identity Vault Boosted', { id: loadId });
      fetchData();
    } catch (e) {
      toast.error('Verification Rejected: Cross-check Session', { id: loadId });
    }
  };

  const handleAuthorizeBank = async () => {
    if (!bankData.holderName || !bankData.accountNumber || !bankData.ifscCode) {
      return toast.error('Full credentials required');
    }
    setAuthorizing(true);
    const loadId = toast.loading('Syncing with Bank Authority...');
    try {
      await walletAPI.authorizeBank(bankData);
      toast.success('Bank Authority Sync Stable', { id: loadId });
      await fetchCurrentUser();
    } catch (e) {
      toast.error('Authority Rejected Credentials', { id: loadId });
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <header className="flex flex-col md:flex-row items-center justify-between mb-16 animate-fade-in relative">
        <div className="text-center md:text-left">
           <div className="flex items-center space-x-3 mb-2 justify-center md:justify-start">
              <span className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                 <Lock size={10} />
                 <span>AES-256 Encrypted</span>
              </span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-1 uppercase tracking-tighter tracking-widest leading-tight">Financial <span className="gradient-text">Hub</span></h1>
           <p className="text-gray-400 font-bold italic opacity-70 uppercase tracking-widest text-xs tracking-widest leading-relaxed">Securely manage your campus identity earnings</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-card p-12 relative overflow-hidden group shadow-2xl border-primary-500/20"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] -z-10 transition-all"></div>
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2 italic">Total Available Balance</h2>
                    <div className="flex items-center">
                       <span className="text-6xl font-black tracking-tighter italic">₹{balance.toLocaleString()}</span>
                       <span className="ml-4 px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Verified</span>
                    </div>
                 </div>
                 <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <WalletIcon size={32} className="text-white" />
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Connected to secure vault network</p>
           </motion.div>

           <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black uppercase tracking-widest italic flex items-center">
                    <Clock size={18} className="mr-3 text-primary-400" /> Identity Sync <span className="text-primary-400 ml-2">History</span>
                 </h3>
              </div>

              <div className="space-y-4">
                 {loading ? (
                    <div className="p-10 text-center opacity-30 font-black italic uppercase tracking-widest">Auditing Ledger...</div>
                 ) : transactions.length > 0 ? (
                    transactions.map(tx => (
                      <div key={tx._id} className="p-6 glass-card border-white/5 flex items-center justify-between group hover:border-primary-500/20 transition-all">
                         <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                               {tx.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                            </div>
                            <div>
                               <div className="flex items-center space-x-2 mb-1">
                                 <h4 className="text-sm font-black uppercase tracking-tight">{tx.description}</h4>
                                 {tx.status === 'completed' && <CheckCircle size={12} className="text-green-500" />}
                               </div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 italic">
                                 {new Date(tx.createdAt).toLocaleDateString()} · ID: {tx.paymentId || 'SESSION-ID'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`text-xl font-black italic tracking-tight ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                               ₹{tx.amount}
                            </span>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="p-20 glass-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center opacity-30">
                       <p className="text-xs font-black uppercase tracking-widest">Identity vault is empty</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-10 border-primary-500/20 shadow-2xl relative overflow-hidden group">
              <h3 className="text-lg font-black uppercase tracking-widest mb-2 italic">Secure Sync</h3>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic mb-8 opacity-60">Boost your campus vault instantly via our encrypted financial bridge.</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Amount (INR)</label>
                    <div className="relative">
                       <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                       <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black italic outline-none focus:ring-2 focus:ring-primary-500"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleInitiatePayment}
                   className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary-500 transition-all flex items-center justify-center space-x-3 group"
                 >
                    <span>Authorize Sync</span>
                    <CreditCard size={18} />
                 </button>
              </div>
           </div>

           {!user?.bankDetails?.isAuthorized ? (
             <div className="glass-card p-10 border-primary-500/20 shadow-2xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 italic">Payout Authority</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase italic mb-8 opacity-60">Bind a real bank account to enable automatic identity payouts.</p>
                <div className="space-y-4">
                   <input type="text" placeholder="HOLDER NAME" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase" value={bankData.holderName} onChange={e => setBankData({...bankData, holderName: e.target.value.toUpperCase()})} />
                   <input type="password" placeholder="ACCOUNT NUMBER" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black" value={bankData.accountNumber} onChange={e => setBankData({...bankData, accountNumber: e.target.value})} />
                   <input type="text" placeholder="IFSC CODE" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase" value={bankData.ifscCode} onChange={e => setBankData({...bankData, ifscCode: e.target.value.toUpperCase()})} />
                   <button onClick={handleAuthorizeBank} disabled={authorizing} className="w-full py-4 bg-primary-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                      {authorizing ? 'SYNCING...' : 'Authorize Bank'}
                   </button>
                </div>
             </div>
           ) : (
             <div className="glass-card p-10 border-green-500/20 shadow-2xl bg-green-500/5">
                <CheckCircle size={20} className="text-green-500 mb-2" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-1 italic text-green-500">Authorized</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase italic mb-6">{user.bankDetails?.bankName} (•••• {user.bankDetails?.accountNumber?.slice(-4)})</p>
                <button className="w-full py-4 bg-white/5 border border-white/10 opacity-30 cursor-not-allowed rounded-2xl text-[9px] font-black uppercase tracking-widest">Payout Pending Reach</button>
             </div>
           )}
        </div>
      </div>

      <RazorpayModal 
        isOpen={isRazorpayOpen} 
        onClose={() => setIsRazorpayOpen(false)}
        orderId={activeOrder?.id}
        amount={activeOrder?.amount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Wallet;
