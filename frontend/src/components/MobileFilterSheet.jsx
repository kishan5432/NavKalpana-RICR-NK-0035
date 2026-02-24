import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Star, X, Filter } from 'lucide-react';

export default function MobileFilterSheet({ 
  filters, 
  updateFilters, 
  getActiveFilterCount, 
  clearAllFilters,
  isOpen,
  onClose 
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="bottom-sheet-overlay"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="bottom-sheet animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold mobile-text">Filters</h2>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="rounded-full">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                Clear all
              </Button>
            )}
            <button 
              onClick={onClose}
              className="touch-target p-2 -m-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-6">
          <div>
            <Label htmlFor="mobile-from" className="mobile-text">From</Label>
            <Input
              id="mobile-from"
              value={filters.from}
              onChange={(e) => updateFilters({ from: e.target.value })}
              placeholder="Departure city"
              className="touch-target mobile-text"
            />
          </div>
          
          <div>
            <Label htmlFor="mobile-to" className="mobile-text">To</Label>
            <Input
              id="mobile-to"
              value={filters.to}
              onChange={(e) => updateFilters({ to: e.target.value })}
              placeholder="Destination city"
              className="touch-target mobile-text"
            />
          </div>
          
          <div>
            <Label htmlFor="mobile-date" className="mobile-text">Date</Label>
            <Input
              id="mobile-date"
              type="date"
              value={filters.date}
              onChange={(e) => updateFilters({ date: e.target.value })}
              className="touch-target mobile-text"
            />
          </div>
          
          <div>
            <Label htmlFor="mobile-seats" className="mobile-text">Seats needed</Label>
            <select
              id="mobile-seats"
              value={filters.seats}
              onChange={(e) => updateFilters({ seats: e.target.value })}
              className="w-full p-3 border rounded-md touch-target mobile-text"
            >
              <option value="1">1 seat</option>
              <option value="2">2 seats</option>
              <option value="3">3 seats</option>
              <option value="4">4 seats</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="mobile-text">Price Range</Label>
              <span className="text-sm text-gray-600">₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</span>
            </div>
            <Slider
              min={0}
              max={10000}
              step={50}
              value={filters.priceRange}
              onValueChange={(value) => updateFilters({ priceRange: value })}
            />
          </div>

          <div>
            <Label htmlFor="mobile-departureTime" className="mobile-text">Departure Time</Label>
            <select
              id="mobile-departureTime"
              value={filters.departureTime}
              onChange={(e) => updateFilters({ departureTime: e.target.value })}
              className="w-full p-3 border rounded-md touch-target mobile-text"
            >
              <option value="">Any time</option>
              <option value="morning">Morning (6AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 6PM)</option>
              <option value="evening">Evening (6PM - 12AM)</option>
              <option value="night">Night (12AM - 6AM)</option>
            </select>
          </div>

          <div>
            <Label className="mb-3 block mobile-text">Minimum Rating</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilters({ minRating: rating === filters.minRating ? 0 : rating })}
                  className="p-2 hover:scale-110 transition-transform touch-target"
                >
                  <Star
                    className={`h-8 w-8 ${rating <= filters.minRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="mobile-vehicleType" className="mobile-text">Vehicle Type</Label>
            <select
              id="mobile-vehicleType"
              value={filters.vehicleType}
              onChange={(e) => updateFilters({ vehicleType: e.target.value })}
              className="w-full p-3 border rounded-md touch-target mobile-text"
            >
              <option value="">All vehicles</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="van">Van</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="mobile-sortBy" className="mobile-text">Sort by</Label>
            <select
              id="mobile-sortBy"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="w-full p-3 border rounded-md touch-target mobile-text"
            >
              <option value="departureTime">Departure Time</option>
              <option value="pricePerSeat">Price</option>
              <option value="createdAt">Latest</option>
            </select>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={onClose}
              className="w-full touch-target mobile-text"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}