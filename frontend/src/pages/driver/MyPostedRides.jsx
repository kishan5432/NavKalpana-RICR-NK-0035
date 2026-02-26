import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyPostedRides, cancelRide, completeRide } from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Plus, Filter, X, CheckCircle, AlertCircle, Car, Route } from 'lucide-react';

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
    const statusConfig = {
      active: { color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', icon: <CheckCircle className="h-4 w-4" /> },
      fully_booked: { color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white', icon: <Users className="h-4 w-4" /> },
      in_progress: { color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white', icon: <Car className="h-4 w-4" /> },
      cancelled: { color: 'bg-gradient-to-r from-red-500 to-red-600 text-white', icon: <X className="h-4 w-4" /> },
      completed: { color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white', icon: <CheckCircle className="h-4 w-4" /> }
    };
    const config = statusConfig[status] || { color: 'bg-gray-500 text-white', icon: <AlertCircle className="h-4 w-4" /> };
    return (
      <Badge className={`${config.color} px-3 py-1 rounded-full flex items-center gap-2 font-medium`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#FFD400] via-[#FFC400] to-[#E6B800] overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/driver/dashboard')}
                variant="ghost"
                size="sm"
                className="text-[#111111] hover:bg-[#111111]/10 rounded-full w-10 h-10 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center shadow-lg">
                  <Route className="h-6 w-6 text-[#FFD400]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#111111]">My Posted Rides</h1>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/post-ride')}
              className="bg-[#111111] hover:bg-[#222222] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Ride
            </Button>
          </div>
          
          <p className="text-[#4F4F4F] text-lg max-w-2xl">
            Manage your posted rides and track passenger bookings
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
        {/* Filters */}
        <Card className="mb-8 bg-white shadow-lg rounded-2xl border-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FFD400] flex items-center justify-center">
                <Filter className="h-4 w-4 text-[#111111]" />
              </div>
              <h2 className="text-lg font-bold text-[#111111]">Filter Rides</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]">
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
                className="w-48 h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                placeholder="Filter by date"
              />
              
              {(statusFilter !== 'all' || dateFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
                  className="h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {filteredRides.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-lg rounded-2xl border-0">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
              <Route className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {rides.length === 0 ? 'No rides posted yet' : 'No rides match the selected filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {rides.length === 0 
                ? 'Start by posting your first ride to connect with passengers' 
                : 'Try adjusting your filters to see more rides'
              }
            </p>
            {rides.length === 0 && (
              <Button 
                onClick={() => navigate('/post-ride')}
                className="bg-[#FFD400] hover:bg-[#FFC400] text-[#111111]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Ride
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRides.map((ride) => (
              <Card 
                key={ride._id} 
                className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/driver/rides/${ride._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                          <MapPin className="h-6 w-6 text-[#111111]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {ride.from} → {ride.to}
                          </h3>
                          {getStatusBadge(ride.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(ride.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{ride.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{ride.availableSeats}/{ride.totalSeats} seats</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-semibold">₹{ride.pricePerSeat}/seat</span>
                        </div>
                      </div>
                      
                      {ride.optionalStops?.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Stops:</span> {ride.optionalStops.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {ride.preferences && (
                        <div className="flex flex-wrap gap-2">
                          {ride.preferences.smokingAllowed && (
                            <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full text-gray-700 font-medium">
                              🚬 Smoking OK
                            </span>
                          )}
                          {ride.preferences.petsAllowed && (
                            <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full text-gray-700 font-medium">
                              🐕 Pets OK
                            </span>
                          )}
                          {ride.preferences.musicAllowed && (
                            <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full text-gray-700 font-medium">
                              🎵 Music OK
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => navigate(`/driver/bookings?rideId=${ride._id}`)}
                        className="bg-[#111111] hover:bg-[#222222] text-white font-semibold rounded-xl"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Bookings
                      </Button>
                      
                      {ride.status === 'active' && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancel(ride._id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Ride
                        </Button>
                      )}
                      
                      {ride.status === 'in_progress' && (
                        <Button
                          onClick={() => handleComplete(ride._id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
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