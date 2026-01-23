import React from "react";

interface SidebarProps {
  header: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ header, nav, footer }) => {
  return (
    <aside className="w-20 lg:w-64 flex flex-col border-r border-white/5 h-full shrink-0 bg-[#080808]">
      {header}
      {nav}
      {footer}
    </aside>
  );
};

export default Sidebar;
