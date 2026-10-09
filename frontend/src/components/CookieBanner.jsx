/*
  CookieBanner — ZENDA
  UI/UX Pro: Banner flotante con estilos avanzados, microinteracciones en hover
  y soporte para temas claro/oscuro manteniendo la lógica de ocultado por estado.
*/

import { useState } from "react";
import { Cookie, Check } from "lucide-react";

function CookieBanner() {
    const [oculto, setOculto] = useState(false);

    if (oculto) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                maxWidth: 380,
                width: "calc(100% - 48px)",
                backgroundColor: "var(--color-bg-card, #1e293b)",
                color: "var(--color-text-main, #ffffff)",
                border: "1px solid var(--color-border, rgba(255, 255, 255, 0.12))",
                borderRadius: 14,
                padding: 20,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
                zIndex: 999999,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                backdropFilter: "blur(12px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                    style={{
                        padding: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(57, 169, 0, 0.15)",
                        color: "#39a900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Cookie size={20} />
                </div>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                    Almacenamiento Local (Cookies)
                </span>
            </div>

            <p style={{ fontSize: "0.82rem", margin: 0, opacity: 0.88, lineHeight: 1.5 }}>
                ZENDA utiliza <code>localStorage</code> para mantener tu sesión activa de forma segura y guardar tus preferencias visuales bajo la <strong>Ley 1581 de 2012</strong>.
            </p>

            <button
                onClick={() => setOculto(true)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#39a900",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.15s ease, opacity 0.15s ease",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(57, 169, 0, 0.25)",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.92";
                    e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                }}
            >
                <Check size={16} /> Entendido
            </button>
        </div>
    );
}

export default CookieBanner;