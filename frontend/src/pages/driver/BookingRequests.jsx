import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyBookings, acceptBooking, rejectBooking } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Users, Clock, MessageCircle, Check, X, UserCheck, AlertCircle, Inbox } from 'lucide-react';

export default function BookingRequests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      const driverBookings = (data.bookings || []).filter(b => b.driverId?._id === user?._id);
      const rideId = searchParams.get('rideId');
      setBookings(rideId ? driverBookings.filter(b => b.rideId?._id === rideId) : driverBookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptBooking(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'accepted' } : b));
      toast.success('Booking accepted');
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'rejected' } : b));
      toast.success('Booking rejected');
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    const rideId = booking.rideId?._id;
    if (!acc[rideId]) acc[rideId] = { ride: booking.rideId, bookings: [] };
    acc[rideId].bookings.push(booking);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      accepted: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      cancelled: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      completed: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getStatusIcon = (status) => {
    const icons = {
      requested: <Clock className="h-4 w-4" />,
      accepted: <Check className="h-4 w-4" />,
      rejected: <X className="h-4 w-4" />,
      cancelled: <X className="h-4 w-4" />,
      completed: <Check className="h-4 w-4" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#3A2A5A] via-[#4A3A6A] to-[#EC3399] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/driver/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Inbox className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Booking Requests</h1>
            </div>
          </div>
          
          <p className="text-white/90 text-lg max-w-2xl">
            Manage passenger booking requests for your rides
          </p>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 120" className="w-full h-[60px]" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,60 Q360,120 720,60 T1440,60 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">

        {Object.keys(groupedBookings).length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-lg rounded-2xl border-0">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
              <Inbox className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No booking requests</h3>
            <p className="text-gray-500 mb-6">You don't have any booking requests at the moment</p>
            <Button 
              onClick={() => navigate('/driver/create-ride')} 
              className="bg-[#EC3399] hover:bg-[#d62d88] text-white"
            >
              Create New Ride
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedBookings).map(({ ride, bookings }) => (
              <Card key={ride._id} className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {ride.from} → {ride.to}
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(ride.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{ride.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{bookings.length} request(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div 
                        key={booking._id} 
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/driver/rides/${ride._id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                              <AvatarImage src={booking.passengerId?.profilePhoto} />
                              <AvatarFallback className="bg-gradient-to-r from-[#3A2A5A] to-[#EC3399] text-white font-semibold">
                                {booking.passengerId?.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">{booking.passengerId?.name}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{booking.seatsBooked} seat(s)</span>
                                </div>
                                <div className="font-semibold text-gray-900">
                                  ₹{booking.totalPrice}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={`${getStatusColor(booking.status)} px-3 py-1 rounded-full flex items-center gap-2 font-medium`}>
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {booking.status === 'requested' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAccept(booking._id)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleReject(booking._id)}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {booking.status === 'accepted' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate(`/chat/${booking._id}`)}
                                  className="bg-[#EC3399] hover:bg-[#d62d88] text-white"
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
