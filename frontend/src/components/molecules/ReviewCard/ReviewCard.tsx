import { Avatar, RatingStars } from "@/components/atoms";

export interface ReviewCardProps {
  avatar: string | null;
  name: string;
  rating: number;
  movie: string;
  review: string;
  commentedAt: string | null;
}

function formatCommentDateTime(value: string | null): string {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function ReviewCard({
  avatar,
  name,
  rating,
  movie,
  review,
  commentedAt,
}: ReviewCardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar image={avatar} name={name} size="lg" />
          <div>
            <div className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors">
              {name}
            </div>
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>

      <h4 className="text-neutral-300 font-medium text-sm mb-2">{movie}</h4>
      <p className="text-sm text-neutral-400 leading-relaxed mb-4">{review}</p>

      <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-white/5">
        <span>{formatCommentDateTime(commentedAt)}</span>
      </div>
    </div>
  );
}
