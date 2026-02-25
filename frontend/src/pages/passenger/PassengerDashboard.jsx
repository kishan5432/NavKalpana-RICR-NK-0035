import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyBookings, getRides, submitRating, getNotifications, markNotificationRead, getMe } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { 
  Search, 
  MapPin, 
  Clock, 
  Car, 
  DollarSign, 
  Star, 
  Bell, 
  Route,
  Calendar,
  TrendingUp,
  Navigation,
  Bookmark
} from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null, rating: 0, comment: '' });

  useEffect(() => {
    fetchBookings();
    fetchSavedRoutes();
  }, []);

  const fetchBookings = async () => {
    try {
      const [bookingsData, notificationsData] = await Promise.all([
        getMyBookings(),
        getNotifications()
      ]);
      
      const passengerBookings = (bookingsData.bookings || []).filter(b => b.passengerId?._id === user?._id);
      setBookings(passengerBookings);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRoutes = async () => {
    try {
      const userData = await getMe();
      setSavedRoutes(userData.user.savedRoutes || []);
    } catch (error) {
      console.error('Fetch saved routes error:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleRateTrip = async () => {
    if (ratingModal.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      console.log('Submitting rating:', {
        bookingId: ratingModal.booking._id,
        ratedUserId: ratingModal.booking.rideId?.driverId?._id,
        stars: ratingModal.rating,
        comment: ratingModal.comment
      });
      
      await submitRating({
        bookingId: ratingModal.booking._id,
        ratedUserId: ratingModal.booking.rideId?.driverId?._id,
        stars: ratingModal.rating,
        comment: ratingModal.comment
      });
      
      toast.success('Rating submitted!');
      setRatingModal({ open: false, booking: null, rating: 0, comment: '' });
      fetchBookings();
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const getTimeUntilRide = (rideDate, departureTime) => {
    const rideDateTime = new Date(`${rideDate.split('T')[0]}T${departureTime}`);
    const now = new Date();
    const diff = rideDateTime - now;
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const totalTrips = bookings.filter(b => b.status === 'completed').length;
  const upcomingTrips = bookings.filter(b => ['requested', 'accepted'].includes(b.status) && new Date(b.rideId?.date) >= new Date()).length;
  const totalSpent = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0);
  const avgTripCost = totalTrips > 0 ? Math.round(totalSpent / totalTrips) : 0;
  const moneySaved = Math.round(totalSpent * 0.3); // Estimate 30% savings vs other transport
  
  // Calculate favorite routes
  const routeCount = {};
  bookings.forEach(b => {
    if (b.rideId?.from && b.rideId?.to) {
      const route = `${b.rideId.from} → ${b.rideId.to}`;
      routeCount[route] = (routeCount[route] || 0) + 1;
    }
  });
  const favoriteRoute = Object.keys(routeCount).length > 0 
    ? Object.keys(routeCount).reduce((a, b) => routeCount[a] > routeCount[b] ? a : b)
    : 'None yet';

  const upcomingBookings = bookings
    .filter(b => ['requested', 'accepted'].includes(b.status) && new Date(b.rideId?.date) >= new Date())
    .sort((a, b) => new Date(a.rideId?.date) - new Date(b.rideId?.date))
    .slice(0, 3);

  const pastBookings = bookings
    .filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.rideId?.date) - new Date(a.rideId?.date))
    .slice(0, 5);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-gray-500',
      completed: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3A3A6A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3A3A6A] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#3A2A5A] to-[#2d1f47] text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-white/80">Ready for your next journey?</p>
            </div>
            <div className="relative">
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/notifications')}>
                <Bell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EC3399] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Trips</p>
                    <p className="text-3xl font-bold">{totalTrips}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Car className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Money Saved</p>
                    <p className="text-3xl font-bold">₹{moneySaved}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold">{upcomingTrips}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Quick Search - Big Button */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/search')}
            className="w-full max-w-md h-16 text-lg font-semibold bg-gradient-to-r from-[#EC3399] to-[#d62d88] hover:from-[#d62d88] hover:to-[#c02876] shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search className="h-6 w-6 mr-3" />
            Search for Rides
          </Button>
        </div>

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
                <Bookmark className="h-5 w-5" />
                Saved Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {savedRoutes.map((route, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`)}
                    className="px-4 py-2 bg-gradient-to-r from-[#3A2A5A] to-[#2d1f47] text-white rounded-full hover:shadow-lg transition-all duration-200 flex items-center gap-2 group"
                  >
                    <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{route.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Rides */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
              <Clock className="h-5 w-5" />
              Upcoming Rides ({upcomingTrips})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No upcoming rides</p>
                <Button className="bg-[#EC3399] hover:bg-[#d62d88]" onClick={() => navigate('/search')}>
                  Book a Ride
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="p-4 border-l-4 border-[#EC3399] bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/rides/${booking.rideId?._id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-[#EC3399]">
                          <AvatarImage src={booking.driverId?.profilePhoto} />
                          <AvatarFallback className="bg-[#3A2A5A] text-white">{booking.driverId?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-[#3A2A5A]">{booking.rideId?.from} → {booking.rideId?.to}</p>
                          <p className="text-sm text-gray-600">Driver: {booking.driverId?.name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.rideId?.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.rideId?.departureTime}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#EC3399]">₹{booking.totalPrice}</p>
                      </div>
                    </div>
                    
                    {booking.status === 'accepted' && (
                      <div className="mt-3 pt-3 border-t">
                        <Button size="sm" className="bg-[#3A2A5A] hover:bg-[#2d1f47]" onClick={(e) => { e.stopPropagation(); navigate(`/chat/${booking._id}`); }}>
                          Message Driver
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
                <Bell className="h-5 w-5" />
                Recent Notifications
                {unreadNotifications > 0 && (
                  <Badge className="bg-[#EC3399]">{unreadNotifications} new</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      !notification.read ? 'bg-pink-50 border-[#EC3399]' : 'bg-gray-50'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationRead(notification._id);
                      }
                      navigate('/notifications');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-[#3A2A5A]">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#EC3399] rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-2">
                  <Button variant="outline" className="border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white" onClick={() => navigate('/notifications')}>
                    View All Notifications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Rides */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
              <Navigation className="h-5 w-5" />
              Past Rides
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pastBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No completed rides yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div key={booking._id} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#3A2A5A]">{booking.rideId?.from} → {booking.rideId?.to}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.rideId?.date).toLocaleDateString()} • ₹{booking.totalPrice}
                        </p>
                      </div>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                    
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={booking.rideId?.driverId?.profilePhoto} />
                            <AvatarFallback className="bg-[#3A2A5A] text-white">{booking.rideId?.driverId?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{booking.rideId?.driverId?.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(booking.passengerRating || booking.rating || booking.hasRated) ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= (booking.passengerRating?.stars || booking.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">Rated {booking.passengerRating?.stars || booking.rating || 5}/5</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setRatingModal({ open: true, booking, rating: 0, comment: '' })}
                              className="bg-[#EC3399] hover:bg-[#d62d88] text-white"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Rate Driver
                            </Button>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline" className="border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white" onClick={() => navigate('/passenger/bookings')}>
                    View All Bookings
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rating Modal */}
      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, booking: null, rating: 0, comment: '' })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Rate Your Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">How was your ride with {ratingModal.booking?.rideId?.driverId?.name}?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 cursor-pointer transition-colors ${
                      star <= ratingModal.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your experience (optional)"
              value={ratingModal.comment}
              onChange={(e) => setRatingModal({ ...ratingModal, comment: e.target.value })}
              rows={3}
              className="rounded-xl"
            />
            <Button 
              onClick={handleRateTrip}
              disabled={ratingModal.rating === 0}
              className="w-full py-3 bg-[#EC3399] text-white rounded-xl font-semibold hover:bg-[#d62d88] disabled:opacity-50 transition-colors"
            >
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
