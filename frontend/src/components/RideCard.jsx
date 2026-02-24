import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Star, ArrowRight, Users, Car, Shield, Phone, Clock, MapPin, Snowflake, Music, Package, Calendar } from 'lucide-react';

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
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all duration-300 hover:shadow-2xl border-2 border-gray-100 hover:border-[#3A2A5A]/20 shadow-lg bg-white ${isFullyBooked ? 'opacity-60' : ''}`}>
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Driver Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarImage src={ride.driverId?.profilePhoto} className="object-cover" />
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-[#3A2A5A] to-[#EC3399] text-white">
                  {ride.driverId?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {ride.driverId?.isPhoneVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border border-white">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Driver Info & Rating */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-base text-gray-800">{ride.driverId?.name}</h4>
              {ride.driverId?.isPhoneVerified && (
                <Badge className="bg-green-500 text-white font-medium px-1.5 py-0.5 text-xs">
                  VERIFIED
                </Badge>
              )}
              <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm ml-auto">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-700">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              </div>
            </div>

            {/* Route */}
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 mb-2 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-700" />
                <span className="font-semibold text-sm text-gray-800">{ride.from}</span>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <span className="font-semibold text-sm text-gray-800">{ride.to}</span>
              </div>
            </div>

            {/* Details & Amenities */}
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                <Clock className="w-3 h-3 text-gray-700 inline mr-1" />
                Departure: {formatTime(ride.departureTime)}
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                <Calendar className="w-3 h-3 text-gray-700 inline mr-1" />
                Date: {formatDate(ride.date)}
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                <Users className="w-3 h-3 text-gray-700 inline mr-1" />
                {ride.availableSeats} seats available
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                <Car className="w-3 h-3 text-gray-700 inline mr-1" />
                {ride.vehicle?.type || ride.driverId?.vehicle?.type || 'Car'}
              </div>
              {ride.preferences?.airConditioning !== false && (
                <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                  <Snowflake className="w-3 h-3 text-gray-700 inline mr-1" />
                  AC Available
                </div>
              )}
              {ride.preferences?.musicAllowed && (
                <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                  <Music className="w-3 h-3 text-gray-700 inline mr-1" />
                  Music Allowed
                </div>
              )}
              {ride.luggageAllowance && (
                <div className="bg-white/70 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                  <Package className="w-3 h-3 text-gray-700 inline mr-1" />
                  Luggage Allowed
                </div>
              )}
            </div>
          </div>

          {/* Price and Book Button */}
          <div className="flex-shrink-0 flex flex-col items-end justify-between">
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">₹{ride.pricePerSeat}</div>
              <div className="text-xs text-gray-600">per seat</div>
            </div>
            
            {isFullyBooked ? (
              <Badge className="bg-gray-500 text-white px-3 py-1.5 font-medium rounded text-xs">
                BOOKED
              </Badge>
            ) : (
              <Button 
                className="bg-[#3A2A5A] hover:bg-[#2d1f47] text-white font-semibold px-4 py-1.5 rounded text-xs transition-all duration-200"
                onClick={() => navigate(`/rides/${ride._id}`)}
              >
                BOOK NOW
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}