import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyBookings, cancelBooking, submitRating } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Star, ArrowLeft, Calendar, MapPin, Users, Clock, MessageCircle, X, CheckCircle, AlertCircle, History } from 'lucide-react';
import StarRating from '../../components/StarRating';

export default function BookingHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null, rating: 0, comment: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      const passengerBookings = (data.bookings || []).filter(b => b.passengerId?._id === user?._id);
      setBookings(passengerBookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error('Failed to cancel booking');
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
        ratedUserId: ratingModal.booking.driverId._id,
        rating: ratingModal.rating,
        comment: ratingModal.comment
      });
      setBookings(bookings.map(b => 
        b._id === ratingModal.booking._id ? { ...b, hasRated: { ...b.hasRated, passenger: true } } : b
      ));
      setRatingModal({ open: false, booking: null, rating: 0, comment: '' });
      toast.success('Rating submitted');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const filterBookings = () => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'upcoming') return bookings.filter(b => ['requested', 'accepted'].includes(b.status));
    if (activeTab === 'completed') return bookings.filter(b => b.status === 'completed');
    if (activeTab === 'cancelled') return bookings.filter(b => ['cancelled', 'rejected'].includes(b.status));
    return bookings;
  };

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
      accepted: <CheckCircle className="h-4 w-4" />,
      rejected: <X className="h-4 w-4" />,
      cancelled: <X className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const filteredBookings = filterBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#3A2A5A] via-[#4A3A6A] to-[#EC3399] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/passenger/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <History className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">My Bookings</h1>
            </div>
          </div>
          
          <p className="text-white/90 text-lg max-w-2xl">
            Track all your ride bookings and manage your travel history
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
        {/* Tabs */}
        <Card className="mb-8 bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => ['requested', 'accepted'].includes(b.status)).length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.key 
                      ? 'bg-[#EC3399] text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-lg rounded-2xl border-0">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
              <History className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet. Start exploring rides!</p>
            <Button 
              onClick={() => navigate('/search')} 
              className="bg-[#EC3399] hover:bg-[#d62d88] text-white"
            >
              Find Rides
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card 
                key={booking._id} 
                className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/rides/${booking.rideId?._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Driver Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                          <AvatarImage src={booking.driverId?.profilePhoto} />
                          <AvatarFallback className="bg-gradient-to-r from-[#3A2A5A] to-[#EC3399] text-white text-lg font-semibold">
                            {booking.driverId?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{booking.driverId?.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating value={booking.driverId?.rating?.average || 0} readonly size="sm" />
                          <span className="text-sm text-gray-600">({booking.driverId?.rating?.count || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {booking.rideId?.from} → {booking.rideId?.to}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.rideId?.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{booking.rideId?.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{booking.seatsBooked} seat(s)</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Total Paid:</span> ₹{booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <Badge className={`${getStatusColor(booking.status)} px-3 py-1 rounded-full flex items-center gap-2 font-medium`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {booking.status === 'requested' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCancel(booking._id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'accepted' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => navigate(`/chat/${booking._id}`)}
                              className="bg-[#EC3399] hover:bg-[#d62d88] text-white"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCancel(booking._id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'completed' && !booking.hasRated?.passenger && (
                          <Button 
                            size="sm" 
                            onClick={() => setRatingModal({ open: true, booking, rating: 0, comment: '' })}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate Trip
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, booking: null, rating: 0, comment: '' })}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center text-gray-900">Rate Your Trip</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-2">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={ratingModal.booking?.driverId?.profilePhoto} />
                  <AvatarFallback className="bg-gradient-to-r from-[#3A2A5A] to-[#EC3399] text-white text-2xl font-bold">
                    {ratingModal.booking?.driverId?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-900">{ratingModal.booking?.driverId?.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {ratingModal.booking?.rideId?.from} → {ratingModal.booking?.rideId?.to}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-700 mb-4 font-medium">How was your experience?</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-10 h-10 cursor-pointer transition-all hover:scale-110 ${
                        star <= ratingModal.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                      onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                    />
                  ))}
                </div>
              </div>
              
              <Textarea
                placeholder="Share your experience with other travelers (optional)"
                value={ratingModal.comment}
                onChange={(e) => setRatingModal({ ...ratingModal, comment: e.target.value })}
                className="rounded-xl border-gray-200 focus:border-[#EC3399] focus:ring-[#EC3399] resize-none"
                rows={3}
              />
              
              <Button 
                className="w-full h-12 bg-[#EC3399] hover:bg-[#d62d88] text-white font-semibold rounded-xl" 
                onClick={handleRatingSubmit}
              >
                Submit Rating
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
