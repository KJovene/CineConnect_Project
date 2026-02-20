import React from "react";
import { HeroSection, MediaGrid, ReviewList } from "@/components/organisms";

const TRENDING_MOVIES = [
  {
    image:
      "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg",
    title: "Interstellar Echoes",
    director: "Christopher Nolan",
    year: "2024",
    rating: "9.2",
  },
  {
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=600",
    title: "Neo Tokyo",
    director: "Katsuhiro Otomo",
    year: "2023",
    rating: "94%",
    isPercentage: true,
  },
  {
    image:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600",
    title: "The Silent Sea",
    director: "Sci-Fi / Drame",
    year: "2024",
  },
  {
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    title: "Dark Matter",
    director: "Blake Crouch",
    year: "2023",
    rating: "8.5",
  },
];

const RECENT_REVIEWS = [
  {
    avatar: "https://i.pravatar.cc/150?img=12",
    name: "Sophie M.",
    badge: "Membre Verified",
    rating: 5,
    movie: "Interstellar Echoes",
    review:
      "Une photographie époustouflante. Probablement le meilleur film de l'année. La bande son est tout simplement magistrale.",
    time: "Il y a 2h",
    likes: 24,
    comments: 4,
  },
  {
    avatar: "https://i.pravatar.cc/150?img=8",
    name: "Marc L.",
    badge: "Critique Amateur",
    rating: 4,
    movie: "Neo Tokyo",
    review:
      "L'intrigue est un peu lente au début, mais le final rattrape tout. Incroyable performance d'acteur sur la scène finale.",
    time: "Il y a 5h",
    likes: 12,
    comments: 1,
  },
];

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />

      <div className="px-8 py-8">
        <MediaGrid
          title="Tendances Actuelles"
          badge="Cette semaine"
          movies={TRENDING_MOVIES}
        />
        <ReviewList
          title="Derniers Avis de la communauté"
          reviews={RECENT_REVIEWS}
          onViewAll={() => {}}
          onWriteReview={() => {}}
        />
      </div>
    </>
  );
};

export default Home;
