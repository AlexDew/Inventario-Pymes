document.addEventListener("DOMContentLoaded", () => {
    cargarAlertas("ACTIVA");

    document.querySelectorAll(".filtro-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            cargarAlertas(btn.dataset.estado);
        });
    });
});

async function cargarAlertas(estado) {
    let url = `${API_BASE_URL}/alertas`;
    if (estado) url += `?estado=${estado}`;

    const res = await fetch(url);
    const alertas = await res.json();

    const contenedor = document.getElementById("lista-alertas");
    contenedor.innerHTML = "";

    if (alertas.length === 0) {
        contenedor.innerHTML = "<p>No hay alertas para mostrar.</p>";
        return;
    }

    alertas.forEach(a => {
        const div = document.createElement("div");
        div.className = `alerta-item ${a.estado === "RESUELTA" ? "resuelta" : ""}`;

        div.innerHTML = `
            <div>
                <p class="alerta-mensaje">${a.mensaje}</p>
                <p class="alerta-fecha">${new Date(a.fechaGenerada).toLocaleString("es-PE")}</p>
            </div>
            ${a.estado === "ACTIVA" ? `<button class="btn btn-primary" onclick="resolverAlerta(${a.idAlerta})">Marcar resuelta</button>` : ""}
        `;

        contenedor.appendChild(div);
    });
}

async function resolverAlerta(idAlerta) {
    await fetch(`${API_BASE_URL}/alertas/${idAlerta}/resolver`, { method: "PUT" });
    document.querySelector(".filtro-btn.active").click();
}