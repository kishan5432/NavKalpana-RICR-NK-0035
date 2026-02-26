import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createRide, getPriceSuggestion } from '../../api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Plus, X, Car, Settings, Route, Lightbulb } from 'lucide-react';

export default function CreateRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [distanceKm, setDistanceKm] = useState(100);
  const [manualDistance, setManualDistance] = useState(false);

  const calculateDistance = async (from, to) => {
    if (!from || !to) return;
    
    try {
      // Simple city-to-city distance estimation (can be replaced with geocoding API)
      // For now, use a basic estimate: 100km default
      setDistanceKm(100);
    } catch (error) {
      console.error('Distance calculation failed:', error);
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
      
      // Auto-calculate distance when from or to changes
      if (name === 'from' || name === 'to') {
        const newFrom = name === 'from' ? value : formData.from;
        const newTo = name === 'to' ? value : formData.to;
        if (newFrom && newTo) {
          calculateDistance(newFrom, newTo);
        }
      }
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
    const { from, to, date, departureTime, pricePerSeat } = formData;
    if (!from || !to || !date || !departureTime || !pricePerSeat) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      toast.error('Date cannot be in the past');
      return false;
    }
    return true;
  };

  const handleGetPriceSuggestion = async () => {
    const { from, to, date } = formData;
    
    if (!from || !to || !date) {
      toast.error('Please fill in from, to, and date first');
      return;
    }

    setLoadingSuggestion(true);
    try {
      const result = await getPriceSuggestion({
        from_location: from,
        to_location: to,
        ride_date: date,
        distance_km: distanceKm
      });
      setPriceSuggestion(result);
    } catch (error) {
      toast.error('Failed to get price suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createRide(formData);
      toast.success('Ride created successfully!');
      navigate('/driver/rides');
    } catch (error) {
      toast.error('Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFD400] via-[#FFC400] to-[#E6B800] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Plus className="h-6 w-6 text-[#FFD400]" />
              </div>
              <h1 className="text-3xl font-bold text-[#111111]">Create New Ride</h1>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 40" className="w-full h-[40px]" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,20 Q180,40 360,20 T720,20 T1080,20 T1440,20 L1440,40 L0,40 Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Sticky Image */}
          <div className="hidden lg:flex justify-center items-center sticky top-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD400]/20 to-[#E6B800]/20 rounded-3xl blur-2xl transform rotate-3"></div>
              <img 
                src="https://res.cloudinary.com/dse13zdp7/image/upload/v1771953356/WhatsApp_Image_2026-02-24_at_22.44.48_vuze12.jpg"
                alt="Create Ride"
                className="relative z-10 w-full max-w-xl h-[500px] object-cover rounded-3xl transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FFD400]/30 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#E6B800]/30 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Information */}
          <Card className="bg-white shadow-lg rounded-2xl border-2 border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                  <MapPin className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-[#111111]">Route Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="from" className="text-sm font-medium text-gray-700 mb-2 block">
                    From *
                  </Label>
                  <Input
                    id="from"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="Enter pickup location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to" className="text-sm font-medium text-gray-700 mb-2 block">
                    To *
                  </Label>
                  <Input
                    id="to"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="Enter destination"
                    required
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
                    className="h-12 px-6 bg-[#111111] hover:bg-[#222222] text-white rounded-xl shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.optionalStops.map((stop, index) => (
                    <span key={index} className="bg-[#FFD400]/20 border border-[#FFD400] px-3 py-2 rounded-full text-sm font-medium text-[#111111] flex items-center gap-2">
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
          <Card className="bg-white shadow-lg rounded-2xl border-2 border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-[#111111]">Schedule & Pricing</h2>
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
                    Available Seats *
                  </Label>
                  <Input
                    id="totalSeats"
                    name="totalSeats"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="Number of seats"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerSeat" className="text-sm font-medium text-gray-700 mb-2 block">
                    Price per Seat (₹) *
                  </Label>
                  <div className="space-y-2">
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
                    <Button
                      type="button"
                      onClick={handleGetPriceSuggestion}
                      disabled={loadingSuggestion}
                      variant="outline"
                      className="w-full h-10 border-[#111111] text-[#111111] hover:bg-[#FFD400] hover:text-[#111111] hover:border-[#FFD400]"
                    >
                      {loadingSuggestion ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Get Price Suggestion
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Label htmlFor="distanceKm" className="text-xs text-gray-600">Estimated Distance (km):</Label>
                      <Input
                        id="distanceKm"
                        type="number"
                        min="1"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                        className="h-8 w-24 text-sm"
                      />
                    </div>
                    {priceSuggestion && (
                      <div className="p-3 bg-[#FFD400]/10 border border-[#FFD400] rounded-lg">
                        <p className="text-sm text-[#111111]">
                          <span className="font-semibold">Recommended price range:</span> ₹{priceSuggestion.suggested_min} – ₹{priceSuggestion.suggested_max} based on similar routes.
                        </p>
                        <p className="text-xs text-[#4F4F4F] mt-1">
                          Demand: {priceSuggestion.demand_level} • Based on {priceSuggestion.based_on_routes} completed routes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Settings */}
          <Card className="bg-white shadow-lg rounded-2xl border-2 border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                  <Settings className="h-5 w-5 text-[#111111]" />
                </div>
                <h2 className="text-xl font-bold text-[#111111]">Preferences & Settings</h2>
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚬</span>
                      <div>
                        <p className="font-medium text-[#111111]">Smoking Allowed</p>
                        <p className="text-sm text-[#4F4F4F]">Allow passengers to smoke during the trip</p>
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
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐕</span>
                      <div>
                        <p className="font-medium text-[#111111]">Pets Allowed</p>
                        <p className="text-sm text-[#4F4F4F]">Allow passengers to bring pets</p>
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
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E5E5] hover:border-[#FFD400] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <p className="font-medium text-[#111111]">Music Allowed</p>
                        <p className="text-sm text-[#4F4F4F]">Allow music during the journey</p>
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
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-14 px-12 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111111] mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Route className="h-5 w-5 mr-2" />
                      Create Ride
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}