export interface MovieCardProps {
  image: string;
  title: string;
  director: string;
  year: string;
  rating?: string;
  isPercentage?: boolean;
}

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
