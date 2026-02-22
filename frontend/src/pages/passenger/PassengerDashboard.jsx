import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyBookings } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Search } from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalTrips = bookings.filter(b => b.status === 'completed').length;
  const upcomingTrips = bookings.filter(b => ['requested', 'accepted'].includes(b.status)).length;
  const myRating = typeof user?.rating === 'object' ? user.rating.average || 'N/A' : user?.rating || 'N/A';

  const upcomingBookings = bookings
    .filter(b => ['requested', 'accepted'].includes(b.status))
    .slice(0, 2);

  const recentBookings = bookings.slice(0, 3);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Passenger Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Trips Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">My Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">⭐ {myRating}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/search')}>
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for rides..."
                className="flex-1 outline-none"
                readOnly
              />
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Button 
              className="w-full h-12" 
              variant="outline"
              onClick={() => navigate('/passenger/bookings')}
            >
              View Booking History
            </Button>
          </CardContent>
        </Card>
      </div>

      {upcomingBookings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Upcoming Trips</h2>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={booking.driverId?.profilePhoto} />
                        <AvatarFallback>{booking.driverId?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {booking.rideId?.from} → {booking.rideId?.to}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.rideId?.date).toLocaleDateString()} • {booking.rideId?.departureTime}
                        </p>
                        <p className="text-sm text-gray-600">Driver: {booking.driverId?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      {booking.status === 'accepted' && (
                        <Button size="sm" onClick={() => navigate(`/chat/${booking._id}`)}>
                          Message Driver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <Button variant="link" onClick={() => navigate('/passenger/bookings')}>
            View All
          </Button>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {booking.rideId?.from} → {booking.rideId?.to}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.rideId?.date).toLocaleDateString()} • ₹{booking.totalPrice}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
