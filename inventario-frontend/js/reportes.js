// =========================================
// reportes.js — Módulo de Reportes
// =========================================

let allMovimientos     = [];
let allProductos       = [];
let allAlertas         = [];
let allVentasEvitadas  = [];
let allCanales         = [];
let allCategorias      = [];

// ─── INIT ─────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        cargarCategorias(),
        cargarCanales(),
        cargarProductos()
    ]);
    await cargarMovimientos();
    await cargarAlertas();
    await cargarVentasEvitadas();

    bindTabs();
    bindFiltros();
    bindExportar();
});

// ─── CARGA DATOS ──────────────────────────
async function cargarProductos() {
    const res = await fetch(`${API_BASE_URL}/productos`);
    allProductos = await res.json();

    // Poblar filtro de producto en movimientos
    const sel = document.getElementById("mov-filtro-producto");
    allProductos.forEach(p => {
        sel.innerHTML += `<option value="${p.idProducto}">${p.nombre}</option>`;
    });

    // Poblar filtro categoría en stock
    const selCat = document.getElementById("stock-filtro-cat");
    // (categorías ya cargadas)
    renderTabStock();
}

async function cargarCategorias() {
    const res = await fetch(`${API_BASE_URL}/categorias`);
    allCategorias = await res.json();
    const sel = document.getElementById("stock-filtro-cat");
    allCategorias.forEach(c => {
        sel.innerHTML += `<option value="${c.idCategoria}">${c.nombre}</option>`;
    });
}

async function cargarCanales() {
    const res = await fetch(`${API_BASE_URL}/canales`);
    allCanales = await res.json();
    const sel = document.getElementById("mov-filtro-canal");
    allCanales.forEach(c => {
        sel.innerHTML += `<option value="${c.idCanal}">${c.nombre.replace("_"," ")}</option>`;
    });
}

async function cargarMovimientos() {
    // Cargamos todos los movimientos de todos los productos
    const promesas = allProductos.map(p =>
        fetch(`${API_BASE_URL}/movimientos/producto/${p.idProducto}`).then(r => r.json())
    );
    const results = await Promise.all(promesas);
    allMovimientos = results.flat().sort((a, b) =>
        new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)
    );
    renderTabMovimientos();
}

async function cargarAlertas() {
    const res = await fetch(`${API_BASE_URL}/alertas`);
    allAlertas = await res.json();
    renderTabAlertas();
}

async function cargarVentasEvitadas() {
    // Usando el endpoint de dashboard para obtener el resumen
    // y los datos individuales si el backend los expone
    try {
        const res = await fetch(`${API_BASE_URL}/ventas-evitadas`);
        if (res.ok) {
            allVentasEvitadas = await res.json();
        }
    } catch {
        allVentasEvitadas = [];
    }
    renderTabVentasEvitadas();
}

