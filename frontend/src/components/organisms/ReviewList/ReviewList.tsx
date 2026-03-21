import { HiArrowRight, HiOutlinePencil } from "react-icons/hi2";
import { ReviewCard, type ReviewCardProps } from "@/components/molecules";

export interface ReviewListProps {
  title: string;
  reviews: ReviewCardProps[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onWriteReview?: () => void;
}

export function ReviewList({
  title,
  reviews,
  isLoading = false,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`review-skeleton-${index}`}
                className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-2 w-16 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="h-3 w-16 rounded bg-white/10" />
                </div>

                <div className="h-4 w-2/3 rounded bg-white/10 mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-5/6 rounded bg-white/10" />
                  <div className="h-3 w-4/6 rounded bg-white/10" />
                </div>

                <div className="h-3 w-28 rounded bg-white/10 pt-4 border-t border-white/5" />
              </div>
            ))
          : reviews.map((review, index) => <ReviewCard key={index} {...review} />)}

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
