import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export default function RideCard({ ride, onBook }) {
  const navigate = useNavigate();
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFullyBooked = ride.status === 'fully_booked';

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isFullyBooked ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Route and Date/Time */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {ride.from} → {ride.to}
            </h3>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{formatDate(ride.departureTime)}</div>
            <div>{formatTime(ride.departureTime)}</div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="sm">
            <AvatarImage src={ride.driver?.profilePicture} />
            <AvatarFallback>{ride.driver?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-medium">{ride.driver?.name}</span>
            <span className="text-yellow-500">★ {typeof ride.driver?.rating === 'object' ? ride.driver.rating.average || 'New' : ride.driver?.rating || 'New'}</span>
            {ride.driver?.isPhoneVerified && (
              <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
            )}
          </div>
        </div>

        {/* Seats, Price, Luggage */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <span>{ride.availableSeats} seats</span>
          <span className="font-semibold text-green-600">₹{ride.pricePerSeat}/seat</span>
          <span>🧳</span>
        </div>

        {/* Preferences */}
        <div className="flex gap-2 mb-4">
          {ride.preferences?.noSmoking && (
            <Badge variant="outline" className="text-xs">🚭 No Smoking</Badge>
          )}
          {ride.preferences?.petsAllowed && (
            <Badge variant="outline" className="text-xs">🐾 Pets OK</Badge>
          )}
          {ride.preferences?.musicAllowed && (
            <Badge variant="outline" className="text-xs">🎵 Music</Badge>
          )}
        </div>

        {/* Status and Action */}
        <div className="flex justify-between items-center">
          {isFullyBooked && (
            <Badge variant="secondary" className="bg-gray-200 text-gray-600">
              Fully Booked
            </Badge>
          )}
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/rides/${ride._id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}