// =========================================
// dashboard_charts.js — Dashboard con Chart.js
// =========================================

let chartEstado     = null;
let chartMovimientos = null;
let chartTop5       = null;
let chartStockMin   = null;

// ─── INIT ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    mostrarFecha();
    cargarTodo();
    document.getElementById("btn-refresh").addEventListener("click", cargarTodo);
});

function mostrarFecha() {
    document.getElementById("fecha-actual").textContent =
        new Date().toLocaleDateString("es-PE", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
}

async function cargarTodo() {
    document.getElementById("btn-refresh").textContent = "⏳ Actualizando…";
    try {
        await Promise.all([
            cargarMetricas(),
            cargarCanales(),
            cargarProductosYGraficos()
        ]);
    } finally {
        document.getElementById("btn-refresh").textContent = "🔄 Actualizar";
    }
}

// ─── MÉTRICAS ─────────────────────────────
async function cargarMetricas() {
    try {
        const res  = await fetch(`${API_BASE_URL}/dashboard`);
        const data = await res.json();

        // Animar los valores con contador
        animarNumero("total-stock",      data.totalProductosStock, "");
        animarNumero("quiebres-activos", data.quiebresActivos,     "");
        document.getElementById("precision-inventario").textContent =
            `${data.precisionInventario}%`;
        animarNumero("ventas-evitadas-count", data.ventasEvitadasCount, "");
        document.getElementById("ventas-evitadas-valor").textContent =
            `S/ ${parseFloat(data.ventasEvitadasValor || 0).toFixed(2)} en valor protegido`;

        // Badge de alertas en navbar
        if (data.quiebresActivos > 0) {
            const badge = document.getElementById("badge-alertas");
            badge.textContent = data.quiebresActivos;
            badge.classList.remove("hidden");
        }

        // Alerta rápida
        if (data.quiebresActivos > 0) {
            document.getElementById("alerta-rapida").classList.remove("hidden");
            document.getElementById("alerta-rapida-titulo").textContent =
                `${data.quiebresActivos} alerta${data.quiebresActivos > 1 ? "s" : ""} activa${data.quiebresActivos > 1 ? "s" : ""}`;
            document.getElementById("alerta-rapida-msg").textContent =
                "Tienes productos que necesitan reposición urgente.";
        }

        // Alertas recientes
        cargarAlertasRecientes();

    } catch (e) {
        console.error("Error métricas:", e);
    }
}

// ─── CANALES ──────────────────────────────
async function cargarCanales() {
    try {
        const res     = await fetch(`${API_BASE_URL}/canales`);
        const canales = await res.json();

        const iconos = {
            TIENDA_FISICA: "🏬", WEB: "🌐",
            INSTAGRAM: "📷", FACEBOOK: "📘", WHATSAPP: "💬"
        };

        const lista = document.getElementById("canales-lista");
        lista.innerHTML = "";

        canales.forEach(c => {
            const esLink = !!c.urlEnlace;
            const el = document.createElement(esLink ? "a" : "div");
            el.className = "canal-row";
            if (esLink) { el.href = c.urlEnlace; el.target = "_blank"; }

            el.innerHTML = `
                <span style="font-size:1.1rem">${iconos[c.nombre] || "🔗"}</span>
                <span class="canal-nombre">${c.nombre.replace(/_/g, " ")}</span>
                <span class="canal-tipo-badge tipo-${c.tipo}">${c.tipo}</span>
                ${c.urlEnlace ? `<span class="canal-link">${c.urlEnlace.replace("https://","")}</span>` : ""}
            `;
            lista.appendChild(el);

            // Setear links rápidos navbar
            if (c.nombre === "INSTAGRAM") document.getElementById("link-instagram").href = c.urlEnlace || "#";
            if (c.nombre === "FACEBOOK")  document.getElementById("link-facebook").href  = c.urlEnlace || "#";
            if (c.nombre === "WHATSAPP")  document.getElementById("link-whatsapp").href  = c.urlEnlace || "#";
        });
    } catch (e) {
        console.error("Error canales:", e);
    }
}

// ─── PRODUCTOS + GRÁFICOS ─────────────────
async function cargarProductosYGraficos() {
    try {
        const [resProductos, resAlertas, resMovAll] = await Promise.all([
            fetch(`${API_BASE_URL}/productos`),
            fetch(`${API_BASE_URL}/alertas`),
            Promise.resolve(null) // movimientos se cargan por producto
        ]);

        const productos = await resProductos.json();
        const alertas   = await resAlertas.json();

        // Actualizar sub-labels
        document.getElementById("sub-productos").textContent =
            `${productos.filter(p => p.activo !== false).length} productos activos`;

        // Reposición urgente
        renderListaReposicion(productos);

        // Cargar movimientos de todos los productos en paralelo
        const movPromesas = productos.map(p =>
            fetch(`${API_BASE_URL}/movimientos/producto/${p.idProducto}`)
                .then(r => r.json())
                .then(movs => movs.map(m => ({ ...m, _productoNombre: p.nombre })))
        );
        const movPorProducto = await Promise.all(movPromesas);
        const allMovimientos  = movPorProducto.flat();

        // Dibujar gráficos
        dibujarGraficoEstadoStock(productos);
        dibujarGraficoMovimientos(allMovimientos);
        dibujarGraficoTop5(allMovimientos);
        dibujarGraficoStockMinimo(productos);

    } catch (e) {
        console.error("Error gráficos:", e);
    }
}

// ─── GRÁFICO 1: Estado del stock (Donut) ──
function dibujarGraficoEstadoStock(productos) {
    const disponibles = productos.filter(p => p.estadoStock === "OK").length;
    const bajos       = productos.filter(p => p.estadoStock === "BAJO").length;
    const sinStock    = productos.filter(p => p.estadoStock === "SIN_STOCK").length;

    const ctx = document.getElementById("chart-estado-stock");
    if (!ctx) return;

    if (chartEstado) chartEstado.destroy();

    chartEstado = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Disponible", "Stock bajo", "Sin stock"],
            datasets: [{
                data: [disponibles, bajos, sinStock],
                backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                borderColor:     ["#fff","#fff","#fff"],
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} producto${ctx.raw !== 1 ? "s" : ""}`
                    }
                }
            }
        }
    });

    // Leyenda personalizada
    const legend = document.getElementById("donut-legend");
    legend.innerHTML = [
        { label: "Disponible", color: "#22c55e", count: disponibles },
        { label: "Stock bajo",  color: "#f59e0b", count: bajos },
        { label: "Sin stock",   color: "#ef4444", count: sinStock }
    ].map(item => `
        <div class="legend-item">
            <div class="legend-dot" style="background:${item.color}"></div>
            <span>${item.label} (${item.count})</span>
        </div>
    `).join("");
}

// ─── GRÁFICO 2: Movimientos por tipo (Barras) ─
function dibujarGraficoMovimientos(movimientos) {
    const counts = { ENTRADA: 0, SALIDA: 0, MERMA: 0, AJUSTE: 0 };
    movimientos.forEach(m => {
        const tipo = m.tipoMovimiento?.nombre;
        if (counts[tipo] !== undefined) counts[tipo]++;
    });

    const ctx = document.getElementById("chart-movimientos");
    if (!ctx) return;

    if (chartMovimientos) chartMovimientos.destroy();

    chartMovimientos = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Entradas", "Salidas", "Mermas", "Ajustes"],
            datasets: [{
                label: "Cantidad de movimientos",
                data:  [counts.ENTRADA, counts.SALIDA, counts.MERMA, counts.AJUSTE],
                backgroundColor: [
                    "rgba(34,197,94,0.85)",
                    "rgba(239,68,68,0.85)",
                    "rgba(245,158,11,0.85)",
                    "rgba(139,92,246,0.85)"
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.raw} movimiento${ctx.raw !== 1 ? "s" : ""}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 11 } },
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    ticks: { font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// ─── GRÁFICO 3: Top 5 productos (Barras horizontales) ─
function dibujarGraficoTop5(movimientos) {
    // Contar movimientos por producto
    const conteo = {};
    movimientos.forEach(m => {
        const nombre = m._productoNombre || m.producto?.nombre || "—";
        conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    const sorted = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const ctx = document.getElementById("chart-top-productos");
    if (!ctx) return;

    if (chartTop5) chartTop5.destroy();

    chartTop5 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: sorted.map(([nombre]) =>
                nombre.length > 22 ? nombre.slice(0, 20) + "…" : nombre
            ),
            datasets: [{
                label: "Movimientos",
                data:  sorted.map(([, count]) => count),
                backgroundColor: [
                    "rgba(59,130,246,0.85)",
                    "rgba(99,102,241,0.85)",
                    "rgba(139,92,246,0.85)",
                    "rgba(168,85,247,0.75)",
                    "rgba(217,70,239,0.65)"
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.raw} movimiento${ctx.raw !== 1 ? "s" : ""}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 11 } },
                    grid: { color: "#f1f5f9" }
                },
                y: {
                    ticks: { font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// ─── GRÁFICO 4: Stock actual vs mínimo ────
function dibujarGraficoStockMinimo(productos) {
    // Mostrar solo los productos con stock <= mínimo*2 (más interesantes)
    const criticos = productos
        .filter(p => p.stockActual <= p.stockMinimo * 2 && p.stockMinimo > 0)
        .sort((a, b) => a.stockActual - b.stockActual)
        .slice(0, 7);

    const ctx = document.getElementById("chart-stock-minimo");
    if (!ctx) return;

    if (chartStockMin) chartStockMin.destroy();

    const nombresCortos = criticos.map(p =>
        p.nombre.length > 18 ? p.nombre.slice(0, 16) + "…" : p.nombre
    );

    chartStockMin = new Chart(ctx, {
        type: "bar",
        data: {
            labels: nombresCortos,
            datasets: [
                {
                    label: "Stock actual",
                    data:  criticos.map(p => p.stockActual),
                    backgroundColor: criticos.map(p =>
                        p.stockActual === 0
                            ? "rgba(239,68,68,0.85)"
                            : p.stockActual <= p.stockMinimo
                            ? "rgba(245,158,11,0.85)"
                            : "rgba(34,197,94,0.85)"
                    ),
                    borderRadius: 6,
                    borderSkipped: false,
                    order: 1
                },
                {
                    label: "Stock mínimo",
                    data:  criticos.map(p => p.stockMinimo),
                    type: "line",
                    borderColor: "#ef4444",
                    borderWidth: 2,
                    borderDash: [5, 3],
                    pointBackgroundColor: "#ef4444",
                    pointRadius: 4,
                    fill: false,
                    tension: 0,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: { font: { size: 11 }, boxWidth: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} uds.`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 10 } },
                    grid: { color: "#f1f5f9" }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// ─── ALERTAS RECIENTES ────────────────────
async function cargarAlertasRecientes() {
    try {
        const res     = await fetch(`${API_BASE_URL}/alertas?estado=ACTIVA`);
        const alertas = await res.json();

        const lista = document.getElementById("alertas-recientes");
        lista.innerHTML = "";

        if (alertas.length === 0) {
            lista.innerHTML = `<div class="empty-panel">✅ Sin alertas activas</div>`;
            return;
        }

        alertas.slice(0, 5).forEach(a => {
            const esBajo = a.tipoAlerta === "STOCK_BAJO";
            const div = document.createElement("div");
            div.className = `alerta-recent-item ${esBajo ? "bajo" : ""}`;
            div.innerHTML = `
                <span class="alerta-recent-icono">${esBajo ? "⚠️" : "⛔"}</span>
                <div class="alerta-recent-texto">
                    <span class="alerta-recent-nombre">${a.producto?.nombre || "—"}</span>
                    <span class="alerta-recent-msg">${a.mensaje}</span>
                </div>
            `;
            lista.appendChild(div);
        });

        if (alertas.length > 5) {
            lista.innerHTML += `
                <a href="alertas.html" style="font-size:0.78rem;color:#3b82f6;text-align:center;display:block;padding:0.3rem">
                    + ${alertas.length - 5} más →
                </a>`;
        }
    } catch (e) {
        console.error("Error alertas recientes:", e);
    }
}

// ─── LISTA REPOSICIÓN ─────────────────────
function renderListaReposicion(productos) {
    const criticos = productos
        .filter(p => p.estadoStock !== "OK" && p.activo !== false)
        .sort((a, b) => a.stockActual - b.stockActual)
        .slice(0, 6);

    const lista = document.getElementById("lista-reposicion");
    lista.innerHTML = "";

    if (criticos.length === 0) {
        lista.innerHTML = `<div class="empty-panel">✅ Todo el stock está en niveles normales</div>`;
        return;
    }

    criticos.forEach(p => {
        const esCero = p.stockActual === 0;
        lista.innerHTML += `
            <div class="repo-item">
                <span style="font-size:0.85rem">📦</span>
                <span class="repo-nombre">${p.nombre}</span>
                <span class="repo-stock ${esCero ? "cero" : "bajo"}">
                    ${esCero ? "0 uds." : `${p.stockActual} uds.`}
                </span>
            </div>
        `;
    });
}

// ─── UTILIDADES ───────────────────────────
function animarNumero(id, valor, sufijo = "") {
    const el    = document.getElementById(id);
    if (!el)    return;
    const start = 0;
    const end   = parseInt(valor) || 0;
    const dur   = 600;
    const step  = end / (dur / 16);
    let current = start;

    const timer = setInterval(() => {
        current = Math.min(current + step, end);
        el.textContent = Math.floor(current) + sufijo;
        if (current >= end) clearInterval(timer);
    }, 16);
}
