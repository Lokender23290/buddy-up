import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Users, Search, LayoutDashboard, ArrowRight, Zap, CheckCircle, Smartphone, Globe, Mail, MessageSquare, Phone, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { user, token } = useAuth();
  const isLoggedIn = !!token && !!user;

  return (
    <div className="relative min-h-screen bg-background-dark text-white selection:bg-primary-500 selection:text-white overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-float"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 label-theatrical mb-8 shadow-2xl">
              <Zap size={14} className="mr-2 animate-pulse" /> The New Standard for Campus Connections
            </span>
            <h1 className="heading-hero mb-8">
              Connect <span className="gradient-text italic">Smarter.</span><br/>
              Grow <span className="text-primary-500">Together.</span>
            </h1>
            <p className="text-manifesto text-lg md:text-xl max-w-2xl mx-auto mb-12">
              BuddyUp transforms your university experience by linking you with the perfect peers for any goal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn-primary flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  Access Portal <LayoutDashboard size={20} className="ml-3" />
                </Link>
              ) : (
                <Link to="/signup" className="btn-primary flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  Join The Network <Rocket size={20} className="ml-3" />
                </Link>
              )}
              <Link to="/find-buddies" className="btn-secondary px-10 py-5 text-sm font-black uppercase tracking-widest">
                Discover Buddies <Search size={20} className="ml-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section - The Ecosystem */}
      <section id="about" className="py-32 px-6 bg-white/[0.02] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
             <h2 className="heading-section">The <span className="text-primary-500 italic">Ecosystem</span></h2>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic leading-relaxed">
                BuddyUp is a dual-sided marketplace designed to bridge the skill gap on campus. Whether you have knowledge to share or a challenge to solve, we provide the infrastructure.
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <Link to="/become-provider" className="block outline-none">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="action-card group border-primary-500/20 hover:border-primary-500"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 blur-3xl pointer-events-none group-hover:bg-primary-500/20 transition-all"></div>
                <div className="icon-badge bg-primary-600 rotate-6 group-hover:rotate-0">
                   <Zap size={32} className="text-white" />
                </div>
                <div className="card-header">
                   <h3 className="card-title">Be A <span className="text-primary-400">Provider</span></h3>
                   <ArrowRight className="card-arrow text-primary-400" size={24} />
                </div>
                <p className="label-muted mb-6">
                   Have a skill in React, Physics, or Graphic Design? List your expertise and help fellow students. As a provider, you can earn reputation credits or monetized rewards for the value you deliver to the campus community.
                </p>
                <div className="flex flex-wrap gap-2 opacity-50">
                   {['Node.js', 'Calculus', 'UI Design', 'Marketing'].map(s => <span key={s} className="label-stats">{s}</span>)}
                </div>
              </motion.div>
            </Link>

            <Link to="/find-buddies" className="block outline-none">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="action-card group border-blue-500/20 hover:border-blue-500"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                <div className="icon-badge bg-blue-600 -rotate-6 group-hover:rotate-0">
                   <Rocket size={32} className="text-white" />
                </div>
                <div className="card-header">
                   <h3 className="card-title">Be A <span className="text-blue-400">Consumer</span></h3>
                   <ArrowRight className="card-arrow text-blue-400" size={24} />
                </div>
                <p className="label-muted mb-6">
                   Struggling with a project or a complex subject? Search our network for verified buddies. Consume high-quality peer-to-peer services tailored to your university curriculum at a fraction of a tutor's cost.
                </p>
                <div className="flex flex-wrap gap-2 opacity-50">
                   {['Exam prep', 'Code Review', 'Lab Help'].map(s => <span key={s} className="label-stats">{s}</span>)}
                </div>
              </motion.div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ValueCard icon={Users} title="Deep Network" desc="A curated ecosystem of students verified by campus email." />
            <ValueCard icon={Zap} title="Instant Sync" desc="Find exactly who you need, exactly when you need them." />
            <ValueCard icon={Shield} title="Secure Space" desc="Advanced safety protocols and reputation systems." />
            <ValueCard icon={Globe} title="Global Scale" desc="Connect beyond your branch to the entire university." />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="w-full lg:w-1/2">
             <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">How It <br/><span className="gradient-text italic">Works</span></h2>
             <div className="space-y-10">
                <Step num="01" title="Register & Verify" desc="Join with your campus credentials to ensure a safe, legitimate environment." />
                <Step num="02" title="Define Your Persona" desc="List your skills, interests, and academic year to stand out in the network." />
                <Step num="03" title="Discover & Connect" desc="Search for buddies by skills or interests and send a secure request." />
                <Step num="04" title="Collaborate" desc="Chat, build projects, or study together once your request is accepted." />
             </div>
          </div>
          <div className="w-full lg:w-1/2 relative">
             <div className="glass-card p-12 aspect-square flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(99,102,241,0.1)] border-primary-500/20">
                <div className="w-32 h-32 bg-primary-600/20 rounded-[40px] flex items-center justify-center mb-8 rotate-12">
                   <Smartphone size={60} className="text-primary-400 animate-bounce" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-6 tracking-tight">Optimized for <br/>Student Life</h3>
                <p className="text-gray-500 font-bold italic uppercase tracking-widest text-[10px] opacity-60">Simple, Fast, and Mobile Ready</p>
             </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-primary-950/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center">
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-16 underline decoration-primary-500/50 underline-offset-8 decoration-8">Need <span className="text-primary-400">Support?</span></h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <ContactCard icon={Mail} label="Email Us" value="support@buddyup.edu" />
              <ContactCard icon={MessageSquare} label="Live Chat" value="Available 24/7" />
              <ContactCard icon={Phone} label="Emergency" value="+1 (555) HELP-UP" />
           </div>

           <div className="mt-20 p-12 glass rounded-3xl border-white/5 relative shadow-2xl group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Info size={120} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Frequently Asked Questions</h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-10 text-sm italic font-bold uppercase tracking-widest opacity-60">
                 Find quick answers about session handling, verification, and our unique matching algorithm.
              </p>
              <button 
                onClick={() => toast.success('Help Center: Student sync authority is standing by. Visit help.buddyup.edu')}
                className="btn-secondary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest"
              >
                 Open Help Center
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-20 px-6 glass border-t-0 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-black">B</div>
                <span className="text-xl font-black uppercase tracking-tighter italic">Buddy<span className="text-primary-400">Up</span></span>
             </div>
             <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Bridging the Gap Between Students Worldwide</p>
          </div>
          <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
             <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
             <a href="#" className="hover:text-primary-400 transition-colors">Safety</a>
          </div>
          <p className="text-gray-700 text-[9px] font-black tracking-widest opacity-60 uppercase">
            © 2025 BuddyUp Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

const ValueCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-8 rounded-3xl group border-white/5 hover:border-primary-500/30 transition-all duration-300"
  >
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex-center mb-6 text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-2xl">
      <Icon size={28} />
    </div>
    <h3 className="text-lg font-black uppercase mb-3 tracking-tight">{title}</h3>
    <p className="label-muted text-[9px] opacity-60">
      {desc}
    </p>
  </motion.div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex items-start space-x-6">
     <span className="text-4xl font-black text-primary-600/30 font-poppins">{num}</span>
     <div>
        <h4 className="text-xl font-black uppercase tracking-tight mb-1">{title}</h4>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest italic opacity-50">{desc}</p>
     </div>
  </div>
);

const ContactCard = ({ icon: Icon, label, value }) => (
   <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex-center mb-4 border border-white/5">
         <Icon className="text-primary-400" size={24} />
      </div>
      <h4 className="label-theatrical text-gray-500 mb-1">{label}</h4>
      <p className="text-sm font-black uppercase tracking-widest text-white">{value}</p>
   </div>
);

export default Home;
