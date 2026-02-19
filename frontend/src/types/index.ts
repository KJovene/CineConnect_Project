// Movie Card Types
export interface MovieCardProps {
  image: string;
  title: string;
  director: string;
  year: string;
  rating?: string;
  isPercentage?: boolean;
}

// Review Card Types
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

// Sidebar Menu Item
export interface SidebarMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  showNotification?: boolean;
}

// Sidebar Menu Section
export interface SidebarMenuSection {
  title: string;
  items: SidebarMenuItem[];
}
