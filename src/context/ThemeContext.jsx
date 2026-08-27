//1. Guarda la preferencia del usuario en localStorage (para que recuerde su elección)
//2. Aplica la clase "light" al body para que los colores de index.css cambien
//Cualquier componente puede acceder al tema con el hook useTheme().

import { createContext, useContext, useState, useEffect } from "react";

// createContext crea el "altavoz" global. El valor default es solo por si
// alguien usa el hook fuera del Provider (sería un error, pero no crashea)
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Al inicio lee localStorage. Si no hay nada asume "dark"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("zenda-theme") || "dark";
  });

  // Cada vez que theme cambia aplicamos o quitamos la clase "light" del body
  // y guardamos la preferencia en localStorage
  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("zenda-theme", theme);
  }, [theme]);

  // Invierte el tema actual
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado: lo usas así → const { theme, toggleTheme } = useTheme()
export function useTheme() {
  return useContext(ThemeContext);
}
