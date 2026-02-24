import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
    </motion.div>
  );
};

export const ButtonSpinner = ({ className = '' }) => (
  <LoadingSpinner size="sm" className={`text-white ${className}`} />
);