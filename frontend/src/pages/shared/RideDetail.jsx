import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getRideById, createBooking } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);

  useEffect(() => {
    fetchRide();
  }, [id]);

  const fetchRide = async () => {
    try {
      const response = await getRideById(id);
      setRide(response.ride);
    } catch (error) {
      console.error('Error fetching ride:', error);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                      <p className="font-medium">{formatDateTime(ride.departureTime)}</p>
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
                <div className="flex items-center gap-3 mb-4">
                  <Avatar size="lg">
                    <AvatarImage src={ride.driverId?.profilePicture} />
                    <AvatarFallback>{ride.driverId?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{ride.driverId?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>★ {ride.driverId?.rating?.average || 'New'}</span>
                      {ride.driverId?.isPhoneVerified && (
                        <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {ride.driverId?.bio && (
                  <p className="text-sm text-gray-700 mb-3">{ride.driverId.bio}</p>
                )}
                
                <div className="text-xs text-gray-500">
                  Member since {new Date(ride.driverId?.createdAt).getFullYear()}
                </div>
              </CardContent>
            </Card>

            {/* Booking Widget */}
            {canBook && (
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
          </div>
        </div>
      </div>
    </div>
  );
}