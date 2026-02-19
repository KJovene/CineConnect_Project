import { HiBars3 } from "react-icons/hi2";

export interface MobileMenuToggleProps {
  onClick?: () => void;
}

export function MobileMenuToggle({ onClick }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
      aria-label="Toggle mobile menu"
    >
      <HiBars3 size={24} />
    </button>
  );
}
