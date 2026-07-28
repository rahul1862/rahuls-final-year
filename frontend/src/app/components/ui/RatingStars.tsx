import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviews?: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

export function RatingStars({ rating, reviews, size = 'sm', showValue = false }: RatingStarsProps) {
  const starClass = SIZE_CLASSES[size];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={starClass}
            style={{
              color: i < Math.round(rating) ? 'var(--badge-limited)' : 'var(--border-strong)',
              fill: i < Math.round(rating) ? 'var(--badge-limited)' : 'none',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-foreground">{rating}</span>}
      {typeof reviews === 'number' && (
        <span className="text-xs text-muted-foreground">({reviews.toLocaleString()})</span>
      )}
    </div>
  );
}
