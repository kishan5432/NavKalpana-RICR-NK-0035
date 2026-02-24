import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getRideById, getMyBookings, startRide, completeRide, cancelRide, acceptBooking, rejectBooking, submitRating } from '../../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Car, 
  DollarSign,
  Calendar,
  Route,
  CheckCircle,
  XCircle,
  MessageCircle,
  Play,
  Square,
  ArrowLeft,
  Settings,
  TrendingUp
} from 'lucide-react';

export default function DriverRideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null, rating: 0, comment: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [rideData, bookingsData] = await Promise.all([
        getRideById(id),
        getMyBookings()
      ]);
      setRide(rideData.ride);
      setBookings((bookingsData.bookings || []).filter(b => b.rideId?._id === id));
    } catch (error) {
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    try {
      await startRide(id);
      setRide({ ...ride, status: 'in_progress' });
      toast.success('Ride started!');
    } catch (error) {
      toast.error('Failed to start ride');
    }
  };

  const handleCancelRide = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await cancelRide(id);
      setRide({ ...ride, status: 'cancelled' });
      toast.success('Ride cancelled');
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const handleCompleteRide = async () => {
    try {
      await completeRide(id);
      setRide({ ...ride, status: 'completed' });
      toast.success('Ride completed!');
    } catch (error) {
      toast.error('Failed to complete ride');
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'accepted' } : b));
      toast.success('Booking accepted');
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'rejected' } : b));
      toast.success('Booking rejected');
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const handleRatingSubmit = async () => {
    if (ratingModal.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      await submitRating({
        bookingId: ratingModal.booking._id,
        ratedUserId: ratingModal.booking.passengerId._id,
        stars: ratingModal.rating,
        comment: ratingModal.comment
      });
      setRatingModal({ open: false, booking: null, rating: 0, comment: '' });
      toast.success('Rating submitted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      fully_booked: 'bg-orange-100 text-orange-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      requested: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#3A3A6A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3A3A6A]">Loading ride details...</p>
        </div>
      </div>
    );
  }
  
  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride not found</h2>
          <button 
            onClick={() => navigate('/driver/dashboard')}
            className="px-4 py-2 bg-[#3A3A6A] text-white rounded-xl hover:bg-[#3A3A6A]/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#3A3A6A] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/driver/dashboard')} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ride.from} → {ride.to}</h1>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                {ride.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Users className="h-5 w-5 text-slate-700 mx-auto mb-1" />
                  <p className="text-xs text-slate-800 font-medium">Booked Seats</p>
                  <p className="text-lg font-black text-slate-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.totalSeats - ride.availableSeats}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <DollarSign className="h-5 w-5 text-green-700 mx-auto mb-1" />
                  <p className="text-xs text-green-800 font-medium">Total Earnings</p>
                  <p className="text-lg font-black text-green-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">₹{(ride.totalSeats - ride.availableSeats) * ride.pricePerSeat}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <TrendingUp className="h-5 w-5 text-blue-700 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 font-medium">Available</p>
                  <p className="text-lg font-black text-blue-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.availableSeats}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <MessageCircle className="h-5 w-5 text-yellow-700 mx-auto mb-1" />
                  <p className="text-xs text-yellow-800 font-medium">Requests</p>
                  <p className="text-lg font-black text-yellow-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{bookings.filter(b => b.status === 'requested').length}</p>
                </div>
              </div>
            </div>

            {/* Ride Details */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Calendar className="h-5 w-5 text-blue-700 mx-auto mb-1" />
                  <p className="text-xs text-blue-800 font-medium">Date</p>
                  <p className="text-lg font-black text-blue-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{new Date(ride.date).toLocaleDateString()}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <Clock className="h-5 w-5 text-purple-700 mx-auto mb-1" />
                  <p className="text-xs text-purple-800 font-medium">Departure</p>
                  <p className="text-lg font-black text-purple-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">{ride.departureTime}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <DollarSign className="h-5 w-5 text-green-700 mx-auto mb-1" />
                  <p className="text-xs text-green-800 font-medium">Price per seat</p>
                  <p className="text-lg font-black text-green-900 drop-shadow-[2px_2px_4px_rgba(147,51,234,0.3)]">₹{ride.pricePerSeat}</p>
                </div>
              </div>
            </div>

            {/* Ride Actions */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#3A3A6A]" />
                Ride Controls
              </h3>
              <div className="flex flex-wrap gap-3">
                {(ride.status === 'active' || ride.status === 'fully_booked') && (
                  <>
                    <button 
                      onClick={handleStartRide}
                      className="flex items-center gap-2 px-6 py-3 bg-[#E63399] text-white rounded-xl font-medium hover:bg-[#E63399]/90 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Start Ride
                    </button>
                    <button 
                      onClick={handleCancelRide}
                      className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Ride
                    </button>
                  </>
                )}
                {(ride.status === 'started' || ride.status === 'in_progress') && (
                  <button 
                    onClick={handleCompleteRide}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <Square className="h-4 w-4" />
                    Complete Ride
                  </button>
                )}
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Route className="h-5 w-5 text-[#3A3A6A]" />
                Route Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#3A3A6A] rounded-full" />
                    <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#3A3A6A] text-lg">{ride.from}</p>
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
                  <div className="w-4 h-4 bg-[#E63399] rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#E63399] text-lg">{ride.to}</p>
                    <p className="text-gray-600">Destination</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Preferences */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-[#3A3A6A]" />
                Vehicle & Preferences
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Vehicle Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Total Seats: {ride.totalSeats}</p>
                    <p>Distance: {ride.distance || 'N/A'} km</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ride Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">🚭 No Smoking</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">❄️ AC Available</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">🎵 Music OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Booking Requests */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Requests ({bookings.length})</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No booking requests yet</p>
                  <p className="text-sm text-gray-400">Passengers will appear here when they book</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-xl p-4 hover:border-[#3A3A6A]/30 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#3A3A6A] text-white rounded-full flex items-center justify-center font-semibold">
                          {booking.passengerId?.name?.[0] || 'P'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{booking.passengerId?.name}</p>
                          <p className="text-sm text-gray-600">
                            {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''} • ₹{booking.totalPrice}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {booking.status === 'requested' && (
                          <>
                            <button 
                              onClick={() => handleAcceptBooking(booking._id)}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectBooking(booking._id)}
                              className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'accepted' && (
                          <button 
                            onClick={() => navigate(`/chat/${booking._id}`)}
                            className="w-full py-2 bg-[#3A3A6A] text-white rounded-lg text-sm font-medium hover:bg-[#3A3A6A]/90 transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </button>
                        )}
                        
                        {ride.status === 'completed' && booking.status === 'completed' && !booking.hasRated?.driver && (
                          <button 
                            onClick={() => setRatingModal({ open: true, booking, rating: 0, comment: '' })}
                            className="w-full py-2 bg-[#E63399] text-white rounded-lg text-sm font-medium hover:bg-[#E63399]/90 transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="h-4 w-4" />
                            Rate Passenger
                          </button>
                        )}
                        
                        <button 
                          onClick={() => navigate(`/profile/${booking.passengerId?._id}`)}
                          className="px-3 py-2 border border-[#3A3A6A] text-[#3A3A6A] rounded-lg text-sm font-medium hover:bg-[#3A3A6A] hover:text-white transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/driver/dashboard')}
                  className="w-full py-3 border border-[#3A3A6A] text-[#3A3A6A] rounded-xl font-medium hover:bg-[#3A3A6A] hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/driver/rides')}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  My Rides
                </button>
                <button 
                  onClick={() => navigate(`/driver/edit-ride/${ride._id}`)}
                  className="w-full py-3 bg-[#E63399] text-white rounded-xl font-medium hover:bg-[#E63399]/90 transition-colors"
                >
                  Edit This Ride
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, booking: null, rating: 0, comment: '' })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Rate Passenger</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">How was your experience with {ratingModal.booking?.passengerId?.name}?</p>
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
              className="w-full py-3 bg-[#E63399] text-white rounded-xl font-semibold hover:bg-[#E63399]/90 disabled:opacity-50 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}