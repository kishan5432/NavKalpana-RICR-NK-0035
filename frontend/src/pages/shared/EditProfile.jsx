import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMe, uploadProfilePhoto } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Camera, User, Car, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || '',
    vehicle: {
      make: user?.vehicle?.make || '',
      model: user?.vehicle?.model || '',
      color: user?.vehicle?.color || '',
      licensePlate: user?.vehicle?.licensePlate || '',
      year: user?.vehicle?.year || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicle: { ...prev.vehicle, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await uploadProfilePhoto(formData);
      setFormData(prev => ({ ...prev, profilePhoto: response.profilePicture }));
      setUser(response.user);
      toast.success('Photo uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateMe(formData);
      setUser(response.user);
      toast.success('Profile updated successfully!');
      navigate('/profile/me');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const isDriver = user?.role === 'driver' || user?.role === 'both';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#FFD400] via-[#FFC400] to-[#E6B800] overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="text-[#111111] hover:bg-[#111111]/10 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#111111]">Edit Profile</h1>
          </div>
          
          {/* Profile Photo Section */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white p-2 shadow-2xl">
                <Avatar className="w-full h-full">
                  <AvatarImage src={formData.profilePhoto} className="rounded-full" />
                  <AvatarFallback className="text-3xl bg-gray-100">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <label 
                htmlFor="photo-upload" 
                className="absolute -bottom-2 -right-2 bg-[#111111] hover:bg-[#222222] text-white p-3 rounded-full cursor-pointer shadow-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          {uploading && (
            <p className="text-center text-[#4F4F4F] mt-4">Uploading photo...</p>
          )}
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
          {/* Personal Information */}
          <Card className="p-8 bg-white shadow-lg rounded-2xl border-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-[#111111]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400] resize-none"
                  placeholder="Tell us about yourself, your interests, and what makes you a great travel companion..."
                />
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          {isDriver && (
            <Card className="p-8 bg-white shadow-lg rounded-2xl border-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center shadow-md">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vehicle.make" className="text-sm font-medium text-gray-700 mb-2 block">
                    Make
                  </Label>
                  <Input
                    id="vehicle.make"
                    name="vehicle.make"
                    value={formData.vehicle.make}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="e.g., Toyota, Honda"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicle.model" className="text-sm font-medium text-gray-700 mb-2 block">
                    Model
                  </Label>
                  <Input
                    id="vehicle.model"
                    name="vehicle.model"
                    value={formData.vehicle.model}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="e.g., Camry, Civic"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicle.year" className="text-sm font-medium text-gray-700 mb-2 block">
                    Year
                  </Label>
                  <Input
                    id="vehicle.year"
                    name="vehicle.year"
                    type="number"
                    value={formData.vehicle.year}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="e.g., 2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicle.color" className="text-sm font-medium text-gray-700 mb-2 block">
                    Color
                  </Label>
                  <Input
                    id="vehicle.color"
                    name="vehicle.color"
                    value={formData.vehicle.color}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="e.g., White, Black"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="vehicle.licensePlate" className="text-sm font-medium text-gray-700 mb-2 block">
                    License Plate
                  </Label>
                  <Input
                    id="vehicle.licensePlate"
                    name="vehicle.licensePlate"
                    value={formData.vehicle.licensePlate}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]"
                    placeholder="e.g., ABC-1234"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              type="submit" 
              className="h-12 bg-[#FFD400] hover:bg-[#FFC400] text-[#111111] font-semibold rounded-xl flex items-center justify-center gap-2 flex-1"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
