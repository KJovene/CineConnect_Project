import { HiStar } from "react-icons/hi2";

export interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
}

export function RatingStars({ rating, max = 5, size = 12 }: RatingStarsProps) {
  return (
    <div className="flex text-amber-400 gap-0.5">
      {[...Array(max)].map((_, i) => (
        <HiStar
          key={i}
          className={i >= rating ? "text-neutral-700" : ""}
          size={size}
        />
      ))}
    </div>
  );
}
