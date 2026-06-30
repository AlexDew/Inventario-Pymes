// =============================================
// navbar.js - Compartido en todas las paginas
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    iniciarNavbar();
    cargarBadgeAlertas();
    cargarRedesNavbar();
});

function iniciarNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    // Crear boton hamburguesa si la pagina no lo trae en el HTML
    if (!navbar.querySelector(".nav-toggle")) {
        const toggle = document.createElement("button");
        toggle.className = "nav-toggle";
        toggle.setAttribute("aria-label", "Abrir menu");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "<span></span><span></span><span></span>";

        const navLinks = navbar.querySelector(".nav-links");
        if (navLinks) navbar.insertBefore(toggle, navLinks);
    }

    const toggle = navbar.querySelector(".nav-toggle");
    const navLinks = navbar.querySelector(".nav-links");
    if (!toggle || !navLinks) return;

    toggle.setAttribute("aria-expanded", navLinks.classList.contains("open") ? "true" : "false");

    function cerrarMenu() {
        navLinks.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
    }

    // Abrir / cerrar menu
    toggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        toggle.classList.toggle("open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Cerrar al hacer click en un link
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", cerrarMenu);
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", (e) => {
        if (!navbar.contains(e.target)) {
            cerrarMenu();
        }
    });

    // Marcar pagina activa automaticamente
    const paginaActual = window.location.pathname.split("/").pop() || "index.html";
    navLinks.querySelectorAll("a").forEach(link => {
        const href = link.getAttribute("href");
        if (href === paginaActual || (paginaActual === "" && href === "index.html")) {
            link.classList.add("active");
        }
    });
}

async function cargarBadgeAlertas() {
    try {
        const res = await fetch(`${API_BASE_URL}/alertas?estado=ACTIVA`);
        const alertas = await res.json();
        const badge = document.getElementById("badge-alertas");
        if (badge && alertas.length > 0) {
            badge.textContent = alertas.length;
            badge.classList.remove("hidden");
        }
    } catch {
        // silencioso
    }
}

async function cargarRedesNavbar() {
    try {
        const res = await fetch(`${API_BASE_URL}/canales`);
        const canales = await res.json();
        canales.forEach(c => {
            if (!c.urlEnlace) return;

            const mapa = {
                INSTAGRAM: "link-instagram",
                FACEBOOK: "link-facebook",
                WHATSAPP: "link-whatsapp"
            };

            const id = mapa[c.nombre];
            if (!id) return;

            const el = document.getElementById(id);
            if (el) el.href = c.urlEnlace;
        });
    } catch {
        // silencioso
    }
}
