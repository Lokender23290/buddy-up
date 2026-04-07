import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Rocket, Star, Shield, LayoutDashboard, Send, PlusCircle, CheckCircle, Briefcase, Mail, Users, AlertCircle, Zap } from 'lucide-react';
import UserCard from '../components/UserCard';
import { useAuth } from '../context/AuthContext';

const FindBuddies = () => {
  const { getAllUsers, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setBuddies(data?.users || []);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  const filteredBuddies = buddies.filter(buddy => {
    const matchesSearch = buddy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (buddy.skills && buddy.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (buddy.branch && buddy.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = filterBranch === 'All' || buddy.branch === filterBranch;
    
    return matchesSearch && matchesBranch;
  });

  const branches = ['All', ...new Set(buddies.map(b => b.branch).filter(Boolean))];

  return (
    <div>
      {/* Search Header */}
      <section className="container mx-auto py-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto glass shadow-2xl p-4 md:p-6 mb-16 rounded-3xl animate-fade-in relative overflow-visible"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl -z-10 animate-float bg-blue-600/20"></div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Skills, Names, or Branches..." 
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary-600 transition-all outline-none font-black uppercase tracking-widest text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all shadow-xl font-black uppercase tracking-widest text-[10px]"
              >
                <Filter size={18} />
                <span>{filterBranch === 'All' ? 'Filters' : filterBranch}</span>
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-4 right-0 w-56 glass-card p-4 z-50 border-primary-500/30"
                  >
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 px-2">Filter by Branch</h4>
                    <div className="space-y-1">
                      {branches.map(branch => (
                        <button 
                          key={branch}
                          onClick={() => { setFilterBranch(branch); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterBranch === branch ? 'bg-primary-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                          {branch}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Empty State / Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
               <Zap size={48} className="text-primary-400 animate-spin mb-4" />
               <p className="text-gray-500 font-black uppercase tracking-widest">Scanning Campus Network...</p>
            </div>
          ) : filteredBuddies.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-40 glass rounded-3xl border-dashed border-2 border-white/10 shadow-2xl"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Users size={48} className="text-gray-500 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">No <span className="text-primary-400">Buddies</span> Found</h2>
              <p className="text-lg text-gray-500 font-bold italic mb-10 uppercase tracking-widest opacity-60">Try searching for different skills or branches.</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 animate-fade-in flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase tracking-tighter opacity-70">
                    Discovered <span className="text-primary-400">{filteredBuddies.length}</span> active buddies
                 </h2>
                 <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Live Network</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                <AnimatePresence mode="popLayout">
                  {filteredBuddies.map((buddy) => (
                    <UserCard key={buddy._id} user={buddy} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default FindBuddies;
