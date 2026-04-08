import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI, messageAPI, postAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.token || localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authAPI.googleAuth(credential);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const sendPhoneOTP = async (phone) => {
    try {
      const response = await authAPI.sendPhoneOTP({ phone });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const sendEmailOTP = async (email) => {
    try {
      const response = await authAPI.sendEmailOTP({ email });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (identifier, otp, type) => {
    try {
      const response = await authAPI.verifyOTP({ identifier, otp, type });
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (data) => {
    try {
      const response = await authAPI.changePassword(data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const sendConnectionRequest = async (id) => {
    try {
      const response = await authAPI.sendConnectionRequest(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const acceptConnectionRequest = async (id) => {
    try {
      const response = await authAPI.acceptConnectionRequest(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const rejectConnectionRequest = async (id) => {
    try {
      const response = await authAPI.rejectConnectionRequest(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchUserById = async (id) => {
    try {
      const response = await authAPI.getUserById(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const markNotificationsRead = async () => {
    try {
      await authAPI.markNotificationsRead();
      await fetchCurrentUser();
    } catch (error) {
      console.error('Notification sync failed', error);
    }
  };

  const getConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getChat = async (userId) => {
    try {
      const response = await messageAPI.getChat(userId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const sendMessage = async (receiverId, content) => {
    try {
      const response = await messageAPI.sendMessage({ receiverId, content });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createPost = async (postData) => {
    try {
      const response = await postAPI.createPost(postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getPosts = async () => {
    try {
      const response = await postAPI.getPosts();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const resolvePost = async (postId) => {
    try {
      const response = await postAPI.resolvePost(postId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const joinPost = async (postId) => {
    try {
      const response = await postAPI.joinPost(postId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const leavePost = async (postId) => {
    try {
      const response = await postAPI.leavePost(postId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    googleLogin,
    signup,
    sendPhoneOTP,
    sendEmailOTP,
    logout,
    verifyOTP,
    updateProfile,
    changePassword,
    markNotificationsRead,
    fetchCurrentUser,
    fetchUserById,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getAllUsers,
    getConversations,
    getChat,
    sendMessage,
    createPost,
    getPosts,
    resolvePost,
    joinPost,
    leavePost
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
