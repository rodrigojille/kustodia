"use client";

import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../utils/authFetch';
import Link from 'next/link';

interface Notification {
  id: number;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await authFetch('notifications');
      const notifications = await response.json();
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await authFetch('notifications/unread-count');
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await authFetch(`notifications/${id}/read`, { method: 'PATCH' });
      // Refresh notifications and count after marking as read
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh data when opening the dropdown
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-blue-50 transition group" aria-label="Notificaciones">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black group-hover:text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a2.25 2.25 0 01-4.714 0m8.486-3.29c-.806-.64-1.362-1.574-1.362-2.622V9.75a6 6 0 10-12 0v1.42c0 1.048-.556 1.981-1.362 2.622-.527.419-.838 1.06-.838 1.738v.174c0 .933.76 1.693 1.693 1.693h14.416c.933 0 1.693-.76 1.693-1.693v-.174c0-.678-.311-1.319-.838-1.738z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <Link href={notif.link} key={notif.id} onClick={() => handleNotificationClick(notif)} className={`flex items-start p-3 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString('es-MX')}</p>
                    </div>
                </Link>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">No tienes notificaciones.</p>
            )}
          </div>
          <div className="p-2 border-t border-gray-200 text-center">
            <Link href="/dashboard/notificaciones" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
