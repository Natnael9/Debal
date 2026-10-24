import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const NotificationToast = () => {
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (data) => {
      const prefs = user?.notificationPreferences || {};

      // Check user preferences before showing the toast
      if (data.type === 'chat_request' && prefs.newChatRequest === false) return;
      if (data.type === 'request_accepted' && prefs.requestAccepted === false) return;
      if (data.type === 'message' && prefs.newMessage === false) return;
      if (data.type === 'meetup' && prefs.meetupUpdate === false) return;
      if (data.type === 'report' && prefs.reportStatus === false) return;

      setToast(data);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('match:request', (d) => handleNewNotification({ type: 'chat_request', ...d }));
    socket.on('match:accepted', (d) => handleNewNotification({ type: 'request_accepted', ...d }));
    socket.on('message:new', (d) => handleNewNotification({ type: 'message', ...d }));

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('match:request');
      socket.off('match:accepted');
      socket.off('message:new');
    };
  }, [user]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div 
        onClick={() => {
          if (toast.link) navigate(toast.link);
          setToast(null);
        }}
        className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 cursor-pointer hover:border-[#2274A5]/40 transition"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2274A5] border border-blue-100">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-bold text-gray-900">{toast.title || "New Notification"}</h4>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setToast(null);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;