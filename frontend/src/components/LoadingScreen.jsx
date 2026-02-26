import { Car } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#FFD400] via-[#FFC400] to-[#E6B800] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#111111]/20 flex items-center justify-center animate-pulse">
            <Car className="h-10 w-10 text-[#111111] animate-bounce" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-[#111111]/30 border-t-[#111111] animate-spin"></div>
        </div>
        
        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-[#111111] mb-2">RideShareX</h1>
        <p className="text-[#111111]/80 text-lg">Loading your journey...</p>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-[#111111]/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#111111]/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#111111]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}