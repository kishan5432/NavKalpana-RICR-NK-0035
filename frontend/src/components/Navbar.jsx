import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Search, BookOpen, Car, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const authContext = useAuth();
  const navigate = useNavigate();

  if (!authContext) {
    return null;
  }

  const { user, logout } = authContext;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const canPostRide = user?.role === 'driver' || user?.role === 'both';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu */}
          <div className="md:hidden">
            {user && <MobileMenu />}
          </div>
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="https://res.cloudinary.com/dse13zdp7/image/upload/v1772089992/WhatsApp_Image_2026-02-26_at_10.40.35_ugzmxu.jpg"
              alt="RideShareX Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl md:text-2xl font-bold text-[#111111]">
              RideShareX
            </span>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Search Rides button - always visible */}
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="hidden md:flex touch-target border-[#111111] text-[#111111] hover:bg-[#FFD400] hover:text-[#111111] hover:border-[#FFD400] transition-all duration-200"
            >
              <Link to="/search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
            </Button>

            {user ? (
              <>
                {/* Post a Ride button - only for drivers - hidden on mobile */}
                {canPostRide && (
                  <Button 
                    asChild 
                    className="hidden md:flex touch-target bg-[#111111] hover:bg-[#222222] text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link to="/post-ride" className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <span>Post Ride</span>
                    </Link>
                  </Button>
                )}

                {/* Notification bell - hidden on mobile */}
                <div className="hidden md:block">
                  <NotificationBell />
                </div>

                {/* User dropdown - hidden on mobile */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-3 touch-target hover:bg-[#111111]/10 transition-all duration-200 px-4 py-2 rounded-xl border border-transparent hover:border-[#111111]/20"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-[#3A2A5A]/20">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback className="bg-[#111111] text-[#FFD400] font-semibold">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block text-left">
                          <p className="font-semibold text-[#111111] text-sm">{user.name}</p>
                          <p className="text-xs text-[#4F4F4F] capitalize">{user.role}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-[#111111]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-xl border-2 border-[#111111]/20 bg-white rounded-xl">
                      <div className="px-4 py-3 border-b border-[#111111]/20 bg-[#FFD400]/10">
                        <p className="text-sm font-bold text-[#111111]">{user.name}</p>
                        <p className="text-xs text-[#4F4F4F] font-semibold capitalize">{user.role} Account</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/me" className="flex items-center px-4 py-3 hover:bg-[#FFD400]/20 transition-all duration-200 rounded-lg mx-1 my-1">
                          <Settings className="mr-3 h-5 w-5 text-[#111111]" />
                          <span className="font-semibold text-[#111111]">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard'}
                          className="flex items-center px-4 py-3 hover:bg-[#FFD400]/20 transition-all duration-200 rounded-lg mx-1 my-1"
                        >
                          <User className="mr-3 h-5 w-5 text-[#111111]" />
                          <span className="font-semibold text-[#111111]">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={user.role === 'driver' ? '/driver/rides' : '/passenger/bookings'}
                          className="flex items-center px-4 py-3 hover:bg-[#FFD400]/20 transition-all duration-200 rounded-lg mx-1 my-1"
                        >
                          <BookOpen className="mr-3 h-5 w-5 text-[#111111]" />
                          <span className="font-semibold text-[#111111]">My {user.role === 'driver' ? 'Rides' : 'Bookings'}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2 bg-[#111111]/20 h-0.5" />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-1 my-1 font-semibold"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  asChild 
                  className="touch-target hover:bg-gray-100 transition-all duration-200"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  className="touch-target bg-[#111111] hover:bg-[#222222] text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}