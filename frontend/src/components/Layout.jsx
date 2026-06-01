import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');

  return (
    <div className={`bg-background-dark/95 selection:bg-primary-500 selection:text-white ${isMessages ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'black',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }
        }}
      />
      <Navbar />
      <main className={`pt-24 max-w-7xl mx-auto ${isMessages ? 'px-0 flex-1 h-[calc(100vh-96px)] w-full' : 'pb-40 px-6'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
