import { HiMagnifyingGlass } from "react-icons/hi2";
import { inputClassName } from "@/components/atoms";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
}

export function SearchBar({
  placeholder = "Rechercher un film, une série, un membre...",
  value,
  onChange,
  fullWidth = false,
}: SearchBarProps) {
  return (
    <div className={`relative w-full group ${
      fullWidth ? "max-w-full" : "max-w-md hidden md:block"
    }`}>
      <HiMagnifyingGlass
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${inputClassName} pl-10 shadow-inner`}
      />
    </div>
  );
}
