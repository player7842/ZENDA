import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    FileText,
    FolderKanban,
    Menu,
    Moon,
    Sun,
    Users,
    X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

import "../styles/Home.css";

function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const irALogin = () => navigate("/login");
    const irARegistro = () => navigate("/register");

    return (
        <div className="home">

            {/* ================= NAVBAR ================= */}

            <header className="navbar">
                <div className="container navbar-content">
                    <a href="#inicio" className="logo">
                        <img
                            src={theme === "dark" ? "/logos/logo-dark.png" : "/logos/logo-light.png"}
                            alt="ZENDA"
                            className="navbar-logo-img"
                        />

                        <div>
                            <h2>ZENDA</h2>
                            <span>CGMLTI</span>
                        </div>
                    </a>

                    <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
                        <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
                        <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
                        <a href="#funcionalidades" onClick={() => setMenuOpen(false)}>Funcionalidades</a>

                        <div className="mobile-actions">
                            <button className="login-button" onClick={irALogin}>
                                Iniciar sesión
                            </button>

                            <button className="register-button" onClick={irARegistro}>
                                Registrarse
                            </button>
                        </div>
                    </nav>

                    <div className="navbar-actions">

                        <button
                            className="theme-button"
                            onClick={toggleTheme}
                            aria-label="Cambiar tema"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button className="login-button desktop-action" onClick={irALogin}>
                            Iniciar sesión
                        </button>

                        <button className="register-button desktop-action" onClick={irARegistro}>
                            Registrarse
                        </button>

                        <button
                            className="menu-button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Abrir menú"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                    </div>

                </div>
            </header>


            {/* ================= HERO ================= */}

            <main>

                <section id="inicio" className="hero">

                    <div className="hero-glow"></div>

                    <div className="container hero-content">

                        <div className="hero-text">

                            <div className="hero-badge">
                                Gestión y seguimiento de proyectos formativos
                            </div>

                            <h1>
                                Tu proyecto.
                                <span> Tu equipo.</span>
                                <br />
                                Todo su avance en un solo lugar.
                            </h1>

                            <p>
                                ZENDA permite organizar y realizar seguimiento a los
                                proyectos formativos desarrollados por aprendices del SENA,
                                conectando al equipo con las fases, tareas, evidencias y
                                seguimiento del instructor.
                            </p>

                            <div className="hero-buttons">

                                <button className="primary-button" onClick={irARegistro}>
                                    Comenzar ahora
                                    <ArrowRight size={20} />
                                </button>

                                <a href="#como-funciona" className="secondary-button">
                                    Conocer ZENDA
                                </a>

                            </div>

                            <div className="hero-info">

                                <div>
                                    <CheckCircle2 size={18} />
                                    <span>Organiza tu proyecto</span>
                                </div>

                                <div>
                                    <CheckCircle2 size={18} />
                                    <span>Gestiona tu equipo</span>
                                </div>

                                <div>
                                    <CheckCircle2 size={18} />
                                    <span>Haz seguimiento</span>
                                </div>

                            </div>

                        </div>


                        {/* PREVIEW */}

                        <div className="hero-preview">

                            <div className="dashboard-card">

                                <div className="dashboard-header">

                                    <div>
                                        <span className="small-title">
                                            PROYECTO ACTIVO
                                        </span>

                                        <h3>
                                            Plataforma de Gestión ZENDA
                                        </h3>
                                    </div>

                                    <span className="status">
                                        En proceso
                                    </span>

                                </div>


                                <div className="progress-section">

                                    <div className="progress-info">
                                        <span>Progreso general</span>
                                        <strong>68%</strong>
                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className="progress-value"
                                            style={{ width: "68%" }}
                                        ></div>
                                    </div>

                                </div>


                                <div className="preview-grid">

                                    <div className="preview-item">
                                        <FolderKanban size={22} />

                                        <div>
                                            <strong>5</strong>
                                            <span>Fases</span>
                                        </div>
                                    </div>


                                    <div className="preview-item">
                                        <ClipboardList size={22} />

                                        <div>
                                            <strong>12</strong>
                                            <span>Tareas</span>
                                        </div>
                                    </div>


                                    <div className="preview-item">
                                        <FileText size={22} />

                                        <div>
                                            <strong>8</strong>
                                            <span>Evidencias</span>
                                        </div>
                                    </div>


                                    <div className="preview-item">
                                        <Users size={22} />

                                        <div>
                                            <strong>5</strong>
                                            <span>Integrantes</span>
                                        </div>
                                    </div>

                                </div>


                                <div className="phase-preview">

                                    <div className="phase active">
                                        <span></span>
                                        Fase 1 - Análisis
                                    </div>

                                    <div className="phase">
                                        <span></span>
                                        Fase 2 - Diseño
                                    </div>

                                    <div className="phase">
                                        <span></span>
                                        Fase 3 - Desarrollo
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= PROPOSITO ================= */}

                <section className="purpose">

                    <div className="container">

                        <div className="section-title center">

                            <span>¿POR QUÉ ZENDA?</span>

                            <h2>
                                Un proyecto formativo necesita más que archivos dispersos.
                            </h2>

                            <p>
                                ZENDA centraliza la información esencial del proyecto sin
                                convertirse en un LMS ni en una plataforma académica compleja.
                            </p>

                        </div>


                        <div className="purpose-grid">

                            <div className="purpose-card">

                                <div className="card-number">
                                    01
                                </div>

                                <h3>Organización</h3>

                                <p>
                                    Centraliza la estructura del proyecto, sus fases,
                                    documentación y evidencias.
                                </p>

                            </div>


                            <div className="purpose-card">

                                <div className="card-number">
                                    02
                                </div>

                                <h3>Trabajo en equipo</h3>

                                <p>
                                    Permite organizar responsabilidades y tareas dentro
                                    del grupo de aprendices.
                                </p>

                            </div>


                            <div className="purpose-card">

                                <div className="card-number">
                                    03
                                </div>

                                <h3>Seguimiento</h3>

                                <p>
                                    Facilita al instructor consultar el avance y evaluar
                                    las evidencias del proyecto.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= COMO FUNCIONA ================= */}

                <section
                    id="como-funciona"
                    className="how-it-works"
                >

                    <div className="container">

                        <div className="section-title">

                            <span>PROCESO PRINCIPAL</span>

                            <h2>
                                Todo el proyecto sigue una estructura clara.
                            </h2>

                            <p>
                                ZENDA acompaña la organización del proyecto desde la
                                conformación del grupo hasta el seguimiento de su avance.
                            </p>

                        </div>


                        <div className="workflow">

                            <div className="workflow-item">
                                <div className="workflow-icon">
                                    1
                                </div>

                                <h3>Ficha</h3>

                                <p>
                                    Los aprendices pertenecen a una ficha.
                                </p>
                            </div>


                            <div className="workflow-line"></div>


                            <div className="workflow-item">

                                <div className="workflow-icon">
                                    2
                                </div>

                                <h3>Grupo</h3>

                                <p>
                                    Se organiza el equipo de trabajo.
                                </p>

                            </div>


                            <div className="workflow-line"></div>


                            <div className="workflow-item">

                                <div className="workflow-icon">
                                    3
                                </div>

                                <h3>Proyecto</h3>

                                <p>
                                    El Scrum Master crea y administra el proyecto.
                                </p>

                            </div>


                            <div className="workflow-line"></div>


                            <div className="workflow-item">

                                <div className="workflow-icon">
                                    4
                                </div>

                                <h3>Fases</h3>

                                <p>
                                    El trabajo se organiza en cinco fases.
                                </p>

                            </div>


                            <div className="workflow-line"></div>


                            <div className="workflow-item">

                                <div className="workflow-icon">
                                    5
                                </div>

                                <h3>Seguimiento</h3>

                                <p>
                                    El instructor revisa y evalúa el avance.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================= FUNCIONALIDADES ================= */}

                <section
                    id="funcionalidades"
                    className="features"
                >

                    <div className="container">

                        <div className="section-title center">

                            <span>FUNCIONALIDADES</span>

                            <h2>
                                Lo necesario para gestionar un proyecto SENA.
                            </h2>

                        </div>


                        <div className="features-grid">

                            <article className="feature-card">

                                <FolderKanban size={30} />

                                <h3>Gestión de proyectos</h3>

                                <p>
                                    Consulta la información principal y el estado del proyecto.
                                </p>

                            </article>


                            <article className="feature-card">

                                <FileText size={30} />

                                <h3>Fases y documentación</h3>

                                <p>
                                    Organiza el proyecto en fases y carpetas estructuradas.
                                </p>

                            </article>


                            <article className="feature-card">

                                <ClipboardList size={30} />

                                <h3>Gestión de tareas</h3>

                                <p>
                                    Asigna, ejecuta y confirma las tareas del equipo.
                                </p>

                            </article>


                            <article className="feature-card">

                                <CheckCircle2 size={30} />

                                <h3>Evidencias</h3>

                                <p>
                                    Almacena y consulta las evidencias oficiales del proyecto.
                                </p>

                            </article>

                        </div>

                    </div>

                </section>


                {/* ================= CTA ================= */}

                <section className="final-cta">

                    <div className="container">

                        <div className="cta-content">

                            <div>

                                <span>ZENDA</span>

                                <h2>
                                    Gestiona el avance de tu proyecto desde un solo lugar.
                                </h2>

                                <p>
                                    Organiza tu equipo, estructura el trabajo y mantén
                                    el seguimiento del proyecto formativo.
                                </p>

                            </div>

                            <div className="cta-buttons">

                                <button className="primary-button" onClick={irARegistro}>
                                    Crear una cuenta
                                    <ArrowRight size={20} />
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="footer">

                <div className="container footer-content">

                    <div>

                        <h2>ZENDA</h2>

                        <p>
                            Sistema de gestión y seguimiento
                            de proyectos formativos.
                        </p>

                    </div>


                    <div className="footer-links">

                        <a href="#inicio">Inicio</a>
                        <a href="#como-funciona">Cómo funciona</a>
                        <a href="#funcionalidades">Funcionalidades</a>

                    </div>

                </div>

                <div className="container footer-bottom">

                    © 2026 ZENDA - Proyecto formativo SENA

                </div>

            </footer>

        </div>
    );
}

export default Home;