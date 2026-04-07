import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-dark/95 selection:bg-primary-500 selection:text-white">
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
      <main className="pt-24 pb-40 px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
