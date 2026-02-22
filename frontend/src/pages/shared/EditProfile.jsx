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
import { Camera } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={formData.profilePhoto} />
                <AvatarFallback className="text-3xl">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
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
            {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          {isDriver && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle.make">Make</Label>
                  <Input
                    id="vehicle.make"
                    name="vehicle.make"
                    value={formData.vehicle.make}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle.model">Model</Label>
                  <Input
                    id="vehicle.model"
                    name="vehicle.model"
                    value={formData.vehicle.model}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle.color">Color</Label>
                  <Input
                    id="vehicle.color"
                    name="vehicle.color"
                    value={formData.vehicle.color}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle.licensePlate">License Plate</Label>
                  <Input
                    id="vehicle.licensePlate"
                    name="vehicle.licensePlate"
                    value={formData.vehicle.licensePlate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle.year">Year</Label>
                  <Input
                    id="vehicle.year"
                    name="vehicle.year"
                    type="number"
                    value={formData.vehicle.year}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
