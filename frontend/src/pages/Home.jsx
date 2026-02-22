import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    seats: '1'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      date: searchData.date,
      seats: searchData.seats
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Travel Together, Save Together
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Find shared rides or offer your empty seats
          </p>

          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  name="from"
                  placeholder="From"
                  value={searchData.from}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="to"
                  placeholder="To"
                  value={searchData.to}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="date"
                  type="date"
                  value={searchData.date}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="seats"
                  type="number"
                  min="1"
                  max="8"
                  placeholder="Seats"
                  value={searchData.seats}
                  onChange={handleChange}
                />
                <Button type="submit" className="flex items-center justify-center">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Post a Ride</h3>
                <p className="text-gray-600">
                  Drivers list available seats for their planned trips
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Find a Ride</h3>
                <p className="text-gray-600">
                  Passengers search and book rides that match their needs
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Travel & Rate</h3>
                <p className="text-gray-600">
                  Complete trips safely and build trust through ratings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600">Rides</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">4.8★</div>
              <div className="text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}