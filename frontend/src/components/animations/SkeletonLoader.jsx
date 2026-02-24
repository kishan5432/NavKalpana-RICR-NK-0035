import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg shadow-md p-4 md:p-6"
  >
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-shrink-0 flex md:block justify-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
          </div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
        </div>
        
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full md:w-24" />
      </div>
    </div>
  </motion.div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);