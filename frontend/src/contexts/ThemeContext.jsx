import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "black", "dark");
    document.documentElement.classList.add(theme === "light" ? "-" : "dark");
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.remove("light", "black", "dark");
    document.documentElement.classList.add(theme === "light" ? "-" : "dark");
    setTheme((prev) => (prev === "light" ? "black" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
