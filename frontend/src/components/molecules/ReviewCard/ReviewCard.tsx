import { HiOutlineEllipsisVertical, HiChatBubbleLeft } from "react-icons/hi2";
import { RatingStars } from "@/components/atoms";

export interface ReviewCardProps {
  avatar: string;
  name: string;
  badge: string;
  rating: number;
  movie: string;
  review: string;
  time: string;
  likes: number;
  comments: number;
}

export function ReviewCard({
  avatar,
  name,
  badge,
  rating,
  movie,
  review,
  time,
  likes,
  comments,
}: ReviewCardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
          <div>
            <div className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors">
              {name}
            </div>
            <div className="text-[10px] text-neutral-500">{badge}</div>
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>

      <h4 className="text-neutral-300 font-medium text-sm mb-2">{movie}</h4>
      <p className="text-sm text-neutral-400 leading-relaxed mb-4">{review}</p>

      <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-white/5">
        <span>{time}</span>
        <div className="flex gap-4">
          <button className="flex items-center gap-1.5 hover:text-white transition">
            <HiOutlineEllipsisVertical size={14} /> {likes}
          </button>
          <button className="flex items-center gap-1.5 hover:text-white transition">
            <HiChatBubbleLeft size={14} /> {comments}
          </button>
        </div>
      </div>
    </div>
  );
}
