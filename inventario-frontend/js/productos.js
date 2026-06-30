// =========================================
// productos.js — Gestión de Productos
// =========================================

let productos     = [];
let categorias    = [];
let canales       = [];
let vistaActual   = "tarjetas";
let productoDetalleActual = null;

// ─── INIT ────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    Promise.all([cargarCategorias(), cargarCanales()])
        .then(() => cargarProductos());

    bindEventos();
});

// ─── CARGA DE DATOS ──────────────────────
async function cargarCategorias() {
    const res = await fetch(`${API_BASE_URL}/categorias`);
    categorias = await res.json();

    const sel = document.getElementById("filtro-categoria");
    const selForm = document.getElementById("prod-categoria");

    categorias.forEach(c => {
        sel.innerHTML    += `<option value="${c.idCategoria}">${c.nombre}</option>`;
        selForm.innerHTML += `<option value="${c.idCategoria}">${c.nombre}</option>`;
    });
}

async function cargarCanales() {
    const res = await fetch(`${API_BASE_URL}/canales`);
    canales = await res.json();

    // enlaces rápidos navbar
    canales.forEach(c => {
        if (c.nombre === "INSTAGRAM") document.getElementById("link-instagram").href = c.urlEnlace || "#";
        if (c.nombre === "FACEBOOK")  document.getElementById("link-facebook").href  = c.urlEnlace || "#";
        if (c.nombre === "WHATSAPP")  document.getElementById("link-whatsapp").href  = c.urlEnlace || "#";
    });

    // checkboxes de canales en el form
    const wrap = document.getElementById("canales-checks");
    wrap.innerHTML = "";
    const iconos = { TIENDA_FISICA:"🏬", WEB:"🌐", INSTAGRAM:"📷", FACEBOOK:"📘", WHATSAPP:"💬" };
    canales.forEach(c => {
        const label = document.createElement("label");
        label.className = "canal-check-item";
        label.innerHTML = `
            <input type="checkbox" name="canal" value="${c.idCanal}" checked>
            ${iconos[c.nombre] || "🔗"} ${c.nombre.replace("_"," ")}
        `;
        wrap.appendChild(label);
    });
}

async function cargarProductos() {
    const search     = document.getElementById("buscador").value.trim();
    const categoria  = document.getElementById("filtro-categoria").value;
    const estadoFiltro = document.getElementById("filtro-estado").value;

    let url = `${API_BASE_URL}/productos?`;
    if (search)    url += `search=${encodeURIComponent(search)}&`;
    if (categoria) url += `categoria=${categoria}&`;

    try {
        const res = await fetch(url);
        let data  = await res.json();

        if (estadoFiltro) {
            data = data.filter(p => p.estadoStock === estadoFiltro);
        }

        productos = data;
        actualizarContador();
        renderizarVista();
    } catch (e) {
        mostrarToast("Error al cargar productos", "error");
    }
}

// ─── RENDER ──────────────────────────────
function renderizarVista() {
    if (vistaActual === "tarjetas") {
        renderizarTarjetas();
        document.getElementById("vista-tarjetas").classList.remove("hidden");
        document.getElementById("vista-lista").classList.add("hidden");
    } else {
        renderizarLista();
        document.getElementById("vista-lista").classList.remove("hidden");
        document.getElementById("vista-tarjetas").classList.add("hidden");
    }
}

