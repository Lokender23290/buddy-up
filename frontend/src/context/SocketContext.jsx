import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Set());

    useEffect(() => {
        if (token && (user?._id || user?.id)) {
            const socketUrl = import.meta.env.VITE_BACKEND_URL || (window.location.protocol + '//' + window.location.hostname + ':5001');
            console.log(`[SOCKET] Establishing bridge to ${socketUrl}...`);
            
            const newSocket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'] // Force multi-mode resilience
            });

            newSocket.on('connect', () => {
                console.log('[SOCKET] Sync established with identity backbone.');
            });

            newSocket.on('initial_online_users', (userIds) => {
                setOnlineUsers(new Set(userIds));
            });

            newSocket.on('connect_error', (err) => {
                console.error('[SOCKET] Connection sync error:', err.message);
            });

            newSocket.on('user_status_change', ({ userId, isOnline }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    if (isOnline) next.add(userId);
                    else next.delete(userId);
                    return next;
                });
            });

            newSocket.on('user_typing', ({ userId }) => {
                setTypingUsers(prev => new Set(prev).add(userId));
            });

            newSocket.on('user_stopped_typing', ({ userId }) => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            });

            setSocket(newSocket);

            return () => {
                console.log('[SOCKET] Detaching bridge from identity backbone.');
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token, user?._id, user?.id]);

    const isUserOnline = useCallback((userId) => onlineUsers.has(userId), [onlineUsers]);
    const isUserTyping = useCallback((userId) => typingUsers.has(userId), [typingUsers]);

    return (
        <SocketContext.Provider value={{ socket, isUserOnline, isUserTyping }}>
            {children}
        </SocketContext.Provider>
    );
};