// ─── RENDER: MOVIMIENTOS ──────────────────
function renderTabMovimientos() {
    const idProducto = document.getElementById("mov-filtro-producto").value;
    const tipo       = document.getElementById("mov-filtro-tipo").value;
    const idCanal    = document.getElementById("mov-filtro-canal").value;

    let datos = allMovimientos.filter(m => {
        if (idProducto && String(m.producto?.idProducto) !== idProducto) return false;
        if (tipo       && m.tipoMovimiento?.nombre !== tipo)              return false;
        if (idCanal    && String(m.canal?.idCanal)  !== idCanal)         return false;
        return true;
    });

    // Resumen
    const counts = { ENTRADA: 0, SALIDA: 0, MERMA: 0, AJUSTE: 0 };
    datos.forEach(m => { if (counts[m.tipoMovimiento?.nombre] !== undefined) counts[m.tipoMovimiento.nombre]++; });
    document.getElementById("res-entradas").textContent = counts.ENTRADA;
    document.getElementById("res-salidas").textContent  = counts.SALIDA;
    document.getElementById("res-mermas").textContent   = counts.MERMA;
    document.getElementById("res-ajustes").textContent  = counts.AJUSTE;

    const iconos = { ENTRADA: "🟢", SALIDA: "🔴", MERMA: "🟡", AJUSTE: "🔵" };
    const tbody = document.getElementById("body-movimientos");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-tabla">Sin movimientos con esos filtros</td></tr>`;
        return;
    }

    datos.forEach((m, i) => {
        const tipo = m.tipoMovimiento?.nombre || "—";
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${formatFecha(m.fechaMovimiento)}</td>
                <td>${m.producto?.nombre || "—"}</td>
                <td><code>${m.producto?.codigoSku || "—"}</code></td>
                <td><span class="tipo-badge tipo-${tipo}">${iconos[tipo] || ""} ${tipo}</span></td>
                <td><strong>${m.cantidad}</strong></td>
                <td>${m.stockResultante}</td>
                <td>${m.canal?.nombre?.replace("_"," ") || "Interno"}</td>
                <td>${m.motivo || "—"}</td>
            </tr>
        `;
    });

    return datos;
}

// ─── RENDER: STOCK ────────────────────────
function renderTabStock() {
    const idCat  = document.getElementById("stock-filtro-cat").value;
    const estado = document.getElementById("stock-filtro-estado").value;

    let datos = allProductos.filter(p => {
        if (idCat  && String(p.idCategoria) !== idCat)  return false;
        if (estado && p.estadoStock !== estado)          return false;
        return true;
    });

    // Valorización
    let totalVenta = 0, totalCosto = 0, sinStock = 0;
    datos.forEach(p => {
        totalVenta += (p.precioVenta || 0) * p.stockActual;
        totalCosto += (p.precioCosto || 0) * p.stockActual;
        if (p.stockActual === 0) sinStock++;
    });
    const margenGlobal = totalVenta > 0
        ? (((totalVenta - totalCosto) / totalVenta) * 100).toFixed(1)
        : 0;

    document.getElementById("val-total").textContent     = `S/ ${totalVenta.toFixed(2)}`;
    document.getElementById("val-costo").textContent     = `S/ ${totalCosto.toFixed(2)}`;
    document.getElementById("val-margen").textContent    = `${margenGlobal}%`;
    document.getElementById("val-sin-stock").textContent = sinStock;

    const badges = { OK: "badge-ok", BAJO: "badge-bajo", SIN_STOCK: "badge-sin-stock" };
    const labels = { OK: "Disponible", BAJO: "Stock bajo", SIN_STOCK: "Sin stock" };

    const tbody = document.getElementById("body-stock");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-tabla">Sin productos con esos filtros</td></tr>`;
        return;
    }

    datos.forEach(p => {
        const valorStock = (p.precioVenta * p.stockActual).toFixed(2);
        const margen     = p.precioCosto && p.precioVenta > 0
            ? (((p.precioVenta - p.precioCosto) / p.precioVenta) * 100).toFixed(1)
            : "—";

        tbody.innerHTML += `
            <tr>
                <td><code>${p.codigoSku}</code></td>
                <td>${p.nombre}</td>
                <td>${p.nombreCategoria || "—"}</td>
                <td><strong>${p.stockActual}</strong></td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${badges[p.estadoStock] || ''}">${labels[p.estadoStock] || "—"}</span></td>
                <td>S/ ${parseFloat(p.precioVenta).toFixed(2)}</td>
                <td>${p.precioCosto ? "S/ " + parseFloat(p.precioCosto).toFixed(2) : "—"}</td>
                <td>S/ ${valorStock}</td>
                <td>${margen !== "—" ? margen + "%" : "—"}</td>
            </tr>
        `;
    });

    return datos;
}

