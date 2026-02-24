import { toast } from 'react-hot-toast';
import { Bell, MessageSquare, Car, Star, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const notificationTypes = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_REQUESTED: 'booking_requested',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  RIDE_STARTED: 'ride_started',
  PAYMENT_RECEIVED: 'payment_received',
  NEW_MESSAGE: 'new_message',
  NEW_RATING: 'new_rating'
};

export const getNotificationConfig = (type) => {
  const configs = {
    [notificationTypes.NEW_MESSAGE]: {
      icon: MessageSquare,
      color: '#3B82F6',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      toastStyle: { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #DBEAFE' }
    },
    [notificationTypes.BOOKING_CONFIRMED]: {
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      toastStyle: { background: '#F0FDF4', color: '#065F46', border: '1px solid #D1FAE5' }
    },
    [notificationTypes.BOOKING_ACCEPTED]: {
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      toastStyle: { background: '#F0FDF4', color: '#065F46', border: '1px solid #D1FAE5' }
    },
    [notificationTypes.RIDE_STARTED]: {
      icon: Car,
      color: '#F59E0B',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      toastStyle: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }
    },
    [notificationTypes.PAYMENT_RECEIVED]: {
      icon: CreditCard,
      color: '#10B981',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      toastStyle: { background: '#F0FDF4', color: '#065F46', border: '1px solid #D1FAE5' }
    },
    [notificationTypes.BOOKING_REQUESTED]: {
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      toastStyle: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }
    },
    [notificationTypes.BOOKING_REJECTED]: {
      icon: AlertCircle,
      color: '#EF4444',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      toastStyle: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
    },
    [notificationTypes.BOOKING_CANCELLED]: {
      icon: AlertCircle,
      color: '#EF4444',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      toastStyle: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
    },
    [notificationTypes.NEW_RATING]: {
      icon: Star,
      color: '#F59E0B',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      toastStyle: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }
    }
  };

  return configs[type] || {
    icon: Bell,
    color: '#6B7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    toastStyle: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }
  };
};

export const showNotificationToast = (notification) => {
  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;
  
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={config.toastStyle}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 p-2 rounded-full ${config.bgColor}`}>
              <IconComponent className={`h-4 w-4 ${config.textColor}`} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title || getNotificationTitle(notification.type)}
              </p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            ×
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right'
    }
  );
};

export const getNotificationTitle = (type) => {
  const titles = {
    [notificationTypes.NEW_MESSAGE]: 'New Message',
    [notificationTypes.BOOKING_CONFIRMED]: 'Booking Confirmed',
    [notificationTypes.BOOKING_ACCEPTED]: 'Booking Accepted',
    [notificationTypes.RIDE_STARTED]: 'Ride Started',
    [notificationTypes.PAYMENT_RECEIVED]: 'Payment Received',
    [notificationTypes.BOOKING_REQUESTED]: 'New Booking Request',
    [notificationTypes.BOOKING_REJECTED]: 'Booking Rejected',
    [notificationTypes.BOOKING_CANCELLED]: 'Booking Cancelled',
    [notificationTypes.NEW_RATING]: 'New Rating'
  };
  
  return titles[type] || 'Notification';
};

export const playNotificationSound = () => {
  // Create a subtle notification sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};