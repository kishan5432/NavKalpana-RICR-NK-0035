import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserRatings, getMyBookings } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import StarRating from '../../components/StarRating';
import ReliabilityBadge from '../../components/ReliabilityBadge';
import { CheckCircle, Mail, Phone, IdCard, Car, Calendar, Star, MapPin, Settings, Shield, Bell, Eye, Edit3, Award, TrendingUp, Users, Copy, Check } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [tripCount, setTripCount] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    profileVisibility: true
  });

  useEffect(() => {
    if (!currentUser) return;

    const isOwn = id === 'me' || id === currentUser._id;
    setIsOwnProfile(isOwn);

    const userId = isOwn ? currentUser._id : id;

    if (isOwn) {
      setProfile(currentUser);
      // Fetch bookings to calculate completed trips for own profile
      getMyBookings().then(data => {
        const completedTrips = (data.bookings || []).filter(b => b.status === 'completed').length;
        setTripCount(completedTrips);
      }).catch(err => console.error(err));
    } else {
      getUserById(userId).then(data => {
        setProfile(data.user);
        setTripCount(data.user.completedTrips || 0);
      }).catch(err => console.error(err));
    }

    getUserRatings(userId).then(data => setRatings(data.ratings || [])).catch(err => console.error(err));
  }, [id, currentUser]);

  if (!profile) return <div className="p-4">Loading...</div>;

  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + (r.stars || r.rating || 0), 0) / ratings.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header with Gradient */}
      <div className="relative bg-gradient-to-r from-[#FFD400] via-[#FFC400] to-[#E6B800] overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white p-2 shadow-2xl">
                <Avatar className="w-full h-full">
                  <img 
                    src={profile.profilePhoto || '/default-avatar.png'} 
                    alt={profile.name} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </Avatar>
              </div>
              {isOwnProfile && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-[#111111] hover:bg-[#222222] shadow-lg text-white"
                  onClick={() => navigate('/profile/edit')}
                >
                  <Edit3 className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left text-[#111111]">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                <Badge className="bg-[#111111] text-white border-[#111111] hover:bg-[#222222]">
                  {profile.role === 'both' ? 'Driver & Passenger' : profile.role}
                </Badge>
                {profile.reliabilityLabel && (
                  <ReliabilityBadge label={profile.reliabilityLabel} />
                )}
                <div className="flex items-center gap-1 text-[#4F4F4F]">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profile.location || 'Location not set'}</span>
                </div>
              </div>
              {profile.bio && (
                <p className="text-[#4F4F4F] max-w-2xl text-lg leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {/* Dashboard Button */}
              <div className="col-span-3 mb-4">
                <Button
                  onClick={() => navigate(currentUser?.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard')}
                  className="bg-[#111111] hover:bg-[#222222] text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-[#111111]">{tripCount}</div>
                <div className="text-[#4F4F4F] text-sm">Trips</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-[#FFD400] fill-[#FFD400]" />
                  <span className="text-2xl lg:text-3xl font-bold text-[#111111]">{avgRating.toFixed(1)}</span>
                </div>
                <div className="text-[#4F4F4F] text-sm">{ratings.length} Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-[#111111]">
                  {new Date(profile.createdAt).getFullYear()}
                </div>
                <div className="text-[#4F4F4F] text-sm">Since</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 120" className="w-full h-[60px]" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,60 Q360,120 720,60 T1440,60 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Achievement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg rounded-2xl border-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tripCount}</div>
                <div className="text-gray-600 text-sm">Completed Trips</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white shadow-lg rounded-2xl border-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center shadow-md">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                  <Star className="h-5 w-5 text-[#FFD400] fill-[#FFD400]" />
                </div>
                <div className="text-gray-600 text-sm">Average Rating</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-white shadow-lg rounded-2xl border-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{ratings.length}</div>
                <div className="text-gray-600 text-sm">Happy Riders</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Verification Status */}
        <Card className="mb-8 p-6 bg-white shadow-lg rounded-2xl border-0">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Verification Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                profile.isEmailVerified 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gray-300'
              }`}>
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Email</div>
                <div className={`text-sm ${
                  profile.isEmailVerified ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {profile.isEmailVerified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              {profile.isEmailVerified && (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                profile.isPhoneVerified 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gray-300'
              }`}>
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Phone</div>
                <div className={`text-sm ${
                  profile.isPhoneVerified ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {profile.isPhoneVerified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              {profile.isPhoneVerified && (
                <CheckCircle className="h-6 w-6 text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                profile.isIdVerified 
                  ? 'bg-[#FFD400]' 
                  : 'bg-gray-300'
              }`}>
                <IdCard className="h-6 w-6 text-[#111111]" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">ID Document</div>
                <div className={`text-sm ${
                  profile.isIdVerified ? 'text-[#FFD400]' : 'text-gray-500'
                }`}>
                  {profile.isIdVerified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              {profile.isIdVerified && (
                <CheckCircle className="h-6 w-6 text-[#FFD400]" />
              )}
            </div>
          </div>
        </Card>

        {/* Referral Code */}
        {isOwnProfile && profile.referralCode && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-[#FFD400] to-[#E6B800] shadow-lg rounded-2xl border-0">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2 text-[#111111]">Your Referral Code</h3>
              <div className="bg-[#111111]/10 backdrop-blur-sm rounded-xl p-4 inline-block">
                <p className="text-3xl font-bold text-[#111111] tracking-wider">{profile.referralCode}</p>
              </div>
              <p className="text-[#4F4F4F] text-sm mt-3 mb-4">Share this code with friends to earn rewards!</p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(profile.referralCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-[#111111] text-white hover:bg-[#222222] font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs Section */}
        <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
          <Tabs defaultValue="reviews" className="w-full">
            <div className="border-b border-gray-100 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex bg-gray-100 rounded-xl p-1">
                <TabsTrigger 
                  value="reviews" 
                  className="data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm rounded-lg font-medium"
                >
                  Reviews
                </TabsTrigger>
                {(profile.role === 'driver' || profile.role === 'both') && (
                  <TabsTrigger 
                    value="vehicle" 
                    className="data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm rounded-lg font-medium"
                  >
                    Vehicle
                  </TabsTrigger>
                )}
                {isOwnProfile && (
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm rounded-lg font-medium"
                  >
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="p-6 mt-0">
              {ratings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                    <Star className="h-10 w-10 text-[#111111]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Start your first trip to receive reviews from other users</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                          <img 
                            src={rating.raterId?.profilePhoto || '/default-avatar.png'} 
                            alt={rating.raterId?.name} 
                            className="w-full h-full object-cover"
                          />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {rating.raterId?.name || 'Anonymous'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="mb-3">
                            <StarRating value={rating.stars || rating.rating || 0} readonly />
                          </div>
                          {rating.comment && (
                            <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Vehicle Tab */}
            {(profile.role === 'driver' || profile.role === 'both') && (
              <TabsContent value="vehicle" className="p-6 mt-0">
                {profile.vehicle ? (
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                        <Car className="h-6 w-6 text-[#111111]" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Vehicle Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Make</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.make}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Model</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.model}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Year</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.year || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Color</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.color}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">License Plate</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.licensePlate}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Seats</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{profile.vehicle.seats || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                      <Car className="h-10 w-10 text-[#111111]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicle information</h3>
                    <p className="text-gray-500">Add your vehicle details to start offering rides</p>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Settings Tab */}
            {isOwnProfile && (
              <TabsContent value="settings" className="p-6 mt-0">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-[#FFD400] flex items-center justify-center shadow-md">
                      <Settings className="h-6 w-6 text-[#111111]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Notification Settings</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                        className="data-[state=checked]:bg-[#FFD400]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Receive push notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                        className="data-[state=checked]:bg-[#FFD400]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                        className="data-[state=checked]:bg-[#FFD400]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Profile Visibility</h4>
                          <p className="text-sm text-gray-600">Make your profile visible to others</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.profileVisibility}
                        onCheckedChange={(checked) => setSettings({ ...settings, profileVisibility: checked })}
                        className="data-[state=checked]:bg-[#FFD400]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
