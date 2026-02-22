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
import { Star } from 'lucide-react';
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
      requested: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-gray-500',
      completed: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const filteredBookings = filterBookings();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Booking History</h1>

      <div className="flex gap-2 mb-6 border-b">
        {['all', 'upcoming', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-500">No bookings found</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate(`/rides/${booking.rideId?._id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={booking.driverId?.profilePhoto} />
                        <AvatarFallback>{booking.driverId?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{booking.driverId?.name}</p>
                        <StarRating value={booking.driverId?.rating?.average || 0} count={booking.driverId?.rating?.count || 0} readonly />
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="font-semibold text-lg">
                        {booking.rideId?.from} → {booking.rideId?.to}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.rideId?.date).toLocaleDateString()} • {booking.rideId?.departureTime}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.seatsBooked} seat(s) • Total paid: ₹{booking.totalPrice}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {booking.status === 'requested' && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancel(booking._id)}>
                          Cancel Booking
                        </Button>
                      )}
                      {booking.status === 'accepted' && (
                        <>
                          <Button size="sm" onClick={() => navigate(`/chat/${booking._id}`)}>
                            Message Driver
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleCancel(booking._id)}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'completed' && !booking.hasRated?.passenger && (
                        <Button size="sm" onClick={() => setRatingModal({ open: true, booking, rating: 0, comment: '' })}>
                          Rate this trip
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

      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, booking: null, rating: 0, comment: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={ratingModal.booking?.driverId?.profilePhoto} />
                <AvatarFallback>{ratingModal.booking?.driverId?.name?.[0]}</AvatarFallback>
              </Avatar>
              <p className="font-semibold">{ratingModal.booking?.driverId?.name}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer ${star <= ratingModal.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                />
              ))}
            </div>
            <Textarea
              placeholder="Add a comment (optional)"
              value={ratingModal.comment}
              onChange={(e) => setRatingModal({ ...ratingModal, comment: e.target.value })}
            />
            <Button className="w-full" onClick={handleRatingSubmit}>
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
