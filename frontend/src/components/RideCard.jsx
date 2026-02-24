import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Star, ArrowRight, Users, Car, Shield, Phone, Clock, MapPin, Snowflake, Music, Package } from 'lucide-react';

export default function RideCard({ ride, onBook }) {
  const navigate = useNavigate();
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}/)) {
      return timeStr;
    }
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFullyBooked = ride.status === 'fully_booked';
  const rating = ride.driverId?.rating?.average || 0;
  const reviewCount = ride.driverId?.rating?.count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all duration-300 hover:shadow-lg border-0 shadow-md ${isFullyBooked ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Driver Photo */}
          <div className="flex-shrink-0 flex md:block justify-center">
            <Avatar className="w-16 h-16">
              <AvatarImage src={ride.driverId?.profilePhoto} className="object-cover" />
              <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                {ride.driverId?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Driver Info with Badges */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 truncate mobile-text">{ride.driverId?.name}</h4>
              <div className="flex gap-2 flex-wrap">
                {ride.driverId?.isPhoneVerified && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    <Phone className="w-3 h-3 mr-1" />Verified
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />ID Verified
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
              )}
            </div>

            {/* Route */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-400 hidden md:block" />
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-lg text-gray-900 mobile-text">{ride.from}</span>
                <ArrowRight className="w-5 h-5 text-blue-500 hidden md:block" />
                <div className="md:hidden text-center text-gray-400">↓</div>
                <span className="font-semibold text-lg text-gray-900 mobile-text">{ride.to}</span>
              </div>
            </div>

            {/* Time, Duration, Price */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 mobile-text">{formatTime(ride.departureTime)}</span>
              </div>
              <div className="text-sm text-gray-600 mobile-text">{formatDate(ride.date)}</div>
              <div className="font-bold text-xl text-green-600">₹{ride.pricePerSeat}</div>
            </div>

            {/* Vehicle and Seats */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 capitalize mobile-text">
                  {ride.vehicle?.type || ride.driverId?.vehicle?.type || 'Car'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 mobile-text">{ride.availableSeats} seats available</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {ride.preferences?.airConditioning !== false && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Snowflake className="w-4 h-4 text-blue-400" />
                  <span>AC</span>
                </div>
              )}
              {ride.preferences?.musicAllowed && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Music</span>
                </div>
              )}
              {ride.luggageAllowance && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Package className="w-4 h-4 text-orange-400" />
                  <span>Luggage</span>
                </div>
              )}
            </div>
          </div>

          {/* Book Now Button */}
          <div className="flex-shrink-0 flex flex-col justify-center w-full md:w-auto">
            {isFullyBooked ? (
              <Badge variant="secondary" className="bg-gray-200 text-gray-600 px-4 py-2 w-full md:w-auto text-center">
                Fully Booked
              </Badge>
            ) : (
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 touch-target w-full md:w-auto mobile-text"
                onClick={() => navigate(`/rides/${ride._id}`)}
              >
                Book Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}