// ─── RENDER: ALERTAS ──────────────────────
function renderTabAlertas() {
    const estado = document.getElementById("alerta-filtro-estado").value;
    const tipo   = document.getElementById("alerta-filtro-tipo").value;

    let datos = allAlertas.filter(a => {
        if (estado && a.estado    !== estado) return false;
        if (tipo   && a.tipoAlerta !== tipo)   return false;
        return true;
    });

    const tbody = document.getElementById("body-alertas-hist");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-tabla">Sin alertas con esos filtros</td></tr>`;
        return;
    }

    datos.forEach((a, i) => {
        const tiempoRespuesta = a.fechaResuelta
            ? calcularTiempoRespuesta(a.fechaGenerada, a.fechaResuelta)
            : "—";

        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${a.producto?.nombre || "—"}</td>
                <td>${a.tipoAlerta === "SIN_STOCK" ? "⛔ Sin stock" : "⚠️ Stock bajo"}</td>
                <td>${a.mensaje}</td>
                <td class="alerta-${a.estado}">${a.estado}</td>
                <td>${formatFecha(a.fechaGenerada)}</td>
                <td>${a.fechaResuelta ? formatFecha(a.fechaResuelta) : "—"}</td>
                <td>${tiempoRespuesta}</td>
            </tr>
        `;
    });

    return datos;
}

// ─── RENDER: VENTAS EVITADAS ──────────────
function renderTabVentasEvitadas() {
    const tbody = document.getElementById("body-ve");
    tbody.innerHTML = "";

    let total = 0;

    if (allVentasEvitadas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-tabla">No hay ventas evitadas registradas aún</td></tr>`;
        document.getElementById("ve-total-count").textContent = "0 ventas";
        document.getElementById("ve-total-valor").textContent = "S/ 0.00";
        document.getElementById("ve-total-tabla").textContent = "S/ 0.00";
        return;
    }

    allVentasEvitadas.forEach((v, i) => {
        const valor = parseFloat(v.valorEstimado || 0);
        total += valor;
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${formatFecha(v.fechaRegistro)}</td>
                <td>${v.producto?.nombre || "—"}</td>
                <td>${v.descripcion || "—"}</td>
                <td><strong>S/ ${valor.toFixed(2)}</strong></td>
            </tr>
        `;
    });

    document.getElementById("ve-total-count").textContent = `${allVentasEvitadas.length} ventas`;
    document.getElementById("ve-total-valor").textContent = `S/ ${total.toFixed(2)}`;
    document.getElementById("ve-total-tabla").textContent = `S/ ${total.toFixed(2)}`;
}

// ─── TABS ─────────────────────────────────
function bindTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
            btn.classList.add("active");
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("hidden");
        });
    });
}

// ─── FILTROS ──────────────────────────────
function bindFiltros() {
    ["mov-filtro-producto","mov-filtro-tipo","mov-filtro-canal"].forEach(id =>
        document.getElementById(id).addEventListener("change", renderTabMovimientos));

    ["stock-filtro-cat","stock-filtro-estado"].forEach(id =>
        document.getElementById(id).addEventListener("change", renderTabStock));

    ["alerta-filtro-estado","alerta-filtro-tipo"].forEach(id =>
        document.getElementById(id).addEventListener("change", renderTabAlertas));
}

// ─── EXPORTAR / IMPRIMIR ──────────────────
function bindExportar() {
    // Movimientos
    document.getElementById("btn-imprimir-mov").addEventListener("click", () =>
        imprimirTabla("tabla-movimientos", "Reporte de Movimientos de Inventario", generarResumenMov));
    document.getElementById("btn-csv-mov").addEventListener("click", () =>
        exportarCSV("tabla-movimientos", "movimientos_inventario"));

    // Stock
    document.getElementById("btn-imprimir-stock").addEventListener("click", () =>
        imprimirTabla("tabla-stock", "Reporte de Estado de Stock", generarResumenStock));
    document.getElementById("btn-csv-stock").addEventListener("click", () =>
        exportarCSV("tabla-stock", "estado_stock"));

    // Alertas
    document.getElementById("btn-imprimir-alertas").addEventListener("click", () =>
        imprimirTabla("tabla-alertas-hist", "Historial de Alertas de Stock"));
    document.getElementById("btn-csv-alertas").addEventListener("click", () =>
        exportarCSV("tabla-alertas-hist", "historial_alertas"));

    // Ventas evitadas
    document.getElementById("btn-imprimir-ve").addEventListener("click", () =>
        imprimirTabla("tabla-ve", "Reporte de Ventas Evitadas de Perder"));
    document.getElementById("btn-csv-ve").addEventListener("click", () =>
        exportarCSV("tabla-ve", "ventas_evitadas"));
}

function generarResumenMov() {
    return `
        <div class="print-summary-box">
            <span>Entradas: <strong>${document.getElementById("res-entradas").textContent}</strong></span>
            <span>Salidas: <strong>${document.getElementById("res-salidas").textContent}</strong></span>
            <span>Mermas: <strong>${document.getElementById("res-mermas").textContent}</strong></span>
            <span>Ajustes: <strong>${document.getElementById("res-ajustes").textContent}</strong></span>
        </div>
    `;
}

function generarResumenStock() {
    return `
        <div class="print-summary-box">
            <span>Valor en venta: <strong>${document.getElementById("val-total").textContent}</strong></span>
            <span>Valor al costo: <strong>${document.getElementById("val-costo").textContent}</strong></span>
            <span>Margen global: <strong>${document.getElementById("val-margen").textContent}</strong></span>
            <span>Sin stock: <strong>${document.getElementById("val-sin-stock").textContent}</strong></span>
        </div>
    `;
}

function imprimirTabla(tablaId, titulo, fnResumen) {
    const tabla   = document.getElementById(tablaId);
    const printArea = document.getElementById("print-area");

    const resumenHtml = fnResumen ? fnResumen() : "";

    // Clonar tabla y limpiar badges HTML para impresión limpia
    const clone = tabla.cloneNode(true);
    clone.className = "print-table";

    // Limpiar spans de badge a solo texto
    clone.querySelectorAll(".badge, .tipo-badge, .badge-estado").forEach(el => {
        el.outerHTML = el.textContent;
    });

    printArea.innerHTML = `
        <div class="print-header">
            <div>
                <div class="print-title">📦 StockSmart — ${titulo}</div>
                <div class="print-meta">Universidad Tecnológica del Perú · Sistema de Inventario</div>
            </div>
            <div class="print-meta" style="text-align:right">
                Generado: ${new Date().toLocaleString("es-PE")}<br>
                Usuario: Administrador
            </div>
        </div>
        ${resumenHtml}
        ${clone.outerHTML}
        <div class="print-footer">
            <span>StockSmart — Sistema Inteligente de Inventario para Pymes Retail</span>
            <span>Página 1</span>
        </div>
    `;

    window.print();
}

function exportarCSV(tablaId, nombreArchivo) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;

    const filas = tabla.querySelectorAll("tr");
    const csv   = [];

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll("th, td");
        const row    = Array.from(celdas).map(c => {
            let texto = c.innerText.trim().replace(/\n/g, " ");
            if (texto.includes(",") || texto.includes('"')) {
                texto = `"${texto.replace(/"/g, '""')}"`;
            }
            return texto;
        });
        csv.push(row.join(","));
    });

    const bom  = "\uFEFF"; // BOM para Excel con UTF-8
    const blob = new Blob([bom + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${nombreArchivo}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── UTILS ────────────────────────────────
function formatFecha(fechaStr) {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleString("es-PE", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function calcularTiempoRespuesta(inicio, fin) {
    const ms      = new Date(fin) - new Date(inicio);
    const horas   = Math.floor(ms / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (horas > 24) return `${Math.floor(horas / 24)}d ${horas % 24}h`;
    return `${horas}h ${minutos}m`;
}
