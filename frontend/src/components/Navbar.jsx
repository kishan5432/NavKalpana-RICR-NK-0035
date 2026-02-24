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
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              RideShareX
            </span>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {user ? (
              <>
                {/* Post a Ride button - only for drivers - hidden on mobile */}
                {canPostRide && (
                  <Button 
                    asChild 
                    className="hidden md:flex touch-target bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Link to="/post-ride" className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <span>Post Ride</span>
                    </Link>
                  </Button>
                )}

                {/* Search Rides button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="hidden md:flex touch-target border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <Link to="/search" className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                </Button>

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
                        className="flex items-center space-x-2 touch-target hover:bg-gray-100 transition-all duration-200 px-3 py-2 rounded-lg"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block font-medium text-gray-700">{user.name}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-200">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/me" className="flex items-center px-3 py-2 hover:bg-gray-50">
                          <Settings className="mr-3 h-4 w-4 text-gray-500" />
                          <span>Profile Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard'}
                          className="flex items-center px-3 py-2 hover:bg-gray-50"
                        >
                          <User className="mr-3 h-4 w-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={user.role === 'driver' ? '/driver/rides' : '/passenger/bookings'}
                          className="flex items-center px-3 py-2 hover:bg-gray-50"
                        >
                          <BookOpen className="mr-3 h-4 w-4 text-gray-500" />
                          <span>My {user.role === 'driver' ? 'Rides' : 'Bookings'}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
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
                  className="touch-target bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
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