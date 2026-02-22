import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyBookings, acceptBooking, rejectBooking } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft } from 'lucide-react';

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/driver/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Booking Requests</h1>
      </div>

      {Object.keys(groupedBookings).length === 0 ? (
        <p className="text-gray-500">No booking requests</p>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedBookings).map(({ ride, bookings }) => (
            <div key={ride._id}>
              <h2 className="text-lg font-semibold mb-3">
                {ride.from} → {ride.to} ({new Date(ride.date).toLocaleDateString()})
              </h2>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/driver/rides/${ride._id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={booking.passengerId?.profilePhoto} />
                            <AvatarFallback>{booking.passengerId?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{booking.passengerId?.name}</p>
                            <p className="text-sm text-gray-600">
                              {booking.seatsBooked} seat(s) • ₹{booking.totalPrice}
                            </p>
                            <Badge className="mt-1">{booking.status}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {booking.status === 'requested' && (
                            <>
                              <Button size="sm" className="bg-green-600" onClick={() => handleAccept(booking._id)}>
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(booking._id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          {booking.status === 'accepted' && (
                            <Button size="sm" onClick={() => navigate(`/chat/${booking._id}`)}>
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
