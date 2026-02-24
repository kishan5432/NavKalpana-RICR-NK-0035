import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { markNotificationRead, markAllNotificationsRead } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Bell, Check, ArrowLeft } from 'lucide-react';
import { getNotificationConfig, getNotificationTitle } from '../../utils/notificationService';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const getNotificationStyle = (type) => {
    const config = getNotificationConfig(type);
    const IconComponent = config.icon;
    return {
      icon: <IconComponent className="h-5 w-5" />,
      bgColor: config.bgColor,
      iconColor: config.textColor,
      borderColor: config.borderColor
    };
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id).catch(err => console.error(err));
      markAsRead(notification._id);
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(err => console.error(err));
    markAllAsRead();
  };

  const groupByDate = (notifications) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      if (notifDate.toDateString() === today.toDateString()) {
        groups.Today.push(notif);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(notif);
      } else if (notifDate > lastWeek) {
        groups['This Week'].push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  };

  const grouped = groupByDate(notifications);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                onClick={handleMarkAllRead} 
                variant="outline" 
                size="sm"
                className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-sm border border-gray-200/50 rounded-xl">
            <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Bell className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">No notifications yet</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              When you get notifications about rides, bookings, and messages, they'll appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([group, notifs]) => (
              notifs.length > 0 && (
                <div key={group}>
                  <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 px-2">
                    {group}
                  </h2>
                  <div className="space-y-3">
                    {notifs.map((notif) => {
                      const { icon, bgColor, iconColor, borderColor } = getNotificationStyle(notif.type);
                      return (
                        <Card
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-5 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-gray-200/50 rounded-xl group ${
                            !notif.read ? `bg-gradient-to-r from-blue-50/50 to-blue-50/30 ${borderColor} border-l-4` : 'hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${bgColor} ${iconColor} flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${
                                !notif.read ? 'font-semibold text-gray-900' : 'text-gray-700 font-medium'
                              }`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2.5 font-medium">
                                {new Date(notif.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
