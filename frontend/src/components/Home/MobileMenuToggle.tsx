import React from "react";
import { HiBars3 } from "react-icons/hi2";

interface MobileMenuToggleProps {
  onClick?: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
      aria-label="Toggle mobile menu"
    >
      <HiBars3 size={24} />
    </button>
  );
};

export default MobileMenuToggle;
