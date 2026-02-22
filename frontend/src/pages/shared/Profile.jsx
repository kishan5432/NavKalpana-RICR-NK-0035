import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserRatings } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import StarRating from '../../components/StarRating';
import { CheckCircle, Car } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const isOwn = id === 'me' || id === currentUser._id;
    setIsOwnProfile(isOwn);

    const userId = isOwn ? currentUser._id : id;

    if (isOwn) {
      setProfile(currentUser);
    } else {
      getUserById(userId).then(data => setProfile(data.user)).catch(err => console.error(err));
    }

    getUserRatings(userId).then(data => setRatings(data.ratings || [])).catch(err => console.error(err));
  }, [id, currentUser]);

  if (!profile) return <div className="p-4">Loading...</div>;

  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + (r.stars || r.rating || 0), 0) / ratings.length 
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <img src={profile.profilePhoto || '/default-avatar.png'} alt={profile.name} />
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {profile.isPhoneVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
              {profile.isEmailVerified && <CheckCircle className="h-5 w-5 text-blue-500" />}
            </div>
            <Badge className="mb-2">{profile.role}</Badge>
            <StarRating value={avgRating} count={ratings.length} readonly />
            {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
            <p className="text-sm text-gray-500 mt-2">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate('/profile/edit')} className="mt-4">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {(profile.role === 'driver' || profile.role === 'both') && profile.vehicle && (
          <Card className="mt-6 p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-5 w-5" />
              <h3 className="font-semibold">Vehicle Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Make:</span> {profile.vehicle.make}</div>
              <div><span className="font-medium">Model:</span> {profile.vehicle.model}</div>
              <div><span className="font-medium">Color:</span> {profile.vehicle.color}</div>
              <div><span className="font-medium">Plate:</span> {profile.vehicle.licensePlate}</div>
              {profile.vehicle.year && <div><span className="font-medium">Year:</span> {profile.vehicle.year}</div>}
            </div>
          </Card>
        )}

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-4">Ratings</h3>
          {ratings.length === 0 ? (
            <p className="text-gray-500">No ratings yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <Card key={rating._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{rating.raterId?.name || 'Anonymous'}</p>
                      <StarRating value={rating.stars || rating.rating || 0} readonly />
                      {rating.comment && <p className="mt-2 text-gray-700">{rating.comment}</p>}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
