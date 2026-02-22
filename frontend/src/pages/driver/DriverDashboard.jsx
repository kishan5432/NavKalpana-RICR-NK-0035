import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyPostedRides, startRide, completeRide } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalEarnings: 0,
    upcomingRides: [],
    inProgressRides: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ridesData = await getMyPostedRides();
      const rides = ridesData.rides || [];
      
      const calculatedStats = {
        totalRides: rides.length,
        activeRides: rides.filter(r => r.status === 'active').length,
        completedRides: rides.filter(r => r.status === 'completed').length,
        cancelledRides: rides.filter(r => r.status === 'cancelled').length,
        totalEarnings: rides
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + (r.pricePerSeat * (r.totalSeats - r.availableSeats)), 0),
        upcomingRides: rides
          .filter(r => ['active', 'fully_booked'].includes(r.status) && new Date(r.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5),
        inProgressRides: rides.filter(r => r.status === 'in_progress')
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      await startRide(rideId);
      toast.success('Ride started!');
      fetchData();
    } catch (error) {
      toast.error('Failed to start ride');
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      toast.success('Ride completed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete ride');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-500',
      started: 'bg-blue-500',
      fully_booked: 'bg-blue-500',
      cancelled: 'bg-red-500',
      completed: 'bg-gray-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Rides Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeRides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completedRides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{stats.totalEarnings}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancelled Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledRides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalRides > 0 ? Math.round((stats.completedRides / stats.totalRides) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button onClick={() => navigate('/post-ride')} className="h-20">Post New Ride</Button>
        <Button onClick={() => navigate('/driver/rides')} variant="outline" className="h-20">View My Rides</Button>
        <Button onClick={() => navigate('/driver/bookings')} variant="outline" className="h-20">View Booking Requests</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rides</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingRides.length === 0 ? (
            <p className="text-gray-500">No upcoming rides</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingRides.map((ride) => (
                <div 
                  key={ride._id} 
                  className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/driver/rides/${ride._id}`)}
                >
                  <div>
                    <p className="font-semibold">{ride.from} → {ride.to}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}
                    </p>
                    <p className="text-sm text-green-600">₹{ride.pricePerSeat} per seat</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm">{ride.availableSeats}/{ride.totalSeats} seats</span>
                    {getStatusBadge(ride.status)}
                    {ride.status === 'active' && (
                      <Button size="sm" onClick={() => handleStartRide(ride._id)}>
                        Start Ride
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {stats.inProgressRides.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>In Progress Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.inProgressRides.map((ride) => (
                <div 
                  key={ride._id} 
                  className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/driver/rides/${ride._id}`)}
                >
                  <div>
                    <p className="font-semibold">{ride.from} → {ride.to}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}
                    </p>
                    <p className="text-sm text-green-600">₹{ride.pricePerSeat} per seat</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm">{ride.availableSeats}/{ride.totalSeats} seats</span>
                    {getStatusBadge(ride.status)}
                    <Button size="sm" onClick={() => handleCompleteRide(ride._id)}>
                      Complete Ride
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
