import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Check, ChevronRight, Users, Star, Shield, Phone, Clock, MapPin, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';

export default function BookingFlow({ ride, onBook, loading, userBooking, onCancelBooking, onMessageDriver }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState(1);

  // Set step based on booking status
  useEffect(() => {
    if (userBooking && ['requested', 'accepted'].includes(userBooking.status)) {
      setCurrentStep(3);
      setSelectedSeats(userBooking.seatsBooked);
    } else {
      setCurrentStep(1);
    }
  }, [userBooking]);

  const steps = [
    { id: 1, title: 'Select Seats', icon: Users },
    { id: 2, title: 'Review', icon: Check },
    { id: 3, title: 'Confirmed', icon: CheckCircle }
  ];

  // Memoize expensive calculations
  const priceCalculations = useMemo(() => {
    const totalPrice = ride.pricePerSeat * selectedSeats;
    const serviceFee = Math.round(totalPrice * 0.05);
    const finalTotal = totalPrice + serviceFee;
    return { totalPrice, serviceFee, finalTotal };
  }, [ride.pricePerSeat, selectedSeats]);

  const { totalPrice, serviceFee, finalTotal } = priceCalculations;

  const handleContinue = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      onBook({ seatsBooked: selectedSeats });
      setCurrentStep(3);
    }
  }, [currentStep, selectedSeats, onBook]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
            currentStep >= step.id 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.id ? (
              <Check className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {step.title}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-300 mx-4" />
          )}
        </div>
      ))}
    </div>
  );

  const SeatSelector = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select number of seats</h3>
      
      {/* Visual Seats Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[...Array(Math.min(8, ride.totalSeats))].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs ${
                i < selectedSeats
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : i < ride.availableSeats
                  ? 'bg-white border-gray-300 text-gray-600'
                  : 'bg-red-100 border-red-300 text-red-600'
              }`}
            >
              {i < selectedSeats ? '✓' : i < ride.availableSeats ? i + 1 : 'X'}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Available: {ride.availableSeats} | Selected: {selectedSeats}
        </p>
      </div>

      {/* Seat Counter */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
          disabled={selectedSeats <= 1}
        >
          -
        </Button>
        <div className="text-center">
          <div className="text-2xl font-bold">{selectedSeats}</div>
          <div className="text-sm text-gray-500">Seat{selectedSeats > 1 ? 's' : ''}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedSeats(Math.min(ride.availableSeats, selectedSeats + 1))}
          disabled={selectedSeats >= ride.availableSeats}
        >
          +
        </Button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-lg font-semibold text-blue-800">
          Total: ₹{ride.pricePerSeat * selectedSeats}
        </div>
        <div className="text-sm text-blue-600">
          ₹{ride.pricePerSeat} per seat
        </div>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex justify-between">
          <span>Route:</span>
          <span className="font-medium">{ride.from} → {ride.to}</span>
        </div>
        <div className="flex justify-between">
          <span>Date & Time:</span>
          <span className="font-medium">{new Date(ride.date).toLocaleDateString()} at {ride.departureTime}</span>
        </div>
        <div className="flex justify-between">
          <span>Seats:</span>
          <span className="font-medium">{selectedSeats}</span>
        </div>
        <div className="flex justify-between">
          <span>Driver:</span>
          <span className="font-medium">{ride.driverId?.name}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total Amount:</span>
          <span className="text-green-600">₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );

  const ConfirmedStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-green-600">Ride Booked Successfully!</h3>
        <p className="text-gray-600">Your booking request has been sent to the driver</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium">Booking Status:</span>
          <Badge className={userBooking?.status === 'requested' ? 'bg-yellow-500' : userBooking?.status === 'accepted' ? 'bg-green-500' : 'bg-blue-500'}>
            {userBooking?.status || 'Requested'}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Seats booked:</span>
            <span className="font-medium">{userBooking?.seatsBooked || selectedSeats}</span>
          </div>
          <div className="flex justify-between">
            <span>Total amount:</span>
            <span className="font-medium text-green-600">₹{userBooking?.totalPrice || finalTotal}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancelBooking}
          className="flex-1"
        >
          Cancel Ride
        </Button>
        <Button 
          onClick={onMessageDriver}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message Driver
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SeatSelector />;
      case 2:
        return <ReviewStep />;
      case 3:
        return <ConfirmedStep />;
      default:
        return <SeatSelector />;
    }
  };

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle>Book This Ride</CardTitle>
      </CardHeader>
      <CardContent>
        {!userBooking && <StepIndicator />}
        
        <div className="min-h-[400px] transition-all duration-300">
          {renderStepContent()}
        </div>

        <div className="border-t pt-4 mt-6 bg-white">
          {currentStep < 3 && !userBooking && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold text-green-600">₹{finalTotal}</div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {selectedSeats} seat{selectedSeats > 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleContinue}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? 'Processing...' : currentStep === 2 ? 'Confirm Your Booking' : 'Continue'}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}