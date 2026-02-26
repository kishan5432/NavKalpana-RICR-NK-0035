import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getRideById, updateRide } from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Plus, X, Car, Settings, Route, Edit } from 'lucide-react';

export default function EditRide() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    optionalStops: [],
    date: '',
    departureTime: '',
    totalSeats: 1,
    pricePerSeat: '',
    luggageAllowance: 'none',
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      musicAllowed: false
    }
  });
  const [stopInput, setStopInput] = useState('');

  useEffect(() => {
    fetchRideData();
  }, [id]);

  const fetchRideData = async () => {
    try {
      const response = await getRideById(id);
      const ride = response.ride;
      
      setFormData({
        from: ride.from || '',
        to: ride.to || '',
        optionalStops: ride.stops || [],
        date: ride.date ? ride.date.split('T')[0] : '',
        departureTime: ride.departureTime || '',
        totalSeats: ride.totalSeats || 1,
        pricePerSeat: ride.pricePerSeat || '',
        luggageAllowance: ride.luggageAllowance || 'none',
        preferences: {
          smokingAllowed: ride.preferences?.smoking || false,
          petsAllowed: ride.preferences?.pets || false,
          musicAllowed: ride.preferences?.music || false
        }
      });
    } catch (error) {
      toast.error('Failed to load ride data');
      navigate('/driver/dashboard');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [prefKey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const addStop = () => {
    if (stopInput.trim()) {
      setFormData(prev => ({
        ...prev,
        optionalStops: [...prev.optionalStops, stopInput.trim()]
      }));
      setStopInput('');
    }
  };

  const removeStop = (index) => {
    setFormData(prev => ({
      ...prev,
      optionalStops: prev.optionalStops.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const { date, departureTime, pricePerSeat } = formData;
    if (!date || !departureTime || !pricePerSeat) {
      toast.error('Please fill all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        stops: formData.optionalStops,
        preferences: {
          smoking: formData.preferences.smokingAllowed,
          pets: formData.preferences.petsAllowed,
          music: formData.preferences.musicAllowed
        }
      };
      delete updateData.optionalStops;
      
      await updateRide(id, updateData);
      toast.success('Ride updated successfully!');
      navigate(`/driver/rides/${id}`);
    } catch (error) {
      toast.error('Failed to update ride');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#111111]">Loading ride data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#FFD400] via-[#FFC400] to-[#E6B800] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(`/driver/rides/${id}`)}
              variant="ghost"
              size="sm"
              className="text-[#111111] hover:bg-black/10 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center">
                <Edit className="h-6 w-6 text-[#FFD400]" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111111]">Edit Ride</h1>
            </div>
          </div>
          
          <p className="text-[#111111]/90 text-lg max-w-2xl">
            Update your ride details and preferences
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Route Information */}
          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Route Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="from" className="text-sm font-medium text-gray-700 mb-2 block">
                    From (Cannot be changed)
                  </Label>
                  <Input
                    id="from"
                    name="from"
                    value={formData.from}
                    className="h-12 rounded-xl border-gray-200 bg-gray-100 text-gray-600"
                    placeholder="Enter pickup location"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="to" className="text-sm font-medium text-gray-700 mb-2 block">
                    To (Cannot be changed)
                  </Label>
                  <Input
                    id="to"
                    name="to"
                    value={formData.to}
                    className="h-12 rounded-xl border-gray-200 bg-gray-100 text-gray-600"
                    placeholder="Enter destination"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Optional Stops
                </Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={stopInput}
                    onChange={(e) => setStopInput(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="Add a stop along the way"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                  />
                  <Button 
                    type="button" 
                    onClick={addStop}
                    className="h-12 px-6 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] rounded-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.optionalStops.map((stop, index) => (
                    <span key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">
                      {stop}
                      <button 
                        type="button" 
                        onClick={() => removeStop(index)} 
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Pricing */}
          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Schedule & Pricing</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="departureTime" className="text-sm font-medium text-gray-700 mb-2 block">
                    Departure Time *
                  </Label>
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Label htmlFor="totalSeats" className="text-sm font-medium text-gray-700 mb-2 block">
                    Total Seats (Cannot be changed)
                  </Label>
                  <Input
                    id="totalSeats"
                    name="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    className="h-12 rounded-xl border-gray-200 bg-gray-100 text-gray-600"
                    placeholder="Number of seats"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerSeat" className="text-sm font-medium text-gray-700 mb-2 block">
                    Price per Seat (₹) *
                  </Label>
                  <Input
                    id="pricePerSeat"
                    name="pricePerSeat"
                    type="number"
                    min="0"
                    value={formData.pricePerSeat}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="Enter price per seat"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Settings */}
          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center">
                  <Settings className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Preferences & Settings</h2>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="luggageAllowance" className="text-sm font-medium text-gray-700 mb-2 block">
                  Luggage Allowance
                </Label>
                <Select value={formData.luggageAllowance} onValueChange={(value) => setFormData(prev => ({ ...prev, luggageAllowance: value }))}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]">
                    <SelectValue placeholder="Select luggage allowance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Luggage</SelectItem>
                    <SelectItem value="small">Small Bag Only</SelectItem>
                    <SelectItem value="large">Large Luggage Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  Travel Preferences
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚬</span>
                      <div>
                        <p className="font-medium text-gray-900">Smoking Allowed</p>
                        <p className="text-sm text-gray-600">Allow passengers to smoke during the trip</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.preferences.smokingAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, smokingAllowed: checked }
                      }))}
                      className="data-[state=checked]:bg-[#FFD400] data-[state=checked]:border-[#FFD400]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐕</span>
                      <div>
                        <p className="font-medium text-gray-900">Pets Allowed</p>
                        <p className="text-sm text-gray-600">Allow passengers to bring pets</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.preferences.petsAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, petsAllowed: checked }
                      }))}
                      className="data-[state=checked]:bg-[#FFD400] data-[state=checked]:border-[#FFD400]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <p className="font-medium text-gray-900">Music Allowed</p>
                        <p className="text-sm text-gray-600">Allow music during the journey</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.preferences.musicAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, musicAllowed: checked }
                      }))}
                      className="data-[state=checked]:bg-[#FFD400] data-[state=checked]:border-[#FFD400]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-14 px-12 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111111] mr-3"></div>
                  Updating Ride...
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5 mr-3" />
                  Update Ride
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}