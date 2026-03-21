import React from "react";

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
      className="ml-2 px-3 py-2 rounded bg-gray-200 dark:bg-gray-400 text-gray-800 dark:text-gray-200 transition-colors"
      aria-label="Changer le thème"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}