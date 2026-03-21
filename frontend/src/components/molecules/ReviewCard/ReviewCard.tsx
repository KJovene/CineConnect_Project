import { Avatar, RatingStars } from "@/components/atoms";
import { Link } from "@tanstack/react-router";

export interface ReviewCardProps {
  avatar: string | null;
  name: string;
  rating: number;
  movie: string;
  review: string;
  commentedAt: string | null;
  omdbId?: string;
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

const cardStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
};

export function ReviewCard({
  avatar,
  name,
  rating,
  movie,
  review,
  commentedAt,
  omdbId,
}: ReviewCardProps) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar image={avatar} name={name} size="lg" />
          <div
            className="text-sm font-medium group-hover:text-indigo-400 transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            {name}
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>

      <h4 className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
        {movie}
      </h4>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
        {review}
      </p>

      <div
        className="flex items-center justify-between text-xs pt-4"
        style={{
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span>{formatCommentDateTime(commentedAt)}</span>
      </div>
    </>
  );

  if (omdbId) {
    return (
      <Link
        to="/film/$id"
        params={{ id: omdbId }}
        className="p-5 rounded-2xl transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
        style={cardStyle}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="p-5 rounded-2xl transition-colors group" style={cardStyle}>
      {cardContent}
    </div>
  );
}