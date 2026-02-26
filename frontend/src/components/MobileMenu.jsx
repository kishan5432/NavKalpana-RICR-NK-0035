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
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-[#FFD400]">
              <h2 className="text-lg font-bold text-[#111111]">Menu</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="touch-target p-2 -m-2 rounded-lg hover:bg-black/10 transition-colors"
              >
                <X className="h-6 w-6 text-[#111111]" />
              </button>
            </div>

            <div className="p-4">
              {user && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-[#FFD400]/10 rounded-lg border border-[#FFD400]/30">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center text-[#FFD400] font-bold text-xl">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#111111]">{user.name}</p>
                    <p className="text-sm text-[#4F4F4F] capitalize font-medium">{user.role}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#FFD400]/20 font-medium text-[#111111] touch-target transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#FFD400]/20 flex items-center gap-3 font-medium text-[#111111] touch-target transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/profile/edit');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#FFD400]/20 flex items-center gap-3 font-medium text-[#111111] touch-target transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </nav>

              {user && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 touch-target font-semibold text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
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