import { HiMagnifyingGlass } from "react-icons/hi2";

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
    <div
      className={`relative w-full group ${
        fullWidth ? "max-w-full" : "max-w-md hidden md:block"
      }`}
    >
      <HiMagnifyingGlass
        className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: "var(--color-text-muted)" }}
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg px-4 py-2.5 pl-10 text-sm shadow-inner outline-none transition-colors"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}