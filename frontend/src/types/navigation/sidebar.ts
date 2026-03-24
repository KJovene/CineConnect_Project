export interface SidebarMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  showNotification?: boolean;
}

export interface SidebarMenuSection {
  title: string;
  items: SidebarMenuItem[];
}
