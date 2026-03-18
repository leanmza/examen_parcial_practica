document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://127.0.0.1:5000";

  const state = {
    sedes: [],
    sedeSeleccionada: null,
  };

  /* =========================
     AUTH
  ========================= */

  async function checkAuth() {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.rol !== "admin") {
      window.location.href = "index.html";
    }
  }

  await checkAuth();

  /* =========================
    SEDES
  ========================= */

  cargarSedes();

  async function cargarSedes() {
    try {
      const res = await fetch(`${API}/sedes`, {
        credentials: "include",
      });
      const data = await res.json();

      state.sedes = data;

      renderizarCards(data);
    } catch (err) {
      mostrarToast(`Error sedes: ${err}`, "error");
      console.error("Error sedes:", err);
    }
  }

  function renderizarCards(sedes) {
    const container = document.getElementById("sedes-container");
    container.innerHTML = "";

    sedes.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card shadow-sm sede-card";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="card-body position-relative row">

          <div class="card-info col-11">

            <h4 class="card-title">${s.nombre}</h4>

            <h5 class="card-title">
             <i class="fa-solid fa-location-dot"></i> ${s.direccion},
              <span class="sede-ubicacion">
              ${s.ciudad}, ${s.pais}
              </span>
            </h5>
          </div>

          <div class="sede-actions col-1">
            <i class="fa-solid fa-pen btn-editar" data-id="${s.id_sede}"></i>
            <i class="fa-solid fa-trash btn-eliminar"
              data-id="${s.id_sede}"
              data-nombre="${s.nombre}">
            </i>
          </div>

        </div>
      `;

      card.dataset.id = s.id_sede;

      container.appendChild(card);
    });
  }

  function seleccionarSede(s, card) {
    if (state.sedeSeleccionada?.id_sede !== s.id_sede) {
      cerrarEdicion();
      console.log(s.id_sede);

      console.log(state.sedeSeleccionada);
    }

    state.sedeSeleccionada = s;

    document.querySelectorAll(".sede-card").forEach((c) => {
      c.classList.remove("selected", "dimmed");
    });

    card.classList.add("selected");

    document.querySelectorAll(".sede-card").forEach((c) => {
      if (c !== card) c.classList.add("dimmed");
    });
  }

  document
    .querySelectorAll("#filtro-estado, #filtro-ciudad, #filtro-sede")
    .forEach((el) => {
      el.addEventListener("input", aplicarFiltros);
      el.addEventListener("change", aplicarFiltros);
    });

  /* =========================
     EVENTOS CLICK 
  ========================= */

  document.addEventListener("click", manejarClicks);

  async function manejarClicks(e) {
    const editar = e.target.closest(".btn-editar");
    if (editar) {
      e.stopPropagation();

      const id = editar.dataset.id;
      const sede = state.sedes.find((s) => s.id_sede == id);

      if (!sede) return;

      state.sedeSeleccionada = sede;

      abrirEdicion();
      return;
    }

    const eliminar = e.target.closest(".btn-eliminar");
    if (eliminar) {
      e.stopPropagation();
      return eliminarSede(eliminar.dataset.id, eliminar.dataset.nombre);
    }

    const cerrar = e.target.closest(".cerrar-edicion");
    if (cerrar) {
      return cerrarEdicion();
    }

    const close = e.target.closest(".cerrar-guardar");
    if (close) {
      return cerrarGuardar();
    }

    const guardar = e.target.closest(".btn-nueva-sede");
    if (guardar) {
      e.stopPropagation();
      return abrirGuardar();
    }

    const filtrar = e.target.closest(".filter-icon");
    if (filtrar) {
      e.stopPropagation();
      return mostrarFiltros();
    }

    const card = e.target.closest(".sede-card");
    if (card) {
      const id = card.dataset.id;
      const sede = state.sedes.find((s) => s.id_sede == id);

      if (!sede) return;

      seleccionarSede(sede, card);
      return;
    }
  }

  async function mostrarFiltros() {
    const bloqueFiltros = document.querySelector(".filtros-sedes");
    bloqueFiltros.classList.toggle("visible");
  }

  /* =========================
     ELIMINAR SEDE
  ========================= */
  async function eliminarSede(id_sede, nombre) {
    const idSede = id_sede;
    console.log(idSede);

    const csrf = getCookie("csrf_access_token");

    const ok = await confirmToast(
      `¿Seguro que querés dar de baja la sede 
      <span class="fw-bold"> ${nombre}</span>?`,
      "danger",
    );

    if (!ok) return;

    try {
      const res = await fetch(`${API}/sedes`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          id_sede: idSede,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      mostrarToast("Sede eliminada", "success");

      await cargarSedes();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo eliminar la sede", "error");
    }
  }

  /* =========================
     EDICION TORNEO
  ========================= */

  function abrirEdicion() {
    cerrarGuardar();

    const bloque = document.querySelector(".info-sede");
    bloque.classList.add("visible");

    const s = state.sedeSeleccionada;
    if (!s) return;

    document.getElementById("nombre-sede").value = s.nombre;
    document.getElementById("direccion-sede").value = s.direccion;
    document.getElementById("ciudad-sede").value = s.ciudad;
    document.getElementById("pais-sede").value = s.pais;
  }

  function cerrarEdicion() {
    document.querySelector(".info-sede").classList.remove("visible");
  }

  document.getElementById("datos-sede").addEventListener("submit", editarSede);

  async function editarSede(e) {
    e.preventDefault();

    const csrf = getCookie("csrf_access_token");

    const formData = new FormData();

    formData.append("id_sede", state.sedeSeleccionada.id_sede);
    formData.append("nombre", document.getElementById("nombre-sede").value);
    formData.append(
      "direccion",
      document.getElementById("direccion-sede").value,
    );
    formData.append("ciudad", document.getElementById("ciudad-sede").value);
    formData.append("pais", document.getElementById("pais-sede").value);
    console.log(formData);

    try {
      const res = await fetch(`${API}/sedes`, {
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

      mostrarToast("Sede actualizada correctamente", "success");

      await cargarSedes();

      cerrarEdicion();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo actualizar la sede", "error");
    }
  }

  /* =========================
     GUARDAR TORNEO
  ========================= */

  function abrirGuardar() {
    cerrarEdicion();
    const bloque = document.querySelector(".crear-sede");
    bloque.classList.add("visible");

  }

  function cerrarGuardar() {
    document.querySelector(".crear-sede").classList.remove("visible");
  }

  document
    .getElementById("nueva-sede")
    .addEventListener("submit", guardarSede);

  async function guardarSede(e) {
    e.preventDefault();

    const csrf = getCookie("csrf_access_token");

    const formData = new FormData();

    formData.append(
      "nombre",
      document.getElementById("nombre-nueva-sede").value,
    );
    formData.append(
      "direccion",
      document.getElementById("direccion-nueva-sede").value,
    );
    formData.append(
      "ciudad",
      document.getElementById("ciudad-nueva-sede").value,
    );
    formData.append("pais", document.getElementById("pais-nueva-sede").value);
    try {
      const res = await fetch(`${API}/sedes`, {
        method: "POST",
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

      mostrarToast("Sede guardada correctamente", "success");

      await cargarSedes();

      cerrarGuardar();
    } catch (err) {
      console.error(err);
      mostrarToast("No se pudo guardar la sede", "error");
    }
  }

  /* =========================
     UTIL
  ========================= */


  function aplicarFiltros() {
    const ciudad = document.getElementById("filtro-ciudad").value.toLowerCase();
    const sede = document.getElementById("filtro-sede").value.toLowerCase();

    const hoy = new Date();

    const filtrados = state.torneos.filter((t) => {
      if (ciudad && !t.sede.ciudad.toLowerCase().includes(ciudad)) return false;

      if (sede && !t.sede.nombre.toLowerCase().includes(sede)) return false;

      return true;
    });

    renderizarCards(filtrados);

    if (state.sedeSeleccionada) {
      const card = document.querySelector(
        `[data-id="${state.torneoSeleccionado.id_torneo}"]`,
      );
    }
  }
});
