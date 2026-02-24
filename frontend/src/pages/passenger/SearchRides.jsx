import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRides } from '../../api';
import RideCard from '../../components/RideCard';
import MobileFilterSheet from '../../components/MobileFilterSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Star, X, Car, Clock, MapPin, Filter, SlidersHorizontal } from 'lucide-react';

export default function SearchRides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
    seats: searchParams.get('seats') || '1',
    priceRange: [0, 10000],
    departureTime: '',
    minRating: 0,
    vehicleType: '',
    sortBy: 'departureTime'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchRides();
  }, [searchParams, page]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = {
        from: filters.from,
        to: filters.to,
        date: filters.date,
        seats: filters.seats,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        departureTime: filters.departureTime,
        minRating: filters.minRating,
        vehicleType: filters.vehicleType,
        sortBy: filters.sortBy,
        page,
        limit: 10
      };
      
      const response = await getRides(params);
      setRides(response.rides || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.departureTime) count++;
    if (filters.minRating > 0) count++;
    if (filters.vehicleType) count++;
    return count;
  };

  const clearAllFilters = () => {
    const cleared = {
      ...filters,
      priceRange: [0, 10000],
      departureTime: '',
      minRating: 0,
      vehicleType: ''
    };
    setFilters(cleared);
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.date) params.set('date', filters.date);
    if (filters.seats) params.set('seats', filters.seats);
    setSearchParams(params);
    setPage(1);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
    setPage(1);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Header */}
      <div className="bg-gradient-to-r from-[#3A2A5A] to-[#2d1f47] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">
            {filters.from && filters.to 
              ? `${filters.from} → ${filters.to}` 
              : 'Find Your Perfect Ride'
            }
          </h1>
          
          {/* Quick Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                value={filters.from}
                onChange={(e) => updateFilters({ from: e.target.value })}
                placeholder="From"
                className="bg-white text-gray-900 h-12"
              />
              <Input
                value={filters.to}
                onChange={(e) => updateFilters({ to: e.target.value })}
                placeholder="To"
                className="bg-white text-gray-900 h-12"
              />
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => updateFilters({ date: e.target.value })}
                className="bg-white text-gray-900 h-12"
              />
              <Button onClick={fetchRides} className="h-12 bg-[#EC3399] hover:bg-[#d62d88]">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Button 
            onClick={() => setShowMobileFilters(true)}
            variant="outline" 
            className="w-full h-12 flex items-center gap-2 border-[#3A2A5A] text-[#3A2A5A]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-auto bg-[#EC3399]">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-80 h-fit sticky top-6">
            <div className="bg-white rounded-lg shadow-lg border-0 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-[#3A2A5A]" />
                  <h2 className="text-lg font-semibold text-[#3A2A5A]">Filters</h2>
                  {getActiveFilterCount() > 0 && (
                    <Badge className="bg-[#EC3399]">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </div>
                {getActiveFilterCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs text-[#EC3399] hover:text-[#d62d88]">
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="space-y-5">
                <div>
                  <Label htmlFor="seats" className="text-[#3A2A5A]">Seats needed</Label>
                  <select
                    id="seats"
                    value={filters.seats}
                    onChange={(e) => updateFilters({ seats: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="1">1 seat</option>
                    <option value="2">2 seats</option>
                    <option value="3">3 seats</option>
                    <option value="4">4 seats</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-[#3A2A5A]">Price Range</Label>
                    <span className="text-sm text-[#EC3399] font-medium">₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</span>
                  </div>
                  <Slider
                    min={0}
                    max={10000}
                    step={50}
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilters({ priceRange: value })}
                    className="[&_[role=slider]]:bg-[#EC3399] [&_[role=slider]]:border-[#EC3399]"
                  />
                </div>

                <div>
                  <Label htmlFor="departureTime" className="text-[#3A2A5A]">Departure Time</Label>
                  <select
                    id="departureTime"
                    value={filters.departureTime}
                    onChange={(e) => updateFilters({ departureTime: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 12AM)</option>
                    <option value="night">Night (12AM - 6AM)</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block text-[#3A2A5A]">Minimum Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => updateFilters({ minRating: rating === filters.minRating ? 0 : rating })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${rating <= filters.minRating ? 'fill-[#EC3399] text-[#EC3399]' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="vehicleType" className="text-[#3A2A5A]">Vehicle Type</Label>
                  <select
                    id="vehicleType"
                    value={filters.vehicleType}
                    onChange={(e) => updateFilters({ vehicleType: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="">All vehicles</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="sortBy" className="text-[#3A2A5A]">Sort by</Label>
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="departureTime">Departure Time</option>
                    <option value="pricePerSeat">Price</option>
                    <option value="createdAt">Latest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                {!loading && (
                  <p className="text-gray-600">
                    <span className="font-semibold text-[#3A2A5A]">{rides.length}</span> rides found
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : rides.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg border-0 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <Car className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-[#3A2A5A] mb-2">No rides found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any rides matching your criteria</p>
                <div className="space-y-3 text-sm text-left max-w-md mx-auto bg-pink-50 p-4 rounded-lg border border-pink-100">
                  <p className="font-medium text-[#3A2A5A]">Try these suggestions:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-[#EC3399]" />
                      <span>Check your departure and destination cities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-[#EC3399]" />
                      <span>Try different dates or times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-4 w-4 mt-0.5 text-[#EC3399]" />
                      <span>Remove some filters to see more results</span>
                    </li>
                  </ul>
                </div>
                {getActiveFilterCount() > 0 && (
                  <Button onClick={clearAllFilters} className="mt-6 bg-[#EC3399] hover:bg-[#d62d88]">
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <RideCard key={ride._id} ride={ride} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm flex items-center">
                  Page <span className="font-semibold text-[#EC3399] mx-1">{page}</span> of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-[#3A2A5A] text-[#3A2A5A] hover:bg-[#3A2A5A] hover:text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        filters={filters}
        updateFilters={updateFilters}
        getActiveFilterCount={getActiveFilterCount}
        clearAllFilters={clearAllFilters}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />
    </div>
  );
}