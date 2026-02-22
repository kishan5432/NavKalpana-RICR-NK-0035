import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRides } from '../../api';
import RideCard from '../../components/RideCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function SearchRides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
    seats: searchParams.get('seats') || '1',
    minPrice: '',
    maxPrice: '',
    departureTime: '',
    sortBy: 'departureTime'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        departureTime: filters.departureTime,
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
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white rounded-lg border p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  value={filters.from}
                  onChange={(e) => updateFilters({ from: e.target.value })}
                  placeholder="Departure city"
                />
              </div>
              
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={filters.to}
                  onChange={(e) => updateFilters({ to: e.target.value })}
                  placeholder="Destination city"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => updateFilters({ date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="seats">Seats needed</Label>
                <select
                  id="seats"
                  value={filters.seats}
                  onChange={(e) => updateFilters({ seats: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1">1 seat</option>
                  <option value="2">2 seats</option>
                  <option value="3">3 seats</option>
                  <option value="4">4 seats</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    placeholder="₹0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    placeholder="₹1000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="sortBy">Sort by</Label>
                <select
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="departureTime">Departure Time</option>
                  <option value="pricePerSeat">Price</option>
                  <option value="createdAt">Latest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">
                {filters.from && filters.to 
                  ? `${filters.from} to ${filters.to}` 
                  : 'Search Rides'
                }
              </h1>
              {!loading && (
                <p className="text-gray-600">{rides.length} rides found</p>
              )}
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : rides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
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
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}