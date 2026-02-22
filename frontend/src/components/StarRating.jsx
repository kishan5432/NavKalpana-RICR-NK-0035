import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readonly = false, count }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.round(value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } ${!readonly && 'cursor-pointer hover:text-yellow-400'}`}
          onClick={() => handleClick(star)}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {value.toFixed(1)} {count && `(${count} ratings)`}
      </span>
    </div>
  );
};

export default StarRating;
