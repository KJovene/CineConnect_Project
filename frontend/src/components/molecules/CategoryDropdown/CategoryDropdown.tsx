import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

export interface CategoryDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  categories?: string[];
}

export function CategoryDropdown({
  value = "Catégories",
  onChange,
  categories = [
    "Toutes catégories",
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Thriller",
    "Romance",
    "Animation",
  ],
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    onChange?.(category);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
      >
        <span>{value}</span>
        <HiChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={16}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                  value === category
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-neutral-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
