import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from './ui/button';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const menuItems = user?.role === 'driver' 
    ? [
        { label: 'Dashboard', path: '/driver/dashboard' },
        { label: 'Post Ride', path: '/post-ride' },
        { label: 'My Rides', path: '/driver/rides' },
        { label: 'Booking Requests', path: '/driver/bookings' },
      ]
    : [
        { label: 'Dashboard', path: '/passenger/dashboard' },
        { label: 'Search Rides', path: '/search' },
        { label: 'My Bookings', path: '/passenger/bookings' },
        { label: 'Booking History', path: '/passenger/bookings' },
      ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="touch-target p-2 -m-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 mobile-spacing">
              {user && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium mobile-text">{user.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-lg hover:bg-gray-100 mobile-text touch-target transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-100 flex items-center gap-3 touch-target transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="mobile-text">Notifications</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/profile/edit');
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-100 flex items-center gap-3 touch-target transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span className="mobile-text">Settings</span>
                </button>
              </nav>

              {user && (
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full flex items-center gap-2 touch-target mobile-text"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}