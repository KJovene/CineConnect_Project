import React from "react";
import type { SidebarMenuSection, SidebarMenuItem } from "@/types";

interface SidebarNavProps {
  sections: SidebarMenuSection[];
}

const SidebarNav: React.FC<SidebarNavProps> = ({ sections }) => {
  return (
    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
      {sections.map((section, index) => (
        <div key={index}>
          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-3 px-3 hidden lg:block">
            {section.title}
          </div>

          {section.items.map((item: SidebarMenuItem) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group border ${
                item.isActive
                  ? "bg-white/5 text-white border-white/5 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5"
              }`}
            >
              <div
                className={`shrink-0 ${
                  item.isActive
                    ? "text-indigo-400 group-hover:text-indigo-300"
                    : "group-hover:text-neutral-300"
                } transition-colors`}
              >
                {item.icon}
              </div>
              <span className="hidden lg:block text-sm font-medium">
                {item.label}
              </span>
              {item.showNotification && (
                <span className="hidden lg:flex ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              )}
            </a>
          ))}

          {index < sections.length - 1 && <div className="mt-6" />}
        </div>
      ))}
    </nav>
  );
};

export default SidebarNav;
