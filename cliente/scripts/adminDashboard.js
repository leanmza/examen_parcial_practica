document.addEventListener("DOMContentLoaded", async () => {
  const { qs, validarCampos } = window.utils.forms;
  const API = "http://127.0.0.1:5000";

  const form = document.querySelector("#torneos");

  let torneos = [];
  let torneoSeleccionado = null;
  let nombreTorneoSeleccionado = "";

  async function checkAuth() {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.usuario.rol !== "admin") {
      window.location.href = "index.html";
    }
  }

  checkAuth();

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

    container.innerHTML = "";

    torneos.forEach((t) => {
      const card = document.createElement("div");
      card.className = "card shadow-sm torneo-card";
      card.style.cursor = "pointer";

      card.innerHTML = `
      <div class="card-body position-relative row">

        <div class="card-info col-11">

          <h4 class="card-title">${t.nombre_torneo}</h4>

          <h5 class="card-title">
            <i class="fa-regular fa-calendar"></i>
            ${t.fecha}
          </h5>

          <h6 class="card-title">
            <i class="fa-solid fa-location-dot"></i>
            <span class="sede">${t.sede.nombre}, </span>
            ${t.sede.direccion}, ${t.sede.ciudad}
          </h6>
        </div>  
        <div class="torneo-actions col-1">
          <i class="fa-solid fa-pen btn-editar" data-id="${t.id_torneo}"></i>
          <i class="fa-solid fa-trash btn-eliminar" data-id="${t.id_torneo}"></i>
        </div>

      </div>
    `;

      card.addEventListener("click", () => {
        // cerrar panel de edición si está abierto
    
        if (torneoSeleccionado?.id_torneo !== t.id_torneo) {
          document.querySelector(".info-torneo").classList.remove("visible");
        }
            // document.querySelector(".info-torneo").classList.remove("visible");
        torneoSeleccionado = t;
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

        cargarInscriptos(t.id_torneo);
      });

      container.appendChild(card);
    });
  }

  //Abro panel editar torneo
  document.addEventListener("click", (e) => {
    const editar = e.target.closest(".btn-editar");
    if (editar) {
      e.stopPropagation();
      const bloque = document.querySelector(".info-torneo");

      bloque.classList.add("visible");

      // cargar datos en inputs
      document.getElementById("nombre-torneo").value =
        torneoSeleccionado.nombre_torneo;

      document.getElementById("fecha-torneo").value = torneoSeleccionado.fecha;

      document.getElementById("sede-torneo").value =
        torneoSeleccionado.sede.nombre;
    }

    const eliminar = e.target.closest(".btn-eliminar");
    if (eliminar) {
      e.stopPropagation();
      console.log("Eliminar torneo", eliminar.dataset.id);
      return;
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".cerrar-edicion")) {
      document.querySelector(".info-torneo").classList.remove("visible");
    }
  });

  document
    .getElementById("datos-torneo")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const csrf = getCookie("csrf_access_token");

      const formData = new FormData();

      formData.append("id_torneo", torneoSeleccionado.id_torneo);
      formData.append(
        "nombre_torneo",
        document.getElementById("nombre-torneo").value,
      );
      formData.append("id_sede", document.getElementById("sede-torneo").value);
      formData.append("fecha", document.getElementById("fecha-torneo").value);

      try {
        const res = await fetch(`${API}/admin/torneo`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrf,
          },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }

        mostrarToast("Torneo actualizado correctamente", "success");

        const data = await res.json();

        // refrescar torneos
        cargarTorneos();

        document.querySelector(".info-torneo").classList.remove("visible");
      } catch (err) {
        console.error(err);
        mostrarToast("No se pudo actualizar el torneo", "error");
      }
    });

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
     if (!btn) return;
    const row = btn.closest("tr");
    const usuario = row.querySelector("td:nth-child(1)").textContent;
    if (!btn) return;

    const idUsuario = btn.dataset.id;
    const idTorneo = torneoSeleccionado.id_torneo;

    const csrf = getCookie("csrf_access_token");

    const ok = await confirmToast(
      `¿Seguro que querés dar de baja al usuario 
    <span class="fw-bold">${usuario}</span> 
    del torneo 
    <span class="fw-bold">${nombreTorneoSeleccionado}</span>?`,
      "danger",
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
