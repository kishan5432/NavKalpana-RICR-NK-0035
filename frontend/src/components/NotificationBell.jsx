import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { markNotificationRead, markAllNotificationsRead } from '../api';
import { useNotifications } from '../context/NotificationContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, Check } from 'lucide-react';
import { getNotificationConfig, getNotificationTitle } from '../utils/notificationService';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getNotificationStyle = (type) => {
    const config = getNotificationConfig(type);
    const IconComponent = config.icon;
    return {
      icon: <IconComponent className="h-4 w-4" />,
      color: config.color,
      bgColor: config.bgColor,
      textColor: config.textColor
    };
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id).catch(err => console.error(err));
      markAsRead(notification._id);
    }
    setShowDropdown(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(err => console.error(err));
    markAllAsRead();
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 hover:bg-[#3A2A5A]/10 rounded-lg transition-all duration-200 touch-target group"
      >
        <Bell className={`h-5 w-5 transition-colors duration-200 ${
          unreadCount > 0 ? 'text-[#EC3399]' : 'text-[#3A2A5A] group-hover:text-[#EC3399]'
        }`} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-[#EC3399] to-[#d62d88] text-white text-xs font-semibold shadow-sm animate-pulse border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200/50 z-50 animate-slide-up overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead} 
                className="text-xs hover:bg-white/60 transition-all duration-200 flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notif) => {
              const { icon, bgColor, textColor } = getNotificationStyle(notif.type);
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 group ${
                    !notif.read ? 'bg-[#EC3399]/5 border-l-4 border-l-[#EC3399]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${bgColor} ${textColor} mt-0.5 shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-relaxed font-medium">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1.5 font-medium">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#EC3399] to-[#d62d88] rounded-full mt-2 flex-shrink-0 shadow-sm" />
                    )}
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens</p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200/50 bg-gray-50/50 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/notifications');
                }}
                className="text-sm font-medium text-[#3A2A5A] hover:text-[#EC3399] hover:bg-[#EC3399]/10 transition-all duration-200"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
