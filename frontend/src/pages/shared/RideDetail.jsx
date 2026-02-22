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
import { Star } from 'lucide-react';

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
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    fetchRide();
  }, [id]);

  useEffect(() => {
    if (user && ride) {
      fetchUserBooking();
    }
  }, [user, ride]);

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
      if (response.ride.status === 'completed') {
        const ratingsData = await getUserRatings(response.ride.driverId._id);
        setRatings(ratingsData.ratings || []);
        
        if (user) {
          const bookingsData = await getMyBookings();
          const booking = bookingsData.bookings?.find(
            b => b.rideId?._id === id && b.passengerId?._id === user._id && b.status === 'completed'
          );
          setUserBooking(booking);
        }
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

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBooking(true);
    try {
      await createBooking({
        rideId: ride._id,
        seatsBooked: selectedSeats
      });
      toast.success('Booking successful!');
      navigate('/passenger/bookings');
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
  const canBook = user && !isOwner && ride?.status === 'active' && ride?.availableSeats > 0;

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
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ride Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {ride.from} → {ride.to}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant={ride.status === 'active' ? 'default' : 'secondary'}>
                    {ride.status}
                  </Badge>
                  {ride.status === 'fully_booked' && (
                    <Badge variant="secondary">Fully Booked</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Journey Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Departure:</span>
                      <p className="font-medium">{formatDateTime(ride.date, ride.departureTime)}</p>
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
                </div>

                {ride.stops && ride.stops.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Stops</h3>
                    <div className="space-y-1">
                      {ride.stops.map((stop, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {stop}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Vehicle & Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {ride.vehicle && (
                      <Badge variant="outline">
                        🚗 {ride.vehicle.make} {ride.vehicle.model}
                      </Badge>
                    )}
                    {ride.preferences?.noSmoking && (
                      <Badge variant="outline">🚭 No Smoking</Badge>
                    )}
                    {ride.preferences?.petsAllowed && (
                      <Badge variant="outline">🐾 Pets Allowed</Badge>
                    )}
                    {ride.preferences?.musicAllowed && (
                      <Badge variant="outline">🎵 Music OK</Badge>
                    )}
                    <Badge variant="outline">🧳 Luggage Space</Badge>
                  </div>
                </div>

                {ride.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Additional Info</h3>
                    <p className="text-gray-700">{ride.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Driver & Booking */}
          <div className="space-y-6">
            {/* Driver Card */}
            <Card>
              <CardHeader>
                <CardTitle>Driver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate(`/profile/${ride.driverId?._id}`)}>
                  <Avatar size="lg">
                    <AvatarImage src={ride.driverId?.profilePhoto} />
                    <AvatarFallback>{ride.driverId?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold hover:text-blue-600">{ride.driverId?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>★ {ride.driverId?.rating?.average?.toFixed(1) || 'New'}</span>
                      {ride.driverId?.isPhoneVerified && (
                        <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {ride.driverId?.bio && (
                  <p className="text-sm text-gray-700 mb-3">{ride.driverId.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Booking Widget */}
            {canBook && !userBooking && (
              <Card>
                <CardHeader>
                  <CardTitle>Book This Ride</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of seats
                    </label>
                    <select
                      value={selectedSeats}
                      onChange={(e) => setSelectedSeats(Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    >
                      {[...Array(Math.min(4, ride.availableSeats))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} seat{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span>Price per seat:</span>
                      <span>₹{ride.pricePerSeat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Seats:</span>
                      <span>{selectedSeats}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{ride.pricePerSeat * selectedSeats}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleBooking}
                    disabled={booking}
                  >
                    {booking ? 'Booking...' : 'Book Now'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Booking Status for Passenger */}
            {userBooking && ['requested', 'accepted'].includes(userBooking.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Status:</span>
                      <Badge className={userBooking.status === 'requested' ? 'bg-yellow-500' : 'bg-green-500'}>
                        {userBooking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Seats booked:</span>
                      <span>{userBooking.seatsBooked}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total paid:</span>
                      <span>₹{userBooking.totalPrice}</span>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Ride</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Edit Ride
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Cancel Ride
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Login Prompt */}
            {!user && (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="mb-4">Login to book this ride</p>
                  <Button onClick={() => navigate('/login')}>
                    Login
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ratings Section for Completed Rides */}
            {ride.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  {ratings.length === 0 ? (
                    <p className="text-gray-500 text-sm">No ratings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {ratings.slice(0, 3).map((rating) => (
                        <div key={rating._id} className="border-b pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{rating.raterId?.name || 'Anonymous'}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {rating.comment && <p className="text-xs text-gray-600">{rating.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isOwner && user && userBooking && !userBooking.hasRated?.passenger && (
                    <Button 
                      size="sm" 
                      className="w-full mt-3" 
                      onClick={() => setRatingModal({ open: true, rating: 0, comment: '' })}
                    >
                      Rate this driver
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={ratingModal.open} onOpenChange={(open) => !open && setRatingModal({ open: false, rating: 0, comment: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Driver</DialogTitle>
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