import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, connectSocket } from '../../services/socket';
import { getToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationToast = () => {
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let socket = getSocket();
    const token = getToken();
    if (!socket && token) {
      socket = connectSocket(token);
    }

    if (!socket) return;

    const handleNewNotification = (data) => {
      if (!data) return;

      const prefs = user?.notificationPreferences || {};
      const settings = user?.notificationSettings || {};

      // Check notification preferences & settings before displaying the floating alert
      if (
        (data.type === 'chat_request' || data.type === 'match_request') &&
        (prefs.newChatRequest === false || settings.chatRequests === false)
      ) {
        return;
      }

      if (
        (data.type === 'request_accepted' || data.type === 'match_accepted') &&
        (prefs.requestAccepted === false || settings.acceptedRequests === false)
      ) {
        return;
      }

      if (
        data.type === 'message' &&
        (prefs.newMessage === false || settings.messages === false)
      ) {
        return;
      }

      if (
        data.type === 'meetup' &&
        (prefs.meetupUpdate === false || settings.meetupUpdates === false)
      ) {
        return;
      }

      if (
        data.type === 'report' &&
        (prefs.reportStatus === false || settings.reportStatus === false)
      ) {
        return;
      }

      setToast(data);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 5500);
    };

    const handleMatchRequest = (d) => {
      handleNewNotification({
        type: 'chat_request',
        title: d.title || 'New Connection Request',
        message: d.message || `${d.sender?.name || 'Someone'} sent you a roommate request!`,
        avatarUrl: d.sender?.avatarUrl,
        link: d.link || `/app/messages?matchId=${d.matchId || ''}`,
      });
    };

    const handleMatchAccepted = (d) => {
      handleNewNotification({
        type: 'request_accepted',
        title: d.title || 'Request Accepted!',
        message: d.message || `${d.user?.name || 'Your match'} accepted your roommate request!`,
        avatarUrl: d.user?.avatarUrl,
        link: d.link || `/app/messages?matchId=${d.matchId || ''}`,
      });
    };

    const handleChatMessage = (d) => {
      // Don't show toast for own sent messages
      if (d?.message?.senderId && String(d.message.senderId) === String(user._id)) {
        return;
      }
      handleNewNotification({
        type: 'message',
        title: 'New Message',
        message: d?.message?.content || 'You received a new message.',
        link: `/app/messages?matchId=${d.matchId}`,
      });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('match:request', handleMatchRequest);
    socket.on('match:accepted', handleMatchAccepted);
    socket.on('chat:new_message', handleChatMessage);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      socket.off('notification:new', handleNewNotification);
      socket.off('match:request', handleMatchRequest);
      socket.off('match:accepted', handleMatchAccepted);
      socket.off('chat:new_message', handleChatMessage);
    };
  }, [user]);

  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-in slide-in-from-top-5 fade-in duration-200">
      <div 
        onClick={() => {
          if (toast.link) navigate(toast.link);
          setToast(null);
        }}
        className="flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-gray-100 cursor-pointer hover:border-[#2274A5]/40 hover:shadow-2xl transition-all"
      >
        {/* Avatar or Icon */}
        {toast.avatarUrl ? (
          <img
            src={toast.avatarUrl}
            alt="Sender avatar"
            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-gray-100 shadow-2xs"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2274A5] border border-blue-100 shadow-2xs">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        )}

        <div className="flex-1 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900">{toast.title || "New Alert"}</h4>
            <span className="text-[10px] text-gray-400 font-medium">Just now</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setToast(null);
          }}
          className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;