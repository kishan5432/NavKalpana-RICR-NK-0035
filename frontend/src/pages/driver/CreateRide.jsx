import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createRide } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';

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
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/driver/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Ride</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From *</Label>
                <Input
                  id="from"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Optional Stops</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={stopInput}
                  onChange={(e) => setStopInput(e.target.value)}
                  placeholder="Add a stop"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                />
                <Button type="button" onClick={addStop}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.optionalStops.map((stop, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {stop}
                    <button type="button" onClick={() => removeStop(index)} className="ml-2 text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="departureTime">Departure Time *</Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalSeats">Total Seats *</Label>
                <Input
                  id="totalSeats"
                  name="totalSeats"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePerSeat">Price per Seat (₹) *</Label>
                <Input
                  id="pricePerSeat"
                  name="pricePerSeat"
                  type="number"
                  min="0"
                  value={formData.pricePerSeat}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="luggageAllowance">Luggage Allowance</Label>
              <select
                id="luggageAllowance"
                name="luggageAllowance"
                value={formData.luggageAllowance}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <Label>Preferences</Label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.smokingAllowed"
                    checked={formData.preferences.smokingAllowed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Smoking allowed
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.petsAllowed"
                    checked={formData.preferences.petsAllowed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Pets allowed
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.musicAllowed"
                    checked={formData.preferences.musicAllowed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Music allowed
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ride'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}