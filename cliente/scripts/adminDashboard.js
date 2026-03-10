document.addEventListener("DOMContentLoaded", async () => {
  const { qs, validarCampos } = window.utils.forms;
  const API = "http://127.0.0.1:5000";

  const form = document.querySelector("#torneos");

  let torneos = [];
  let torneoSeleccionado = null;
  let nombreTorneoSeleccionado = "";

  // 1. CARGAR TORNEOS (Siempre se ejecuta, no depende del login)
  cargarTorneos();

  function cargarTorneos() {
    fetch(`${API}/torneos`)
      .then((res) => res.json())
      .then((data) => {
        torneos = data;
        renderizarCards(torneos); // Función para dibujar las cards
      })
      .catch((err) => console.error("Error torneos:", err));
  }

  // Cargo los torneos en cards
  function renderizarCards(torneos) {
    const container = document.getElementById("torneos-container");

    torneos.forEach((t) => {
      const card = document.createElement("div");
      card.className = "card shadow-sm torneo-card";
      card.style.cursor = "pointer";

      card.innerHTML = `
  <div class="card-body">
    <h4 class="card-title">${t.nombre_torneo}</h4>
    <h5 class="card-title"> <span><i class="fa-regular fa-calendar"></i> </span>${t.fecha}</h5>
    <h6 class="card-title"> <i class="fa-solid fa-location-dot"></i> <span class="sede">${t.sede.nombre}, </span>  ${t.sede.direccion}, ${t.sede.ciudad}</h6>
  </div>
`;

      // Seteo los efectos visuales al hacer click
      card.addEventListener("click", () => {
        torneoSeleccionado = t.id_torneo;
        nombreTorneoSeleccionado = t.nombre_torneo;

        document.querySelectorAll(".torneo-card").forEach((c) => {
          c.classList.remove("selected", "dimmed");
        });

        card.classList.add("selected");

        document.querySelectorAll(".torneo-card").forEach((c) => {
          if (c !== card) {
            c.classList.add("dimmed");
          }
        });

        // 👇 NUEVO
        cargarInscriptos(t.id_torneo);
      });

      container.appendChild(card);
    });
  }

  // Doy formato a la fecha de nacimiento dd-mm-aaaa
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const [y, m, d] = fechaISO.split("-");
    return `${d}-${m}-${y}`;
  };

  function renderizarTablaInscriptos(inscriptos) {
    const tbody = document.getElementById("tbody-inscriptos");

    tbody.innerHTML = "";

    if (!inscriptos.length) {
      tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No hay inscriptos</td>
      </tr>
    `;
      return;
    }

    inscriptos.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${u.usuario}</td>
      <td>${u.nombre}</td>
      <td>${u.apellido}</td>
      <td>${u.dni}</td>
      <td>${u.telefono}</td>
      <td>${u.email}</td>
      <td>${formatearFecha(u.fecha_nacimiento)}</td>
      <td>
        <button class="btn btn-danger btn-sm btn-borrar" data-id="${u.id_usuario}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

      tbody.appendChild(tr);
    });
  }

  async function cargarInscriptos(idTorneo) {
    const tbody = document.getElementById("tbody-inscriptos");
    tbody.innerHTML = `<tr><td colspan="8">Cargando...</td></tr>`;

    fetch(`${API}/torneos/inscriptos?id_torneo=${idTorneo}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => renderizarTablaInscriptos(data))
      .catch((err) => console.error(err));
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-borrar");
    const row = btn.closest("tr");
    const usuario = row.querySelector("td:nth-child(1)").textContent;
    if (!btn) return;
    

    

    const idUsuario = btn.dataset.id;
    const idTorneo = torneoSeleccionado;

    const csrf = getCookie("csrf_access_token");

    const ok = await confirmToast(
      `¿Seguro que querés dar de baja al usuario 
    <span class="fw-bold">${usuario}</span> 
    del torneo 
    <span class="fw-bold">${nombreTorneoSeleccionado}</span>?`,
    "danger"
    );

    if (!ok) return;

    try {
      const res = await fetch(`${API}/admin/baja-usuario`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_torneo: idTorneo,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      mostrarToast("Usuario eliminado del torneo", "success");

      await cargarInscriptos(idTorneo);
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo eliminar el usuario", "error");
    }
  });
});
