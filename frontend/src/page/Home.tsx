import React, { useState } from "react";
import {
  HiOutlineFilm,
  HiOutlinePlayCircle,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiMagnifyingGlass,
  HiBell,
  HiInformationCircle,
  HiChevronLeft,
  HiChevronRight,
  HiArrowRight,
  HiOutlinePencil,
  HiStar,
} from "react-icons/hi2";
import type { SidebarMenuSection } from "@/types";
import {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
  MovieCard,
  ReviewCard,
  MobileMenuToggle,
} from "@/components/Home/";

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar menu configuration
  const sidebarMenuSections: SidebarMenuSection[] = [
    {
      title: "Exploration",
      items: [
        {
          id: "discover",
          icon: <HiOutlineFilm size={20} />,
          label: "Découvrir",
          href: "#",
          isActive: true,
        },
        {
          id: "films",
          icon: <HiOutlineFilm size={20} />,
          label: "Films",
          href: "#",
        },
        {
          id: "series",
          icon: <HiOutlinePlayCircle size={20} />,
          label: "Séries",
          href: "#",
        },
        {
          id: "notes",
          icon: <HiOutlinePlayCircle size={20} />,
          label: "Mes Notes",
          href: "#",
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          id: "community",
          icon: <HiOutlineUsers size={20} />,
          label: "Communauté",
          href: "#",
          showNotification: true,
        },
        {
          id: "discussions",
          icon: <HiOutlineChatBubbleLeftRight size={20} />,
          label: "Discussions",
          href: "#",
        },
      ],
    },
  ];

  return (
    <div className="bg-[#050505] text-neutral-300 h-screen flex overflow-hidden antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <Sidebar
        header={<SidebarHeader />}
        nav={<SidebarNav sections={sidebarMenuSections} />}
        footer={
          <SidebarFooter
            userName="Alexandre D."
            userBadge="Membre Fondateur"
            userAvatar="https://i.pravatar.cc/150?img=33"
          />
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
        {/* Top Bar */}
        <header
          className="absolute top-0 left-0 right-0 z-20 h-20 flex items-center justify-between px-8 glass-panel border-b-0 border-b-white/5"
          style={{
            background: "rgba(20, 20, 20, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Search Bar */}
          <div className="relative w-full max-w-md hidden md:block group">
            <HiMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un film, une série, un membre..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Mobile Menu & Actions */}
          <div className="flex items-center gap-5 ml-auto">
            <MobileMenuToggle
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />

            <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
              <HiBell size={22} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#141414]"></span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Connexion
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Hero Section */}
          <HeroSection />

          {/* Content Container */}
          <div className="px-8 py-8 w-full max-w-full mx-auto">
            {/* Trending Movies Section */}
            <TrendingMoviesSection />

            {/* Recent Reviews Section */}
            <RecentReviewsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Hero Section Component
 * Displays featured movie with title, description and details
 */
const HeroSection: React.FC = () => {
  return (
    <div
      className="relative w-full h-128 flex items-end"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #050505, rgba(5, 5, 5, 0.6), transparent)",
        }}
      ></div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #050505, rgba(5, 5, 5, 0.4), transparent)",
        }}
      ></div>

      {/* Hero Content */}
      <div className="relative z-10 px-8 pb-16 pt-16 w-full max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 uppercase backdrop-blur-md">
            À la une
          </span>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/5">
            <HiStar className="text-amber-400" size={12} />
            <span className="text-xs text-neutral-200 font-medium">8.9/10</span>
          </div>
          <span className="text-xs text-neutral-300 font-medium">
            • Science-Fiction • 2024
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
          Chroniques de l'Infini
        </h1>

        <p className="text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl mb-10 line-clamp-3 font-light">
          Dans un futur où l'humanité a conquis les étoiles, une découverte
          archéologique sur une planète oubliée remet en question l'origine même
          de la conscience. Découvrez les discussions passionnées de notre
          communauté sur ce chef-d'œuvre.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
            <HiInformationCircle size={20} />
            Plus de détails
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Trending Movies Section Component
 * Displays horizontal carousel of trending movies
 */
const TrendingMoviesSection: React.FC = () => {
  const trendingMovies = [
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

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Tendances Actuelles
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-400">
            Cette semaine
          </span>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white">
            <HiChevronLeft size={18} />
          </button>
          <button className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white">
            <HiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
        {trendingMovies.map((movie, index) => (
          <MovieCard key={index} {...movie} />
        ))}

        {/* Bonus 5th Card for XL screens */}
        <div className="hidden xl:block group relative aspect-2/3 rounded-xl overflow-hidden cursor-pointer bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
          <img
            src="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=600"
            alt="Solaris Redux"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-semibold tracking-tight mb-1 truncate text-lg">
              Solaris Redux
            </h3>
            <div className="flex items-center justify-between text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
              <span>Classique</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Recent Reviews Section Component
 * Displays community reviews and allows creating new reviews
 */
const RecentReviewsSection: React.FC = () => {
  const reviews = [
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

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Derniers Avis de la communauté
        </h2>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Voir tout <HiArrowRight size={12} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}

        {/* Extra Review Card (3rd card - hidden on smaller screens) */}
        <div className="hidden lg:block bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/150?img=44"
                alt="Julie K."
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-sm text-white font-medium group-hover:text-indigo-400 transition-colors">
                  Julie K.
                </div>
                <div className="text-[10px] text-neutral-500">
                  Nouveau Membre
                </div>
              </div>
            </div>
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <HiStar
                  key={i}
                  className={i >= 3 ? "text-neutral-700" : ""}
                  size={12}
                />
              ))}
            </div>
          </div>
          <h4 className="text-neutral-300 font-medium text-sm mb-2">
            Dark Matter
          </h4>
          <p className="text-sm text-neutral-400 leading-relaxed mb-4">
            Sympa, mais le livre était nettement meilleur. L'adaptation manque
            de profondeur sur les personnages secondaires.
          </p>
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-white/5">
            <span>Il y a 8h</span>
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 hover:text-white transition">
                👍 8
              </button>
              <button className="flex items-center gap-1.5 hover:text-white transition">
                💬 2
              </button>
            </div>
          </div>
        </div>

        {/* Add Review Button */}
        <button className="border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group h-full min-h-44">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HiOutlinePencil size={24} />
          </div>
          <span className="text-sm font-medium">Écrire un avis</span>
        </button>
      </div>
    </>
  );
};

export default Home;
