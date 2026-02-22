import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Bell, MessageSquare, Car, Star, XCircle, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    getNotifications()
      .then(data => setNotifications(data.notifications || []))
      .catch(err => console.error(err));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'booking_requested': return <Car className="h-5 w-5 text-green-500" />;
      case 'booking_accepted': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'booking_rejected':
      case 'booking_cancelled':
      case 'ride_cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'new_rating': return <Star className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id).catch(err => console.error(err));
      fetchNotifications();
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(err => console.error(err));
    fetchNotifications();
  };

  const groupByDate = (notifications) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { Today: [], Yesterday: [], Earlier: [] };

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      if (notifDate.toDateString() === today.toDateString()) {
        groups.Today.push(notif);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  };

  const grouped = groupByDate(notifications);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <Button onClick={handleMarkAllRead}>Mark all as read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications yet</h3>
          <p className="text-gray-500">When you get notifications, they'll show up here</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, notifs]) => (
            notifs.length > 0 && (
              <div key={group}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">{group}</h2>
                <div className="space-y-2">
                  {notifs.map((notif) => (
                    <Card
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 cursor-pointer hover:shadow-md transition ${
                        !notif.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className={`${!notif.read ? 'font-semibold' : ''}`}>{notif.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
