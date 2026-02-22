import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyPostedRides, cancelRide, completeRide } from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function MyPostedRides() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, statusFilter, dateFilter]);

  const fetchRides = async () => {
    try {
      const data = await getMyPostedRides();
      setRides(data.rides || []);
    } catch (error) {
      toast.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    let filtered = rides;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ride => ride.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.date);
        return rideDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredRides(filtered);
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await cancelRide(id);
      const updatedRides = rides.map(r => r._id === id ? { ...r, status: 'cancelled' } : r);
      setRides(updatedRides);
      toast.success('Ride cancelled');
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this ride as completed?')) return;
    try {
      await completeRide(id);
      const updatedRides = rides.map(r => r._id === id ? { ...r, status: 'completed' } : r);
      setRides(updatedRides);
      toast.success('Ride marked as completed');
    } catch (error) {
      toast.error('Failed to complete ride');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-500 text-white',
      fully_booked: 'bg-orange-500 text-white',
      in_progress: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
      completed: 'bg-gray-500 text-white'
    };
    return <Badge className={colors[status] || 'bg-gray-500 text-white'}>{status}</Badge>;
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/driver/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Posted Rides</h1>
        </div>
        <Button onClick={() => navigate('/post-ride')}>Post New Ride</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="fully_booked">Fully Booked</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-48"
          placeholder="Filter by date"
        />
        
        {(statusFilter !== 'all' || dateFilter) && (
          <Button variant="outline" onClick={() => { setStatusFilter('all'); setDateFilter(''); }}>
            Clear Filters
          </Button>
        )}
      </div>

      {filteredRides.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {rides.length === 0 ? 'No rides posted yet' : 'No rides match the selected filters'}
          </p>
          {rides.length === 0 && (
            <Button onClick={() => navigate('/post-ride')}>Post Your First Ride</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRides.map((ride) => (
            <Card key={ride._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/driver/rides/${ride._id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{ride.from} → {ride.to}</h3>
                      {getStatusBadge(ride.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}</p>
                      <p>👥 {ride.availableSeats}/{ride.totalSeats} seats available</p>
                      <p>💰 ₹{ride.pricePerSeat} per seat</p>
                      {ride.optionalStops?.length > 0 && (
                        <p>🛑 Stops: {ride.optionalStops.join(', ')}</p>
                      )}
                    </div>

                    {ride.preferences && (
                      <div className="flex gap-2 mt-2">
                        {ride.preferences.smokingAllowed && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🚬 Smoking OK</span>}
                        {ride.preferences.petsAllowed && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🐕 Pets OK</span>}
                        {ride.preferences.musicAllowed && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🎵 Music OK</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/driver/bookings?rideId=${ride._id}`)}
                    >
                      View Bookings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}