import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users, Shield, Quote, Apple, Play } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#3A2A5A] via-[#4A3A6A] to-[#EC3399] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Its simple, quick, and cheap way to<br />commute together.
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Connect with people who need to travel with you. Grow your network.
              </p>
              
              {/* Search Form */}
              <Card className="shadow-2xl rounded-2xl">
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="from"
                        placeholder="Pickup Location"
                        value={searchData.from}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                      <Input
                        name="to"
                        placeholder="Drop-off Location"
                        value={searchData.to}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        name="date"
                        type="date"
                        value={searchData.date}
                        onChange={handleChange}
                        className="h-12"
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
                        className="h-12"
                      />
                      <Button type="submit" className="h-12 font-semibold bg-[#EC3399] hover:bg-[#d62d88]">
                        <Search className="mr-2 h-5 w-5" />
                        Search
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Image */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src="https://res.cloudinary.com/dse13zdp7/image/upload/v1771946796/enhance_igj9byy1f8qm6jigo2kf_myexh0.png"
                alt="Woman creating account"
                className="w-full max-w-lg lg:max-w-xl rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 120" className="w-full h-[60px]" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,60 Q360,120 720,60 T1440,60 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-6">
                <Clock className="h-8 w-8 text-[#EC3399]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Save Time & Money</h3>
              <p className="text-gray-600">
                Save significantly on your commute cost and avoid paying our commission fees.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-6">
                <Users className="h-8 w-8 text-[#EC3399]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Meet New People</h3>
              <p className="text-gray-600">
                Grow your network organically by meeting amazing new people daily.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-6">
                <Shield className="h-8 w-8 text-[#EC3399]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Safe and Secure</h3>
              <p className="text-gray-600">
                We have introduced a safety feature to make sure you have a safe experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Loved <span className="text-[#EC3399]">by customers</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Card className="relative">
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-700 mb-6">
                  Made my life easy. No more waiting for cabs and buses. Great way to have company and cut costs. I'm a big need to have friends to talk to when you are doing a long journey.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                  <div>
                    <div className="font-bold">Nishant Sharma</div>
                    <div className="text-sm text-gray-500">Delhi</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-gray-700 mb-6">
                  Amazing experience! The platform is easy to use and I've met some wonderful people during my commutes. Highly recommended for daily travelers.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                  <div>
                    <div className="font-bold">Priya Patel</div>
                    <div className="text-sm text-gray-500">Mumbai</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Here's where you can get it from.
            </h2>
            <p className="text-gray-800 mb-8">
              Now open to Carpoolers, Bikers and Supports. Grow your network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-black hover:bg-gray-800 text-white h-14 px-8 rounded-lg">
                <Play className="mr-2 h-5 w-5" />
                GET IT ON Google Play
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white h-14 px-8 rounded-lg">
                <Apple className="mr-2 h-5 w-5" />
                Download on the App Store
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}