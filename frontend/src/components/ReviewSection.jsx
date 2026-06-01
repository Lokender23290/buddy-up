import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader, Send, X } from 'lucide-react';
import { reviewAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const ReviewSection = ({ providerId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Modal State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await reviewAPI.getProviderReviews(providerId);
                setReviews(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [providerId]);

    const submitReview = async () => {
        if (rating === 0) return toast.error('Please select a star rating first.');
        if (!comment.trim()) return toast.error('Please leave a short review comment.');
        
        setSubmitting(true);
        const loadId = toast.loading('Syncing review with ledger...');
        try {
            const res = await reviewAPI.createReview({
                providerId,
                rating,
                comment
            });
            
            // Add review to state to refresh UI immediately
            setReviews([{...res.data.review, reviewer: { name: 'You (Sync Pending Refresh)' }}, ...reviews]);
            toast.success('Review synchronized successfully!', { id: loadId });
            setShowModal(false);
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to sync review', { id: loadId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="py-12 flex justify-center"><Loader className="animate-spin text-primary-400" /></div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Client <span className="text-primary-400">Reviews</span></h3>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-3 bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white border border-primary-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
                >
                    <Star size={14} /> <span>Leave Review</span>
                </button>
            </div>

            {reviews.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-[2rem] text-center glass-card bg-white/5">
                    <MessageSquare size={40} className="mx-auto mb-4 text-gray-600" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">No Reviews Yet</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 max-w-xs mx-auto italic">Be the first to leave a verified review for this provider's services.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev, idx) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="glass-card p-6 border-white/5 relative overflow-hidden rounded-[2rem]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center font-black text-primary-300 border border-primary-500/20">
                                        {rev.reviewer?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-white">{rev.reviewer?.name || 'Anonymous Student'}</p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">{new Date(rev.createdAt || new Date()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    {[1,2,3,4,5].map(star => (
                                        <Star key={star} size={12} className={star <= rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 font-bold leading-relaxed">"{rev.comment}"</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Leave Review Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card w-full max-w-md p-8 border-primary-500/30 shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden rounded-[2rem]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -z-10 rounded-full"></div>
                            
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-2">
                                <X size={16} />
                            </button>

                            <div className="mb-8 select-none border-b border-white/5 pb-6">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Leave a <span className="text-primary-400">Review</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Your review builds trust across the network</p>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 block italic">Select Rating</label>
                                <div className="flex space-x-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star 
                                                size={32} 
                                                className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-yellow-500 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-gray-600 hover:text-gray-400'}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block italic">Your Experience</label>
                                <textarea 
                                    rows="4" 
                                    placeholder="Describe how the service was..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-inner text-white resize-none custom-scrollbar"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                onClick={submitReview}
                                disabled={submitting}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-primary-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {submitting ? <Loader className="animate-spin" size={16} /> : <><Send size={14} className="mr-2"/> Submit Ledger Log</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReviewSection;
