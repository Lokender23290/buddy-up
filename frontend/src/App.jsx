import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import FindBuddies from './pages/FindBuddies';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import Messages from './pages/Messages';
import BecomeProvider from './pages/BecomeProvider';
import Wallet from './pages/Wallet';
import PublicProfile from './pages/PublicProfile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
       <div className="text-primary-400 font-black animate-pulse uppercase tracking-widest leading-tight">Authenticating Session...</div>
    </div>
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Fatal Frontend Crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', background: 'red', color: 'white', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2>CRITICAL SYSTEM CRASH</h2>
          <p>Please send this screenshot to the AI:</p>
          <pre style={{ background: '#000', padding: '20px', overflow: 'auto' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="App selection:bg-primary-500 selection:text-white">
            <Layout>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/otp-verification" element={<OTPVerification />} />
                  
                  <Route path="/find-buddies" element={<ProtectedRoute><FindBuddies /></ProtectedRoute>} />
                  <Route path="/become-provider" element={<ProtectedRoute><BecomeProvider /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/buddy/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </Layout>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
