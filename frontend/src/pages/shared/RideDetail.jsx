import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getRideById, createBooking, getUserRatings, submitRating, getMyBookings, cancelBooking } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Car, 
  Shield, 
  Phone, 
  ChevronRight,
  Home,
  Calendar,
  DollarSign,
  Route,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import BookingFlow from '../../components/BookingFlow';
import ReliabilityBadge from '../../components/ReliabilityBadge';

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [ratings, setRatings] = useState([]);
  const [ratingModal, setRatingModal] = useState({ open: false, rating: 0, comment: '' });
  const [reliabilityInfoOpen, setReliabilityInfoOpen] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    fetchRide();
    if (ride?.driverId?._id) {
      getUserRatings(ride.driverId._id)
        .then(ratingsData => {
          setRatings(ratingsData.ratings || []);
          // Check if current user has already rated this driver for this ride
          const existingRating = ratingsData.ratings?.find(
            rating => rating.raterId?._id === user?._id && rating.bookingId === userBooking?._id
          );
          setUserRating(existingRating);
        })
        .catch(err => console.error('Error fetching ratings:', err));
    }
  }, [id, ride?.driverId?._id, user?._id, userBooking?._id]);

  useEffect(() => {
    if (user && ride) {
      fetchUserBooking();
    }
  }, [user, ride]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setStickyBooking(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserBooking = async () => {
    try {
      const bookingsData = await getMyBookings();
      const booking = bookingsData.bookings?.find(
        b => b.rideId?._id === id && b.passengerId?._id === user._id && ['requested', 'accepted', 'completed'].includes(b.status)
      );
      setUserBooking(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const fetchRide = async () => {
    try {
      const response = await getRideById(id);
      setRide(response.ride);
      
      if (user) {
        const bookingsData = await getMyBookings();
        const booking = bookingsData.bookings?.find(
          b => b.rideId?._id === id && b.passengerId?._id === user._id && ['requested', 'accepted', 'completed'].includes(b.status)
        );
        setUserBooking(booking);
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(userBooking._id);
      toast.success('Booking cancelled');
      setUserBooking(null);
      fetchRide();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleRatingSubmit = async () => {
    if (ratingModal.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!userBooking) {
      toast.error('You must have completed this ride to rate');
      return;
    }
    try {
      await submitRating({
        bookingId: userBooking._id,
        ratedUserId: ride.driverId._id,
        stars: ratingModal.rating,
        comment: ratingModal.comment
      });
      setRatingModal({ open: false, rating: 0, comment: '' });
      toast.success('Rating submitted');
      fetchRide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleBooking = async (bookingData) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBooking(true);
    try {
      await createBooking({
        rideId: ride._id,
        seatsBooked: bookingData.seatsBooked
      });
      toast.success('Booking successful!');
      fetchUserBooking();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const dateFormatted = date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Handle time string
    let timeFormatted = timeStr || 'N/A';
    if (timeStr && typeof timeStr === 'string' && !timeStr.match(/^\d{2}:\d{2}/)) {
      const timeDate = new Date(timeStr);
      if (!isNaN(timeDate.getTime())) {
        timeFormatted = timeDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    
    return `${dateFormatted} at ${timeFormatted}`;
  };

  const isOwner = user && ride && ride.driverId && user._id === ride.driverId._id;
  const canBook = user && !isOwner && ride?.status === 'active' && ride?.availableSeats > 0 && !userBooking;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride not found</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFD400] via-[#FFC400] to-[#E6B800] text-[#111111] border-b-4 border-[#111111] relative overflow-hidden">
        {/* Animated passenger icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-[40%] animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
            <span className="text-4xl">🚶</span>
          </div>
          <div className="absolute top-1/2 left-[50%] animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>
            <span className="text-4xl">🧳</span>
          </div>
          <div className="absolute top-1/2 left-[60%] animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>
            <span className="text-4xl">🚗</span>
          </div>
          <div className="absolute top-1/2 left-[70%] animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.2s'}}>
            <span className="text-4xl">🎒</span>
          </div>
          <div className="absolute top-1/2 left-[80%] animate-bounce" style={{animationDelay: '2s', animationDuration: '3.8s'}}>
            <span className="text-4xl">💼</span>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{ride.from} → {ride.to}</h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/search')}
                className="bg-[#111111]/20 hover:bg-[#111111]/30 text-[#111111] border-[#111111]/30"
              >
                Search Rides
              </Button>
              <Button
                onClick={() => navigate(user?.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard')}
                className="bg-[#111111]/20 hover:bg-[#111111]/30 text-[#111111] border-[#111111]/30"
              >
                Dashboard
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              ride.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {ride.status}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Calendar className="h-6 w-6 text-blue-700 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">Date</p>
                  <p className="text-xl font-black text-blue-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{new Date(ride.date).toLocaleDateString()}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Clock className="h-6 w-6 text-purple-700 mx-auto mb-2" />
                  <p className="text-sm text-purple-800 font-medium">Departure</p>
                  <p className="text-xl font-black text-purple-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.departureTime}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <DollarSign className="h-6 w-6 text-green-700 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">Price per seat</p>
                  <p className="text-xl font-black text-green-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">₹{ride.pricePerSeat}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Users className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-800 font-medium">Available Seats</p>
                  <p className="text-xl font-black text-slate-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.availableSeats}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Star className="h-6 w-6 text-yellow-700 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800 font-medium">Rating</p>
                  <p className="text-xl font-black text-yellow-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.driverId?.rating?.average?.toFixed(1) || 'New'}</p>
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#111111]" />
                Route Details
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#FFD400] rounded-full" />
                    <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#FFD400] text-lg">{ride.from}</p>
                    <p className="text-gray-600">{ride.departureTime} • Starting point</p>
                  </div>
                </div>
                
                {ride.stops?.map((stop, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      {index < ride.stops.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{stop}</p>
                      <p className="text-gray-600 text-sm">Stop {index + 1}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-[#111111] rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#111111] text-lg">{ride.to}</p>
                    <p className="text-gray-600">Destination</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            {ride.vehicle && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#111111]" />
                  Vehicle Details
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#FFD400]/10 rounded-xl flex items-center justify-center">
                    <Car className="h-8 w-8 text-[#FFD400]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{ride.vehicle.make} {ride.vehicle.model}</h4>
                    <p className="text-gray-600">{ride.vehicle.year} • {ride.vehicle.color}</p>
                    <p className="text-sm text-gray-500">{ride.vehicle.licensePlate}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🚭 No Smoking</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">❄️ AC Available</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">🎵 Music OK</span>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews ({ratings.length})
              </h3>
              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.slice(0, 3).map((rating) => (
                    <div key={rating._id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#FFD400] text-[#111111] rounded-full flex items-center justify-center font-semibold">
                          {rating.raterId?.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{rating.raterId?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {rating.comment && <p className="text-gray-700 text-sm">{rating.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={ride.driverId?.profilePhoto} />
                  <AvatarFallback className="bg-[#FFD400] text-[#111111] text-2xl font-bold">
                    {ride.driverId?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-900">{ride.driverId?.name}</h3>
                {ride.driverId?.instant_badge_active && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium px-2 py-1 text-xs flex items-center gap-1 mx-auto w-fit mt-2">
                    <Zap className="w-3 h-3" />
                    Instant Confirm
                  </Badge>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{ride.driverId?.rating?.average?.toFixed(1) || 'New'}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{ride.driverId?.rating?.count || 0} trips</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Reliability:</span>
                  {ride.driverId?.reliabilityLabel ? (
                    <ReliabilityBadge label={ride.driverId.reliabilityLabel} />
                  ) : (
                    <Badge className="bg-yellow-500 text-white">Moderate</Badge>
                  )}
                  <button
                    onClick={() => setReliabilityInfoOpen(true)}
                    className="ml-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    title="How is reliability calculated?"
                  >
                    <Info className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/profile/${ride.driverId._id}`)}
                className="w-full py-3 border border-[#111111] text-[#111111] rounded-xl font-medium hover:bg-[#111111] hover:text-white transition-colors mb-2"
              >
                View Profile
              </button>
              
              {userBooking && userBooking.status === 'completed' && (
                userRating ? (
                  <div className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-center cursor-not-allowed">
                    Rating Submitted
                  </div>
                ) : (
                  <button 
                    onClick={() => setRatingModal({ open: true, rating: 0, comment: '' })}
                    className="w-full py-3 bg-[#FFD400] text-[#111111] rounded-xl font-medium hover:bg-[#FFC400] transition-colors"
                  >
                    Rate Driver
                  </button>
                )
              )}
            </div>

            {/* Booking Card */}
            {canBook && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Price per seat</span>
                    <span className="text-2xl font-bold text-[#111111]">₹{ride.pricePerSeat}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Available seats</span>
                    <span className="font-medium">{ride.availableSeats} left</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select seats</label>
                    <select 
                      value={selectedSeats} 
                      onChange={(e) => setSelectedSeats(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FFD400]"
                    >
                      {[...Array(Math.min(ride.availableSeats, 4))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} seat{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-[#111111]">₹{ride.pricePerSeat * selectedSeats}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleBooking({ seatsBooked: selectedSeats })}
                      disabled={booking}
                      className="w-full py-4 bg-[#FFD400] text-[#111111] rounded-xl font-semibold hover:bg-[#FFC400] disabled:opacity-50 transition-colors"
                    >
                      {booking ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Booking Status */}
            {userBooking && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-4">Your Booking</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      userBooking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      userBooking.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userBooking.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seats</span>
                    <span className="font-medium">{userBooking.seatsBooked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold">₹{userBooking.totalAmount || (userBooking.seatsBooked * ride.pricePerSeat)}</span>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    {userBooking.status === 'accepted' && (
                      <button 
                        onClick={() => navigate(`/chat/${userBooking._id}`)}
                        className="w-full py-3 bg-[#111111] text-white rounded-xl font-medium hover:bg-[#222222] transition-colors"
                      >
                        Message Driver
                      </button>
                    )}
                    {userBooking.status === 'requested' && (
                      <button 
                        onClick={handleCancelBooking}
                        className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Login Prompt */}
            {!user && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Ready to book?</h3>
                <p className="text-gray-600 mb-4">Login to secure your seat</p>
                <button 
                  onClick={() => navigate(`/login?redirect=/rides/${id}`)}
                  className="w-full py-3 bg-[#FFD400] text-[#111111] rounded-xl font-semibold hover:bg-[#FFC400] transition-colors"
                >
                  Login to Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, rating: 0, comment: '' })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Rate Your Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">How was your ride with {ride?.driverId?.name}?</p>
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
            <button 
              onClick={handleRatingSubmit}
              disabled={ratingModal.rating === 0}
              className="w-full py-3 bg-[#FFD400] text-[#111111] rounded-xl font-semibold hover:bg-[#FFC400] disabled:opacity-50 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reliability Info Modal */}
      <Dialog open={reliabilityInfoOpen} onOpenChange={setReliabilityInfoOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#3A3A6A]" />
              How Reliability is Calculated
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Reliability score is calculated based on multiple factors to ensure safe and dependable rides:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                  40%
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ride Completion Rate</h4>
                  <p className="text-sm text-gray-600">How many rides are successfully completed</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">
                  25%
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cancellation Frequency</h4>
                  <p className="text-sm text-gray-600">Lower cancellations mean higher reliability</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                  25%
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rating Average</h4>
                  <p className="text-sm text-gray-600">Based on reviews from other passengers</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                  10%
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Response Time</h4>
                  <p className="text-sm text-gray-600">How quickly booking requests are accepted</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold text-gray-900">Reliability Levels:</h4>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">High</Badge>
                <span className="text-sm text-gray-600">71-100 points</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">Moderate</Badge>
                <span className="text-sm text-gray-600">41-70 points</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">Low</Badge>
                <span className="text-sm text-gray-600">0-40 points</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}