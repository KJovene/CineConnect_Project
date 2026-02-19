import { HiArrowRight, HiOutlinePencil } from "react-icons/hi2";
import { ReviewCard, type ReviewCardProps } from "@/components/molecules";

export interface ReviewListProps {
  title: string;
  reviews: ReviewCardProps[];
  onViewAll?: () => void;
  onWriteReview?: () => void;
}

export function ReviewList({
  title,
  reviews,
  onViewAll,
  onWriteReview,
}: ReviewListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Voir tout <HiArrowRight size={12} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}

        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group h-full min-h-44"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HiOutlinePencil size={24} />
            </div>
            <span className="text-sm font-medium">Écrire un avis</span>
          </button>
        )}
      </div>
    </section>
  );
}
