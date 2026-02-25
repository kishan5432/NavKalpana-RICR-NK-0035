import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyPostedRides, getMyBookings, startRide, completeRide, acceptBooking, rejectBooking, getUserRatings, getOptimizationSuggestions } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  DollarSign, 
  Car, 
  CheckCircle, 
  Star, 
  Plus, 
  Calendar, 
  TrendingUp,
  Clock,
  MapPin,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalEarnings: 0,
    rating: 0,
    upcomingRides: [],
    inProgressRides: [],
    earningsData: []
  });
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizationData, setOptimizationData] = useState({});
  const [dismissedBanners, setDismissedBanners] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ridesData, bookingsData, ratingsData] = await Promise.all([
        getMyPostedRides(),
        getMyBookings(),
        getUserRatings(user._id)
      ]);
      
      const rides = ridesData.rides || [];
      const bookings = (bookingsData.bookings || []).filter(b => b.driverId?._id === user?._id);
      const ratings = ratingsData.ratings || [];
      
      // Calculate earnings for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const earningsData = last7Days.map(date => {
        const dayEarnings = rides
          .filter(r => r.status === 'completed' && r.date.split('T')[0] === date)
          .reduce((sum, r) => sum + (r.pricePerSeat * (r.totalSeats - r.availableSeats)), 0);
        return { date, earnings: dayEarnings };
      });
      
      const calculatedStats = {
        totalRides: rides.length,
        activeRides: rides.filter(r => r.status === 'active').length,
        completedRides: rides.filter(r => r.status === 'completed').length,
        cancelledRides: rides.filter(r => r.status === 'cancelled').length,
        totalEarnings: rides
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + (r.pricePerSeat * (r.totalSeats - r.availableSeats)), 0),
        rating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.stars || r.rating || 0), 0) / ratings.length).toFixed(1) : 0,
        upcomingRides: rides
          .filter(r => ['active', 'fully_booked'].includes(r.status) && new Date(r.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5),
        inProgressRides: rides.filter(r => r.status === 'in_progress'),
        earningsData
      };
      
      setStats(calculatedStats);
      setBookingRequests(bookings.filter(b => b.status === 'requested').slice(0, 5));
      
      // Fetch optimization suggestions for upcoming rides
      const optimizationPromises = calculatedStats.upcomingRides.map(ride => 
        getOptimizationSuggestions(ride._id)
          .then(data => ({ rideId: ride._id, data }))
          .catch(() => ({ rideId: ride._id, data: null }))
      );
      const optimizationResults = await Promise.all(optimizationPromises);
      const optimizationMap = {};
      optimizationResults.forEach(result => {
        if (result.data) {
          optimizationMap[result.rideId] = result.data;
        }
      });
      setOptimizationData(optimizationMap);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      await startRide(rideId);
      toast.success('Ride started!');
      fetchData();
    } catch (error) {
      toast.error('Failed to start ride');
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      toast.success('Ride completed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete ride');
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      toast.success('Booking accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      toast.success('Booking rejected!');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const handleQuickAction = async (ride, suggestionType) => {
    const scrollTargets = {
      price: 'pricePerSeat',
      details: 'stops',
      departure_time: 'departureTime'
    };
    navigate(`/driver/edit-ride/${ride._id}`, { state: { scrollTo: scrollTargets[suggestionType] } });
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-500',
      started: 'bg-blue-500',
      fully_booked: 'bg-blue-500',
      cancelled: 'bg-red-500',
      completed: 'bg-gray-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
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
              <p className="text-white/80">Manage your rides and earnings</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold">₹{stats.totalEarnings}</p>
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
                    <p className="text-sm text-white/80 mb-1">Active Rides</p>
                    <p className="text-3xl font-bold">{stats.activeRides}</p>
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
                    <p className="text-sm text-white/80 mb-1">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedRides}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">{stats.rating}</p>
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Quick Actions */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/post-ride')} 
                className="h-16 text-lg font-semibold bg-[#EC3399] hover:bg-[#d62d88]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post New Ride
              </Button>
              <Button 
                onClick={() => navigate('/driver/bookings')} 
                variant="outline" 
                className="h-16 text-lg font-semibold border-2 border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white"
              >
                <Calendar className="h-5 w-5 mr-2" />
                View Bookings
              </Button>
              <Button 
                onClick={() => navigate('/driver/rides')} 
                variant="outline" 
                className="h-16 text-lg font-semibold border-2 border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white"
              >
                <Car className="h-5 w-5 mr-2" />
                My Rides
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Rides */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
                <Clock className="h-5 w-5" />
                Upcoming Rides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stats.upcomingRides.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Car className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No upcoming rides</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.upcomingRides.map((ride, index) => (
                    <div key={ride._id} className="relative">
                      {index < stats.upcomingRides.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200" />
                      )}
                      <div 
                        className="flex items-start gap-4 p-4 rounded-lg border-l-4 border-[#EC3399] bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/driver/rides/${ride._id}`)}
                      >
                        <div className="p-2 bg-[#EC3399]/10 rounded-full">
                          <MapPin className="h-4 w-4 text-[#EC3399]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#3A2A5A]">{ride.from} → {ride.to}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-[#EC3399] font-medium">₹{ride.pricePerSeat}/seat</span>
                            <span className="text-sm text-gray-500">{ride.availableSeats}/{ride.totalSeats} seats</span>
                            {getStatusBadge(ride.status)}
                          </div>
                        </div>
                      </div>
                      {optimizationData[ride._id]?.low_booking_rate && !dismissedBanners[ride._id] && (
                        <div className="mt-2 ml-12 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <p className="text-sm font-semibold text-yellow-800">This ride has a low booking rate</p>
                              </div>
                              <div className="space-y-2">
                                {optimizationData[ride._id].suggestions.map((suggestion, idx) => {
                                  const buttonLabels = {
                                    price: 'Edit Price',
                                    details: 'Add Details',
                                    departure_time: 'Edit Time'
                                  };
                                  return (
                                    <div key={idx} className="flex items-center justify-between gap-2">
                                      <p className="text-xs text-yellow-700 flex-1">• {suggestion.message}</p>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuickAction(ride, suggestion.type);
                                        }}
                                      >
                                        {buttonLabels[suggestion.type]}
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedBanners(prev => ({ ...prev, [ride._id]: true }));
                              }}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Requests */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
                <Users className="h-5 w-5" />
                Booking Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {bookingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map((booking) => (
                    <div key={booking._id} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 ring-2 ring-[#EC3399]">
                          <AvatarImage src={booking.passengerId?.profilePhoto} />
                          <AvatarFallback className="bg-[#3A2A5A] text-white">{booking.passengerId?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-[#3A2A5A]">{booking.passengerId?.name}</p>
                          <p className="text-sm text-gray-600">
                            {booking.seatsBooked} seat(s) • ₹{booking.totalPrice}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p className="font-medium">{booking.rideId?.from} → {booking.rideId?.to}</p>
                        <p>{new Date(booking.rideId?.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptBooking(booking._id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleRejectBooking(booking._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* In Progress Rides */}
        {stats.inProgressRides.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
                <Car className="h-5 w-5" />
                In Progress Rides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.inProgressRides.map((ride) => (
                  <div 
                    key={ride._id} 
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/driver/rides/${ride._id}`)}
                  >
                    <div>
                      <p className="font-semibold text-[#3A2A5A]">{ride.from} → {ride.to}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}
                      </p>
                      <p className="text-sm text-[#EC3399] font-medium">₹{ride.pricePerSeat} per seat</p>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm">{ride.availableSeats}/{ride.totalSeats} seats</span>
                      {getStatusBadge(ride.status)}
                      <Button size="sm" className="bg-[#EC3399] hover:bg-[#d62d88]" onClick={() => handleCompleteRide(ride._id)}>
                        Complete Ride
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
              <TrendingUp className="h-5 w-5" />
              Earnings (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.earningsData.map((day, index) => {
                const maxEarnings = Math.max(...stats.earningsData.map(d => d.earnings), 1);
                const height = (day.earnings / maxEarnings) * 200;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs font-medium mb-2 text-[#EC3399]">₹{day.earnings}</div>
                    <div 
                      className="w-full bg-gradient-to-t from-[#EC3399] to-pink-300 rounded-t-md min-h-[20px]"
                      style={{ height: `${height}px` }}
                    />
                    <div className="text-xs text-gray-600 mt-2">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