function renderizarTarjetas() {
    const grid = document.getElementById("vista-tarjetas");
    grid.innerHTML = "";

    if (productos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <p>No se encontraron productos con esos filtros.</p>
            </div>`;
        return;
    }

    productos.forEach(p => {
        const pct = calcularPctStock(p);
        const { label, css, fillCss } = estadoInfo(p.estadoStock, p.activo);

        const card = document.createElement("div");
        card.className = `producto-card${p.activo === false ? " inactivo" : ""}`;
        card.innerHTML = `
            <div class="card-img-wrap">
                ${p.imagenUrl
                    ? `<img src="${p.imagenUrl}" alt="${p.nombre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ""}
                <div class="card-img-placeholder" style="${p.imagenUrl ? "display:none" : ""}">📦</div>
                <span class="badge-estado ${css}">${label}</span>
            </div>
            <div class="card-body">
                <span class="card-sku">${p.codigoSku}</span>
                <span class="card-nombre">${p.nombre}</span>
                <span class="card-categoria">${p.nombreCategoria || "Sin categoría"}</span>
                <span class="card-precio">S/ ${parseFloat(p.precioVenta).toFixed(2)}</span>
                <div class="card-stock-info">
                    <span>Stock: <span class="stock-num">${p.stockActual}</span></span>
                    <span>Mín: ${p.stockMinimo}</span>
                </div>
                <div class="stock-bar-wrap">
                    <div class="stock-bar-bg">
                        <div class="stock-bar-fill ${fillCss}" style="width:${pct}%"></div>
                    </div>
                </div>
            </div>
            <div class="card-acciones">
                <button class="btn-detalle" onclick="abrirDetalle(${p.idProducto})">👁 Ver</button>
                <button class="btn-edit" onclick="abrirEditar(${p.idProducto})">✏️ Editar</button>
                <button class="btn-toggle" onclick="confirmarToggle(${p.idProducto})">
                    ${p.activo !== false ? "🚫 Desactivar" : "✅ Activar"}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderizarLista() {
    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;color:#94a3b8;">Sin resultados</td></tr>`;
        return;
    }

    productos.forEach(p => {
        const { label, css } = estadoInfo(p.estadoStock, p.activo);
        tbody.innerHTML += `
            <tr style="${p.activo === false ? "opacity:0.55" : ""}">
                <td>
                    ${p.imagenUrl
                        ? `<img class="thumb" src="${p.imagenUrl}" alt="${p.nombre}" onerror="this.outerHTML='<span class=thumb-placeholder>📦</span>'">`
                        : `<span class="thumb-placeholder">📦</span>`}
                </td>
                <td><code>${p.codigoSku}</code></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.nombreCategoria || "-"}</td>
                <td>S/ ${parseFloat(p.precioVenta).toFixed(2)}</td>
                <td><strong>${p.stockActual}</strong></td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${css}">${label}</span></td>
                <td>${p.activo !== false ? "✅ Sí" : "⛔ No"}</td>
                <td>
                    <div class="acciones-row">
                        <button class="btn btn-secondary btn-sm" onclick="abrirDetalle(${p.idProducto})">Ver</button>
                        <button class="btn btn-primary btn-sm" onclick="abrirEditar(${p.idProducto})">Editar</button>
                        <button class="btn ${p.activo !== false ? "btn-warning" : "btn-secondary"} btn-sm" onclick="confirmarToggle(${p.idProducto})">
                            ${p.activo !== false ? "Desactivar" : "Activar"}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// ─── HELPERS VISUAL ──────────────────────
function estadoInfo(estadoStock, activo) {
    if (activo === false) return { label: "Inactivo",   css: "badge-inactivo",  fillCss: "fill-sin-stock" };
    if (estadoStock === "SIN_STOCK") return { label: "Sin stock", css: "badge-sin-stock", fillCss: "fill-sin-stock" };
    if (estadoStock === "BAJO")      return { label: "Stock bajo", css: "badge-bajo",      fillCss: "fill-bajo" };
    return { label: "Disponible", css: "badge-ok", fillCss: "fill-ok" };
}

function calcularPctStock(p) {
    if (p.stockMinimo === 0) return p.stockActual > 0 ? 100 : 0;
    const pct = (p.stockActual / (p.stockMinimo * 3)) * 100;
    return Math.min(pct, 100);
}

function actualizarContador() {
    document.getElementById("contador-resultados").textContent =
        `${productos.length} producto${productos.length !== 1 ? "s" : ""} encontrado${productos.length !== 1 ? "s" : ""}`;
}

// ─── MODAL: NUEVO ─────────────────────────
function abrirNuevo() {
    document.getElementById("modal-titulo").textContent = "Nuevo producto";
    document.getElementById("form-producto").reset();
    document.getElementById("prod-id").value = "";
    document.getElementById("toggle-activo-wrap").classList.add("hidden");
    document.getElementById("margen-info").classList.add("hidden");
    limpiarImagen();
    resetChecksCanales(true);
    limpiarErrores();
    document.getElementById("modal-producto").classList.remove("hidden");
}

// ─── MODAL: EDITAR ────────────────────────
async function abrirEditar(idProducto) {
    const p = productos.find(x => x.idProducto === idProducto);
    if (!p) return;

    document.getElementById("modal-titulo").textContent = "Editar producto";
    document.getElementById("prod-id").value           = p.idProducto;
    document.getElementById("prod-nombre").value       = p.nombre;
    document.getElementById("prod-sku").value          = p.codigoSku;
    document.getElementById("prod-descripcion").value  = p.descripcion || "";
    document.getElementById("prod-categoria").value    = p.idCategoria || "";
    document.getElementById("prod-precio-venta").value = p.precioVenta;
    document.getElementById("prod-precio-costo").value = p.precioCosto || "";
    document.getElementById("prod-stock-actual").value = p.stockActual;
    document.getElementById("prod-stock-minimo").value = p.stockMinimo;
    document.getElementById("prod-imagen-url").value   = p.imagenUrl || "";
    document.getElementById("prod-activo").checked     = p.activo !== false;

    document.getElementById("toggle-activo-wrap").classList.remove("hidden");

    // Previsualizar imagen si existe
    if (p.imagenUrl) previsualizarImagen(p.imagenUrl);
    else limpiarImagen();

    calcularMargen();
    limpiarErrores();

    // Obtener canales del producto (si el endpoint lo soporta)
    resetChecksCanales(true);

    document.getElementById("modal-producto").classList.remove("hidden");
}

// ─── MODAL: DETALLE ───────────────────────
function abrirDetalle(idProducto) {
    const p = productos.find(x => x.idProducto === idProducto);
    if (!p) return;

    productoDetalleActual = p;

    const { label, css } = estadoInfo(p.estadoStock, p.activo);

    const margen = p.precioCosto
        ? (((p.precioVenta - p.precioCosto) / p.precioVenta) * 100).toFixed(1)
        : null;

    document.getElementById("detalle-contenido").innerHTML = `
        <div>
            ${p.imagenUrl
                ? `<img class="detalle-img" src="${p.imagenUrl}" alt="${p.nombre}" onerror="this.outerHTML='<div class=detalle-img-placeholder>📦</div>'">`
                : `<div class="detalle-img-placeholder">📦</div>`}
        </div>
        <div class="detalle-info">
            <span class="detalle-sku">SKU: ${p.codigoSku}</span>
            <span class="detalle-nombre">${p.nombre}</span>
            <span class="badge-estado ${css}" style="width:fit-content">${label}</span>
            ${p.descripcion ? `<p style="font-size:0.88rem;color:#64748b;margin-top:0.3rem">${p.descripcion}</p>` : ""}
            <div class="detalle-grid-datos">
                <div class="dato-item">
                    <label>Precio de venta</label>
                    <span>S/ ${parseFloat(p.precioVenta).toFixed(2)}</span>
                </div>
                ${p.precioCosto ? `
                <div class="dato-item">
                    <label>Precio de costo</label>
                    <span>S/ ${parseFloat(p.precioCosto).toFixed(2)}</span>
                </div>` : ""}
                ${margen ? `
                <div class="dato-item">
                    <label>Margen bruto</label>
                    <span>${margen}%</span>
                </div>` : ""}
                <div class="dato-item">
                    <label>Stock actual</label>
                    <span>${p.stockActual} uds.</span>
                </div>
                <div class="dato-item">
                    <label>Stock mínimo</label>
                    <span>${p.stockMinimo} uds.</span>
                </div>
                <div class="dato-item">
                    <label>Categoría</label>
                    <span>${p.nombreCategoria || "—"}</span>
                </div>
                <div class="dato-item">
                    <label>Estado</label>
                    <span>${p.activo !== false ? "Activo" : "Inactivo"}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById("modal-detalle").classList.remove("hidden");
}

// ─── MODAL: CONFIRM TOGGLE ───────────────
function confirmarToggle(idProducto) {
    const p = productos.find(x => x.idProducto === idProducto);
    if (!p) return;

    const accion = p.activo !== false ? "desactivar" : "activar";
    document.getElementById("confirm-titulo").textContent  = `${accion.charAt(0).toUpperCase() + accion.slice(1)} producto`;
    document.getElementById("confirm-mensaje").textContent =
        `¿Estás seguro de que deseas ${accion} "${p.nombre}"?`;

    document.getElementById("confirmar-accion").onclick = () => toggleActivo(idProducto);
    document.getElementById("modal-confirm").classList.remove("hidden");
}

async function toggleActivo(idProducto) {
    const p = productos.find(x => x.idProducto === idProducto);
    if (!p) return;

    const dto = { ...p, idCategoria: p.idCategoria, activo: !( p.activo !== false ) };

    try {
        const res = await fetch(`${API_BASE_URL}/productos/${idProducto}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res.ok) throw new Error();

        document.getElementById("modal-confirm").classList.add("hidden");
        mostrarToast(`Producto ${dto.activo ? "activado" : "desactivado"} correctamente`, dto.activo ? "success" : "warning");
        cargarProductos();
    } catch {
        mostrarToast("Error al cambiar el estado del producto", "error");
    }
}

// ─── GUARDAR PRODUCTO (CREAR / EDITAR) ───
async function guardarProducto(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const id = document.getElementById("prod-id").value;
    const esEdicion = !!id;

    const dto = {
        codigoSku:    document.getElementById("prod-sku").value.trim(),
        nombre:       document.getElementById("prod-nombre").value.trim(),
        descripcion:  document.getElementById("prod-descripcion").value.trim(),
        idCategoria:  parseInt(document.getElementById("prod-categoria").value),
        precioVenta:  parseFloat(document.getElementById("prod-precio-venta").value),
        precioCosto:  parseFloat(document.getElementById("prod-precio-costo").value) || null,
        stockActual:  parseInt(document.getElementById("prod-stock-actual").value),
        stockMinimo:  parseInt(document.getElementById("prod-stock-minimo").value),
        imagenUrl:    document.getElementById("prod-imagen-url").value.trim() || null,
        activo:       esEdicion ? document.getElementById("prod-activo").checked : true
    };

    const url    = esEdicion ? `${API_BASE_URL}/productos/${id}` : `${API_BASE_URL}/productos`;
    const method = esEdicion ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const err = await res.json();
            mostrarToast(err.error || "Error al guardar", "error");
            return;
        }

        document.getElementById("modal-producto").classList.add("hidden");
        mostrarToast(esEdicion ? "Producto actualizado ✓" : "Producto creado ✓", "success");
        cargarProductos();
    } catch {
        mostrarToast("Error de conexión", "error");
    }
}

// ─── VALIDACIÓN ──────────────────────────
function validarFormulario() {
    let valido = true;
    limpiarErrores();

    const nombre = document.getElementById("prod-nombre").value.trim();
    const sku    = document.getElementById("prod-sku").value.trim();
    const precio = parseFloat(document.getElementById("prod-precio-venta").value);

    if (!nombre) {
        document.getElementById("err-nombre").textContent = "El nombre es obligatorio";
        document.getElementById("prod-nombre").classList.add("input-error");
        valido = false;
    }
    if (!sku) {
        document.getElementById("err-sku").textContent = "El SKU es obligatorio";
        document.getElementById("prod-sku").classList.add("input-error");
        valido = false;
    }
    if (!precio || precio <= 0) {
        document.getElementById("err-precio").textContent = "Ingresa un precio válido";
        document.getElementById("prod-precio-venta").classList.add("input-error");
        valido = false;
    }

    return valido;
}

function limpiarErrores() {
    document.querySelectorAll(".form-error").forEach(el => el.textContent = "");
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

// ─── IMAGEN ───────────────────────────────
function previsualizarImagen(url) {
    const img         = document.getElementById("imagen-img");
    const placeholder = document.getElementById("imagen-placeholder");
    img.src           = url;
    img.onload        = () => { img.classList.remove("hidden"); placeholder.classList.add("hidden"); };
    img.onerror       = () => { img.classList.add("hidden"); placeholder.classList.remove("hidden"); };
}

function limpiarImagen() {
    const img         = document.getElementById("imagen-img");
    const placeholder = document.getElementById("imagen-placeholder");
    img.src           = "";
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
}

// ─── MARGEN ───────────────────────────────
function calcularMargen() {
    const venta = parseFloat(document.getElementById("prod-precio-venta").value);
    const costo = parseFloat(document.getElementById("prod-precio-costo").value);
    const wrap  = document.getElementById("margen-info");

    if (venta > 0 && costo > 0 && costo < venta) {
        const margen = (((venta - costo) / venta) * 100).toFixed(1);
        document.getElementById("margen-valor").textContent = `${margen}%`;
        wrap.classList.remove("hidden");
    } else {
        wrap.classList.add("hidden");
    }
}

// ─── CANALES CHECKS ───────────────────────
function resetChecksCanales(checked) {
    document.querySelectorAll("#canales-checks input[type=checkbox]")
        .forEach(cb => cb.checked = checked);
}

// ─── TOAST ───────────────────────────────
function mostrarToast(mensaje, tipo = "success") {
    let toast = document.getElementById("toast-global");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-global";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.className   = `toast ${tipo}`;
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ─── BIND EVENTOS ────────────────────────
function bindEventos() {
    document.getElementById("btn-nuevo").addEventListener("click", abrirNuevo);

    document.getElementById("form-producto").addEventListener("submit", guardarProducto);

    ["cerrar-modal","cancelar-form"].forEach(id => {
        document.getElementById(id).addEventListener("click", () =>
            document.getElementById("modal-producto").classList.add("hidden"));
    });

    ["cerrar-confirm","cancelar-confirm"].forEach(id => {
        document.getElementById(id).addEventListener("click", () =>
            document.getElementById("modal-confirm").classList.add("hidden"));
    });

    ["cerrar-detalle","cerrar-detalle-btn"].forEach(id => {
        document.getElementById(id).addEventListener("click", () =>
            document.getElementById("modal-detalle").classList.add("hidden"));
    });

    document.getElementById("editar-desde-detalle").addEventListener("click", () => {
        document.getElementById("modal-detalle").classList.add("hidden");
        if (productoDetalleActual) abrirEditar(productoDetalleActual.idProducto);
    });

    document.getElementById("buscador").addEventListener("input", cargarProductos);
    document.getElementById("filtro-categoria").addEventListener("change", cargarProductos);
    document.getElementById("filtro-estado").addEventListener("change", cargarProductos);

    document.getElementById("btn-tarjetas").addEventListener("click", () => {
        vistaActual = "tarjetas";
        document.getElementById("btn-tarjetas").classList.add("active");
        document.getElementById("btn-lista").classList.remove("active");
        renderizarVista();
    });

    document.getElementById("btn-lista").addEventListener("click", () => {
        vistaActual = "lista";
        document.getElementById("btn-lista").classList.add("active");
        document.getElementById("btn-tarjetas").classList.remove("active");
        renderizarVista();
    });

    document.getElementById("btn-previsualizar").addEventListener("click", () => {
        const url = document.getElementById("prod-imagen-url").value.trim();
        if (url) previsualizarImagen(url);
    });

    document.getElementById("btn-limpiar-img").addEventListener("click", () => {
        document.getElementById("prod-imagen-url").value = "";
        limpiarImagen();
    });

    document.getElementById("prod-precio-venta").addEventListener("input", calcularMargen);
    document.getElementById("prod-precio-costo").addEventListener("input", calcularMargen);

    // Cerrar modales al hacer click fuera
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.classList.add("hidden");
        });
    });
}
