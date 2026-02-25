import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import ReliabilityBadge from './ReliabilityBadge';
import { Sparkles, MapPin, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';

export default function RideRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user && user.role === 'passenger') {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const data = await getRecommendations(user._id);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Fetch recommendations error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'passenger' || error) {
    return null;
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0 mb-6">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="shadow-lg border-0 mb-6">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-[#3A2A5A]">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Search for rides to get personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 mb-6">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div>
          <CardTitle className="flex items-center gap-2 text-[#3A2A5A] mb-1">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
          <p className="text-sm text-gray-600">Based on your travel history</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((ride) => (
            <Card
              key={ride._id}
              className="border-2 hover:border-[#EC3399] hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/rides/${ride._id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ride.driverId?.profilePhoto} />
                      <AvatarFallback className="bg-[#3A2A5A] text-white text-xs">
                        {ride.driverId?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ride.driverId?.name}</p>
                      {ride.driverId?.reliabilityLabel && (
                        <ReliabilityBadge label={ride.driverId.reliabilityLabel} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#3A2A5A]">
                    <MapPin className="h-4 w-4" />
                    <span>{ride.from}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{ride.to}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(ride.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{ride.departureTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[#EC3399] font-bold">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{ride.pricePerSeat}</span>
                  </div>
                  <span className="text-xs text-gray-500">{ride.availableSeats} seats</span>
                </div>

                {ride.recommendationReason && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs w-full justify-center">
                    {ride.recommendationReason}
                  </Badge>
                )}

                <Button
                  className="w-full mt-3 bg-[#3A2A5A] hover:bg-[#2d1f47] text-white"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/rides/${ride._id}`);
                  }}
                >
                  View Ride
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
