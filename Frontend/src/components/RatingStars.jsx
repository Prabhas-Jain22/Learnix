import React, { useState } from 'react';

const RatingStars = ({ rating = 0, onRate = null, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={readonly}
            className={`text-2xl transition-all ${
              star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-600">
        {displayRating > 0 ? `${displayRating.toFixed(1)}/5` : 'No rating'}
      </span>
    </div>
  );
};

export default RatingStars;
