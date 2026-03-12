document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://127.0.0.1:5000";

  const state = {
    torneos: [],
    torneoSeleccionado: null,
    sedes: [],
  };

  /* =========================
     AUTH
  ========================= */

  async function checkAuth() {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.usuario.rol !== "admin") {
      window.location.href = "index.html";
    }
  }

  await checkAuth();

  /* =========================
     TORNEOS
  ========================= */

  cargarTorneos();

  async function cargarTorneos() {
    try {
      const res = await fetch(`${API}/torneos`);
      const data = await res.json();

      state.torneos = data;

      renderizarCards(data);
    } catch (err) {
      mostrarToast(`Error torneo: ${err}`, erro);
      console.error("Error torneos:", err);
    }
  }

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
            <i class="fa-solid fa-trash btn-eliminar"
              data-id="${t.id_torneo}"
              data-nombre="${t.nombre_torneo}">
            </i>
          </div>

        </div>
      `;

      card.addEventListener("click", () => seleccionarTorneo(t, card));

      container.appendChild(card);
    });
  }

  function seleccionarTorneo(t, card) {
    if (state.torneoSeleccionado?.id_torneo !== t.id_torneo) {
      cerrarEdicion();
    }

    state.torneoSeleccionado = t;

    document.querySelectorAll(".torneo-card").forEach((c) => {
      c.classList.remove("selected", "dimmed");
    });

    card.classList.add("selected");

    document.querySelectorAll(".torneo-card").forEach((c) => {
      if (c !== card) c.classList.add("dimmed");
    });

    cargarInscriptos(t.id_torneo);
  }

  async function cargarSedes() {
    try {
      const res = await fetch(`${API}/sedes`, {
        credentials: "include",
      });

      const data = await res.json();

      state.sedes = data;
    } catch (err) {
      console.error("Error cargando sedes:", err);
    }
  }

  /* =========================
    SEDES
  ========================= */
  async function cargarSedes() {
    try {
      const res = await fetch(`${API}/sedes`, {
        credentials: "include",
      });

      const data = await res.json();

      state.sedes = data;
    } catch (err) {
      console.error("Error cargando sedes:", err);
    }
  }

  await cargarSedes();

  function renderizarSelectSedes(idSedeSeleccionada) {
    const select = document.getElementById("sede-torneo");

    select.innerHTML = "";

    state.sedes.forEach((sede) => {
      const option = document.createElement("option");

      option.value = sede.id_sede;
      option.textContent = `${sede.nombre} - ${sede.ciudad} (${sede.direccion})`;

      if (sede.id_sede === idSedeSeleccionada) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }

  /* =========================
     EVENTOS CLICK (UNICO)
  ========================= */

  document.addEventListener("click", manejarClicks);

  async function manejarClicks(e) {
    const editar = e.target.closest(".btn-editar");
    if (editar) {
      e.stopPropagation();
      return abrirEdicion();
    }

    const eliminar = e.target.closest(".btn-eliminar");
    if (eliminar) {
      e.stopPropagation();
      return eliminarTorneo(eliminar.dataset.id, eliminar.dataset.nombre);
    }

    const borrar = e.target.closest(".btn-borrar");
    if (borrar) {
      return eliminarInscripto(borrar);
    }

    const cerrar = e.target.closest(".cerrar-edicion");
    if (cerrar) {
      return cerrarEdicion();
    }
  }

  /* =========================
     ELIMINAR TORNEO
  ========================= */
  async function eliminarTorneo(id_torneo, nombre) {
    const idTorneo = state.torneoSeleccionado.id_torneo;

    const csrf = getCookie("csrf_access_token");

    const ok = await confirmToast(
      `¿Seguro que querés dar de baja el torneo 
      <span class="fw-bold"> ${nombre}</span>?`,
      "danger",
    );

    if (!ok) return;

    try {
      const res = await fetch(`${API}/admin/torneo`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          id_torneo: idTorneo,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      mostrarToast("Torneo eliminado", "success");

      await cargarTorneos();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo eliminar el torneo", "error");
    }
  }

  /* =========================
     EDICION TORNEO
  ========================= */

  function abrirEdicion() {
    const bloque = document.querySelector(".info-torneo");
    bloque.classList.add("visible");

    const t = state.torneoSeleccionado;

    document.getElementById("nombre-torneo").value = t.nombre_torneo;

    const [d, m, y] = t.fecha.split("-");
    document.getElementById("fecha-torneo").value = `${y}-${m}-${d}`;

    renderizarSelectSedes(t.sede.id_sede);
  }

  function cerrarEdicion() {
    document.querySelector(".info-torneo").classList.remove("visible");
  }

  document
    .getElementById("datos-torneo")
    .addEventListener("submit", editarTorneo);

  async function editarTorneo(e) {
    e.preventDefault();

    const csrf = getCookie("csrf_access_token");

    const formData = new FormData();

    formData.append("id_torneo", state.torneoSeleccionado.id_torneo);
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

      await cargarTorneos();

      cerrarEdicion();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo actualizar el torneo", "error");
    }
  }

  /* =========================
     INSCRIPTOS
  ========================= */

  async function cargarInscriptos(idTorneo) {
    const tbody = document.getElementById("tbody-inscriptos");

    tbody.innerHTML = `<tr><td colspan="8">Cargando...</td></tr>`;

    try {
      const res = await fetch(
        `${API}/torneos/inscriptos?id_torneo=${idTorneo}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      renderizarTablaInscriptos(data);
    } catch (err) {
      console.error(err);
    }
  }

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

  /* =========================
     ELIMINAR INSCRIPTO
  ========================= */

  async function eliminarInscripto(btn) {
    const row = btn.closest("tr");
    const usuario = row.querySelector("td:nth-child(1)").textContent;

    const idUsuario = btn.dataset.id;
    const idTorneo = state.torneoSeleccionado.id_torneo;

    const csrf = getCookie("csrf_access_token");

    const ok = await confirmToast(
      `¿Seguro que querés dar de baja al usuario 
      <span class="fw-bold">${usuario}</span> 
      del torneo 
      <span class="fw-bold">${state.torneoSeleccionado.nombre_torneo}</span>?`,
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
  }

  /* =========================
     UTIL
  ========================= */

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const [y, m, d] = fechaISO.split("-");
    return `${d}-${m}-${y}`;
  }
});
