import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, MessageSquare, Car, Star, X, CheckCircle } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    getNotifications()
      .then(data => setNotifications(data.notifications || []))
      .catch(err => console.error(err));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'new_message': return <MessageSquare className="h-4 w-4" />;
      case 'booking_requested':
      case 'booking_accepted':
      case 'booking_rejected':
      case 'booking_cancelled': return <Car className="h-4 w-4" />;
      case 'new_rating': return <Star className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id).catch(err => console.error(err));
      fetchNotifications();
    }
    setShowDropdown(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(err => console.error(err));
    fetchNotifications();
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-6 text-center text-gray-500">No notifications</div>
            )}
          </div>
          <div className="p-3 border-t text-center">
            <Button
              variant="link"
              onClick={() => {
                setShowDropdown(false);
                navigate('/notifications');
              }}
            >
              See all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
