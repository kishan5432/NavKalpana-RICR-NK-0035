import { Car } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#3A2A5A] via-[#4A3A6A] to-[#EC3399] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Car className="h-10 w-10 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
        </div>
        
        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-white mb-2">NavKalpana</h1>
        <p className="text-white/80 text-lg">Loading your journey...</p>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}