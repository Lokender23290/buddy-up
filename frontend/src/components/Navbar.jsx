import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutDashboard, User, Home as HomeIcon, LogOut, MoreVertical, Shield, Bell, Rocket, Wallet, Info, Zap, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token, markNotificationsRead } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = !!token && !!user;

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const notifications = [];
  
  if (user?.pendingRequests?.length > 0) {
    notifications.push({
      id: 'pending',
      text: `Identity Handshake: ${user.pendingRequests.length} pending secure authorization${user.pendingRequests.length > 1 ? 's' : ''}`,
      time: "ACTION REQUIRED",
      action: "/dashboard"
    });
  }
  
  if (user?.sentRequests?.length > 0) {
    notifications.push({
      id: 'sent',
      text: `Sync Dispatched: ${user.sentRequests.length} request${user.sentRequests.length > 1 ? 's' : ''} awaiting target approval`,
      time: "PENDING",
      action: "/find-buddies"
    });
  }

  if (user?.connections?.length > 0) {
    notifications.push({
      id: 'connections',
      text: `Network Live: ${user.connections.length} active buddy connection${user.connections.length > 1 ? 's' : ''} established`,
      time: "APPROVED",
      action: "/messages"
    });
  }

  const totalNotifCount = (user?.pendingRequests?.length || 0) + (user?.sentRequests?.length || 0) + (user?.connections?.length || 0);
  
  // Persistence logic: Red dot only if user hasn't seen the CURRENT batch
  const STORAGE_KEY = `notif_seen_${user?._id || user?.id}`;
  const [seenCount, setSeenCount] = useState(() => Number(localStorage.getItem(STORAGE_KEY)) || 0);
  
  const hasUnread = totalNotifCount > seenCount;

  const handleOpenNotif = async () => {
    if (!isNotifOpen) {
        setIsNotifOpen(true);
        setSeenCount(totalNotifCount);
        localStorage.setItem(STORAGE_KEY, totalNotifCount);
        await markNotificationsRead();
    } else {
        setIsNotifOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => {
    const isActive = location.pathname === to;
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className="flex items-center space-x-2 px-6 py-2 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/5"
        >
          {Icon && <Icon size={16} />}
          <span className="font-black uppercase text-[10px] tracking-widest leading-none">{children}</span>
        </button>
      );
    }
    return (
      <Link
        to={to}
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-primary-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {Icon && <Icon size={16} />}
        <span className="font-black uppercase text-[10px] tracking-widest leading-none">{children}</span>
      </Link>
    );
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 ${scrolled ? 'pt-4' : 'pt-6'}`}
    >
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-8 py-3 rounded-full relative transition-all duration-300 ${scrolled ? 'glass shadow-2xl scale-[1.02]' : 'bg-transparent'}`}>
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-700 rounded-xl flex items-center justify-center shadow-lg transform rotate-6 group-hover:rotate-0 transition-all duration-300">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <span className="text-2xl font-black tracking-tighter hidden lg:block uppercase group-hover:text-primary-400 transition-all">
              Buddy<span className="text-primary-400 font-extrabold text-sm ml-1 italic tracking-widest">Up</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 ml-2">
            <NavLink to="/" icon={HomeIcon}>Home</NavLink>
            {!isLoggedIn && (
              <>
                <NavLink onClick={() => scrollToSection('about')} icon={Info}>About</NavLink>
                <NavLink onClick={() => scrollToSection('how-it-works')} icon={Zap}>Process</NavLink>
                <NavLink onClick={() => scrollToSection('contact')} icon={MessageSquare}>Contact</NavLink>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={handleOpenNotif}
                  className="p-2.5 text-gray-400 hover:text-primary-400 hover:bg-white/5 rounded-xl transition-all relative"
                >
                  <Bell size={20} />
                  {hasUnread && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-4 right-0 w-80 glass-card p-6 z-50 border-primary-500/30"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 px-2">Recent Notifications</h4>
                      <div className="space-y-4">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 opacity-40">
                             <Shield size={24} className="mx-auto mb-2 opacity-50" />
                             <p className="text-[10px] font-black uppercase tracking-widest italic">All Systems Clear</p>
                             <p className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70">No pending handshakes</p>
                          </div>
                        ) : notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { setIsNotifOpen(false); navigate(n.action); }}
                            className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary-500/20 transition-all cursor-pointer group"
                          >
                            <p className="text-[10px] font-bold text-gray-300 group-hover:text-white mb-1 uppercase tracking-tight leading-relaxed">{n.text}</p>
                            <span className="text-[8px] text-primary-500/60 group-hover:text-primary-400 font-black uppercase tracking-widest">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <NavLink to="/find-buddies" icon={Search}>Find</NavLink>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dash</NavLink>
              <NavLink to="/messages" icon={MessageSquare}>Chat</NavLink>
              <NavLink to="/wallet" icon={Wallet}>Wallet</NavLink>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-primary-600/20 text-primary-400 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-2xl"
                >
                  <User size={20} />
                </button>
                <AnimatePresence>
                   {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-4 right-0 w-56 glass-card p-4 z-50 border-primary-500/30 shadow-2xl"
                      >
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 px-2">Account Management</h4>
                         <div className="space-y-1">
                            <Link 
                               to="/profile" 
                               onClick={() => setIsProfileOpen(false)}
                               className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                            >
                               <User size={14} /> <span>My Profile</span>
                            </Link>
                            <button 
                               onClick={() => { setIsProfileOpen(false); logout(); }}
                               className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-600/10 transition-all font-black"
                            >
                               <LogOut size={14} /> <span>Sign Out</span>
                            </button>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-gray-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">Login Access</Link>
              <Link to="/signup" className="btn-primary py-2.5 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-primary-400 border border-white/10"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div 
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-screen w-[85%] max-w-sm glass border-l border-white/10 p-10 z-[100] shadow-2xl"
            >
               <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-12">
                     <span className="text-xl font-black uppercase tracking-tighter italic">Buddy<span className="text-primary-400">Up</span></span>
                     <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white"><LogOut size={20} className="rotate-180" /></button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <NavLink to="/" icon={HomeIcon}>Home Overview</NavLink>
                    <NavLink onClick={() => scrollToSection('about')} icon={Info}>Our Mission</NavLink>
                    <NavLink onClick={() => scrollToSection('how-it-works')} icon={Zap}>Success Process</NavLink>
                    <NavLink onClick={() => scrollToSection('contact')} icon={MessageSquare}>Help Desk</NavLink>
                    
                    <div className="h-px bg-white/5 my-6"></div>

                    {isLoggedIn ? (
                      <>
                        <NavLink onClick={() => { setIsMenuOpen(false); alert('Notifications:\n' + notifications.map(n => '- ' + n.text).join('\n')); }} icon={Bell}>Notifications Alert</NavLink>
                        <NavLink to="/find-buddies" icon={Search}>Find Buddies</NavLink>
                        <NavLink to="/dashboard" icon={LayoutDashboard}>My Dashboard</NavLink>
                        <NavLink to="/messages" icon={MessageSquare}>My Messages</NavLink>
                        <NavLink to="/wallet" icon={Wallet}>My Wallet</NavLink>
                        <NavLink to="/profile" icon={User}>My Profile</NavLink>
                        <button onClick={logout} className="w-full mt-10 py-4 bg-red-600/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/10">Terminate Session</button>
                      </>
                    ) : (
                      <>
                        <NavLink to="/login" icon={Shield}>Account Login</NavLink>
                        <NavLink to="/signup" icon={Rocket}>Join Community</NavLink>
                      </>
                    )}
                  </div>

                  <div className="pt-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">© 2025 BuddyUp Platform</p>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
