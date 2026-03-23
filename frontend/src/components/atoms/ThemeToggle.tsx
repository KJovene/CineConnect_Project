import React from "react";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  React.useEffect(() => {
    const root = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]); 

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Changer le thème"
    >
      {theme === "dark" ? (
        <HiOutlineSun
          size={20}
          className="stroke-current text-gray-800 dark:text-gray-200"
          style={{ fill: "none", strokeWidth: 1.5 }}
        />
      ) : (
        <HiOutlineMoon
          size={20}
          className="stroke-current text-gray-800 dark:text-gray-200"
          style={{ fill: "none", strokeWidth: 1.5 }}
        />
      )}
    </button>
  );
}