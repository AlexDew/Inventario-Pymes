let categorias = [];
let canales = [];
let productos = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarCanales();
    cargarProductos();

    document.getElementById("buscador").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);

    document.getElementById("btn-nuevo-movimiento").addEventListener("click", () => {
        document.getElementById("modal-movimiento").classList.remove("hidden");
        llenarSelectProductos();
    });
    document.getElementById("cerrar-modal-movimiento").addEventListener("click", () => {
        document.getElementById("modal-movimiento").classList.add("hidden");
    });

    document.getElementById("btn-nuevo-producto").addEventListener("click", () => {
        document.getElementById("modal-producto").classList.remove("hidden");
    });
    document.getElementById("cerrar-modal-producto").addEventListener("click", () => {
        document.getElementById("modal-producto").classList.add("hidden");
    });

    document.getElementById("form-movimiento").addEventListener("submit", registrarMovimiento);
    document.getElementById("form-producto").addEventListener("submit", crearProducto);
});

async function cargarCategorias() {
    const res = await fetch(`${API_BASE_URL}/categorias`);
    categorias = await res.json();

    const filtro = document.getElementById("filtro-categoria");
    const selectProd = document.getElementById("prod-categoria");

    categorias.forEach(cat => {
        filtro.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
        selectProd.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
    });
}

async function cargarCanales() {
    const res = await fetch(`${API_BASE_URL}/canales`);
    canales = await res.json();

    const select = document.getElementById("mov-canal");
    canales.forEach(c => {
        select.innerHTML += `<option value="${c.idCanal}">${c.nombre.replace("_", " ")}</option>`;
    });
}

async function cargarProductos() {
    aplicarFiltros();
}

async function aplicarFiltros() {
    const search = document.getElementById("buscador").value;
    const categoria = document.getElementById("filtro-categoria").value;

    let url = `${API_BASE_URL}/productos?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (categoria) url += `categoria=${categoria}&`;

    const res = await fetch(url);
    productos = await res.json();
    renderizarTabla();
}

function renderizarTabla() {
    const tbody = document.getElementById("tabla-productos-body");
    tbody.innerHTML = "";

    const badgeClass = {
        OK: "badge-ok",
        BAJO: "badge-bajo",
        SIN_STOCK: "badge-sin-stock"
    };

    const badgeText = {
        OK: "Disponible",
        BAJO: "Stock bajo",
        SIN_STOCK: "Sin stock"
    };

    productos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.codigoSku}</td>
                <td>${p.nombre}</td>
                <td>${p.nombreCategoria || "-"}</td>
                <td>${p.stockActual}</td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${badgeClass[p.estadoStock]}">${badgeText[p.estadoStock]}</span></td>
                <td>S/ ${parseFloat(p.precioVenta).toFixed(2)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="verHistorial(${p.idProducto})">Historial</button>
                </td>
            </tr>
        `;
    });
}

function llenarSelectProductos() {
    const select = document.getElementById("mov-producto");
    select.innerHTML = "";
    productos.forEach(p => {
        select.innerHTML += `<option value="${p.idProducto}">${p.nombre} (Stock: ${p.stockActual})</option>`;
    });
}

async function registrarMovimiento(e) {
    e.preventDefault();

    const body = {
        idProducto: parseInt(document.getElementById("mov-producto").value),
        tipoMovimiento: document.getElementById("mov-tipo").value,
        cantidad: parseInt(document.getElementById("mov-cantidad").value),
        idCanal: document.getElementById("mov-canal").value || null,
        idUsuario: 1, // TODO: reemplazar por usuario autenticado
        motivo: document.getElementById("mov-motivo").value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/movimientos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            alert("Error: " + err);
            return;
        }

        document.getElementById("modal-movimiento").classList.add("hidden");
        document.getElementById("form-movimiento").reset();
        aplicarFiltros();
    } catch (error) {
        console.error(error);
        alert("Error al registrar el movimiento");
    }
}

async function crearProducto(e) {
    e.preventDefault();

    const body = {
        codigoSku: document.getElementById("prod-sku").value,
        nombre: document.getElementById("prod-nombre").value,
        descripcion: document.getElementById("prod-descripcion").value,
        idCategoria: parseInt(document.getElementById("prod-categoria").value),
        precioVenta: parseFloat(document.getElementById("prod-precio-venta").value),
        precioCosto: parseFloat(document.getElementById("prod-precio-costo").value) || null,
        stockActual: parseInt(document.getElementById("prod-stock-actual").value),
        stockMinimo: parseInt(document.getElementById("prod-stock-minimo").value)
    };

    try {
        const res = await fetch(`${API_BASE_URL}/productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            alert("Error: " + err);
            return;
        }

        document.getElementById("modal-producto").classList.add("hidden");
        document.getElementById("form-producto").reset();
        aplicarFiltros();
    } catch (error) {
        console.error(error);
        alert("Error al crear el producto");
    }
}

document.getElementById("cerrar-modal-historial").addEventListener("click", () => {
    document.getElementById("modal-historial").classList.add("hidden");
});

async function verHistorial(idProducto) {
    const producto = productos.find(p => p.idProducto === idProducto);
    document.getElementById("historial-producto-nombre").textContent =
        producto ? `${producto.nombre} (SKU: ${producto.codigoSku})` : "";

    const res = await fetch(`${API_BASE_URL}/movimientos/producto/${idProducto}`);
    const movimientos = await res.json();

    const tbody = document.getElementById("historial-body");
    tbody.innerHTML = "";

    const iconoTipo = {
        ENTRADA: "🟢",
        SALIDA:  "🔴",
        MERMA:   "🟡",
        AJUSTE:  "🔵"
    };

    if (movimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Sin movimientos registrados</td></tr>`;
    } else {
        movimientos.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td>${new Date(m.fechaMovimiento).toLocaleString("es-PE")}</td>
                    <td>${iconoTipo[m.tipoMovimiento?.nombre] || ""} ${m.tipoMovimiento?.nombre || "-"}</td>
                    <td>${m.cantidad}</td>
                    <td>${m.stockResultante}</td>
                    <td>${m.canal?.nombre?.replace("_", " ") || "Interno"}</td>
                    <td>${m.motivo || "-"}</td>
                </tr>
            `;
        });
    }

    document.getElementById("modal-historial").classList.remove("hidden");
}