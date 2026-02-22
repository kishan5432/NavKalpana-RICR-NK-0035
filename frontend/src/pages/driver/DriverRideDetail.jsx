import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getRideById, getMyBookings, startRide, completeRide, cancelRide, acceptBooking, rejectBooking, submitRating } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Star } from 'lucide-react';

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
      active: 'bg-green-500',
      in_progress: 'bg-blue-500',
      fully_booked: 'bg-orange-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500',
      requested: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!ride) return <div className="p-4">Ride not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ride Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{ride.from} → {ride.to}</CardTitle>
                  <Badge className={getStatusColor(ride.status)}>{ride.status}</Badge>
                </div>
                <div className="flex gap-2">
                  {(ride.status === 'active' || ride.status === 'fully_booked') && (
                    <>
                      <Button onClick={handleStartRide}>Start Ride</Button>
                      <Button variant="destructive" onClick={handleCancelRide}>Cancel Ride</Button>
                    </>
                  )}
                  {(ride.status === 'started' || ride.status === 'in_progress') && (
                    <Button onClick={handleCompleteRide}>Complete Ride</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="font-medium">{new Date(ride.departureTime).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Price per seat:</span>
                  <p className="font-medium text-green-600">₹{ride.pricePerSeat}</p>
                </div>
                <div>
                  <span className="text-gray-600">Available seats:</span>
                  <p className="font-medium">{ride.availableSeats} of {ride.totalSeats}</p>
                </div>
                <div>
                  <span className="text-gray-600">Distance:</span>
                  <p className="font-medium">{ride.distance || 'N/A'} km</p>
                </div>
              </div>

              {ride.stops && ride.stops.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Stops</h3>
                  <div className="space-y-1">
                    {ride.stops.map((stop, index) => (
                      <div key={index} className="text-sm text-gray-600">• {stop}</div>
                    ))}
                  </div>
                </div>
              )}

              {ride.preferences && (
                <div>
                  <h3 className="font-semibold mb-2">Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {ride.preferences.noSmoking && <Badge variant="outline">🚭 No Smoking</Badge>}
                    {ride.preferences.petsAllowed && <Badge variant="outline">🐾 Pets Allowed</Badge>}
                    {ride.preferences.musicAllowed && <Badge variant="outline">🎵 Music OK</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-gray-500">No booking requests</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar size="sm">
                          <AvatarImage src={booking.passengerId?.profilePhoto} />
                          <AvatarFallback>{booking.passengerId?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{booking.passengerId?.name}</p>
                          <p className="text-sm text-gray-600">
                            {booking.seatsBooked} seat(s) • ₹{booking.totalPrice}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      
                      {booking.status === 'requested' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptBooking(booking._id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectBooking(booking._id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'accepted' && (
                        <Button size="sm" onClick={() => navigate(`/chat/${booking._id}`)}>
                          Message
                        </Button>
                      )}
                      
                      {ride.status === 'completed' && booking.status === 'completed' && !booking.hasRated?.driver && (
                        <Button size="sm" onClick={() => setRatingModal({ open: true, booking, rating: 0, comment: '' })}>
                          Rate Passenger
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, booking: null, rating: 0, comment: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Passenger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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