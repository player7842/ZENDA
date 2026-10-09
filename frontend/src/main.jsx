/*
  Monta React en el DOM y envuelve todo con los providers necesarios:
  - ThemeProvider: para el tema claro/oscuro
  - BrowserRouter: para la navegación entre páginas
El botón de tema ya no va global fijo: cada página lo pone en su header.
*/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
