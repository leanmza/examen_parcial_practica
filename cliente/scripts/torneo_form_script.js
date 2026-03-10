document.addEventListener("DOMContentLoaded", async () => {
  const { qs, validarCampos } = window.utils.forms;
  const API = "http://127.0.0.1:5000";

  // Referencias a los contenedores de la columna derecha
  const loginRequiredDiv = document.getElementById("login-required");
  const cardInscripcion = document.getElementById("card-inscripcion");

  const form = document.querySelector("#torneos");

  let torneos = [];
  let user = null;

  // 1. CARGAR TORNEOS (Siempre se ejecuta, no depende del login)
  cargarTorneos();

  // 2. VERIFICAR SESIÓN Y MOSTRAR COLUMNA CORRESPONDIENTE
  try {
    const res = await fetch(`${API}/user/me`, { credentials: "include" });
    const data = await res.json();

    if (data.logged) {
      // Usuario logueado: Mostramos formulario, ocultamos aviso
      loginRequiredDiv.classList.add("d-none");
      cardInscripcion.classList.remove("d-none");

      // Cargamos los datos en los inputs
      await cargarUsuarioLogueado();
    } else {
      // Usuario no logueado: Mostramos aviso, ocultamos formulario
      loginRequiredDiv.classList.remove("d-none");
      cardInscripcion.classList.add("d-none");
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    // En caso de error de red, mostramos el aviso de login por seguridad
    loginRequiredDiv.classList.remove("d-none");
    cardInscripcion.classList.add("d-none");
  }

  // --- FUNCIONES AUXILIARES ---

  async function cargarUsuarioLogueado() {
    try {
      const res = await fetch(`${API}/user/me`, { credentials: "include" });
      const data = await res.json();

      if (!data.logged) return;

      user = data.usuario;

      // Autocompletar con seguridad (si el elemento existe)
      if (qs("#nombre")) qs("#nombre").value = user.nombre || "";
      if (qs("#apellido")) qs("#apellido").value = user.apellido || "";
      if (qs("#dni")) qs("#dni").value = user.dni || "";
      if (qs("#telefono")) qs("#telefono").value = user.telefono || "";
      if (qs("#email")) qs("#email").value = user.email || "";

      if (user.nacimiento && qs("#nacimiento")) {
        const fecha = new Date(user.nacimiento);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate() + 1).padStart(2, "0");
        qs("#nacimiento").value = `${anio}-${mes}-${dia}`;

      }

      // Bloquear campos
      [
        "#nombre",
        "#apellido",
        "#dni",
        "#telefono",
        "#email",
        "#nacimiento",
      ].forEach((sel) => {
        const el = qs(sel);
        if (el) el.setAttribute("readonly", true);
      });
    } catch (e) {
      console.error("Error cargando datos de usuario:", e);
    }
  }
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
    <h6 class="card-title"> <i class="fa-solid fa-location-dot"></i> <span class="sede">${t.sede.nombre}, </span> </h6>
    <h6 class="card-title">      ${t.sede.direccion}, ${t.sede.ciudad}
    </h6>
  </div>
`;

      // Seteo los efectos visuales al hacer click
      card.addEventListener("click", () => {
        const hiddenInput = qs("#torneoSeleccionado");
        hiddenInput.value = t.id_torneo;

        document.querySelectorAll(".torneo-card").forEach((c) => {
          c.classList.remove("selected", "dimmed");
        });

        card.classList.add("selected");

        document.querySelectorAll(".torneo-card").forEach((c) => {
          if (c !== card) {
            c.classList.add("dimmed");
          }
        });
      });

      container.appendChild(card);
    });

    // Doy formato a la fecha de nacimiento dd-mm-aaaa
    const formatearFecha = (fechaISO) => {
      if (!fechaISO) return "-";
      const [y, m, d] = fechaISO.split("-");
      return `${d}-${m}-${y}`;
    };

    // Genero identificador alfanumérico aleatorio (10 caracteres)
    const generarIdentificador = (len = 10) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let out = "";
      for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return out;
    };

    // Especifíco los elementos del DOM a revisar: el id del input "#",
    // el id del label y el mensaje de erro
    const campos = [
      { el: "#nombre", label: "#label-nombre", msg: "Campo obligatorio" },
      { el: "#apellido", label: "#label-apellido", msg: "Campo obligatorio" },
      { el: "#telefono", label: "#label-telefono", msg: "Campo obligatorio" },
      {
        el: "#nacimiento",
        label: "#label-nacimiento",
        msg: "Campo obligatorio",
      },
      { el: "#dni", label: "#label-dni", msg: "Campo obligatorio" },
      { el: "#email", label: "#label-email", msg: "Campo obligatorio" },
      { el: "#sede", label: "#label-sede", msg: "Debes seleccionar una sede" },
      {
        el: "#fecha",
        label: "#label-fecha",
        msg: "Debes seleccionar una fecha",
      },
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Llamo a la función de validar campos y si devuelve false detiene el envio del formulario
      if (!validarCampos(campos)) return;

      // Llamo a la función para validar si el usuario está logueado y si devuelve false me manda al login
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      const csrf = getCookie("csrf_access_token");

      const identificador = generarIdentificador();
      const hiddenInput = qs("#torneoSeleccionado");

      if (!hiddenInput || !hiddenInput.value) {
        mostrarToast("Debes seleccionar un torneo", "warning");
        return;
      }

      const idTorneo = hiddenInput.value;
      const fechaInscripcion = new Date().toISOString().split("T")[0];

      const torneo = torneos.find(
        (t) => String(t.id_torneo) === String(idTorneo),
      );

      if (!torneo) {
        mostrarToast("Torneo inválido", "error");
        return;
      }
      // Creo un objeto con lo datos a persistir, el idUsuario lo saca el backend
      const data = new FormData();
      data.append("identificador", identificador);
      data.append("id_torneo", idTorneo);
      data.append("fecha_inscripcion", fechaInscripcion);
      console.log(idTorneo);

      // Envió el objeto, si no hay problemas muestra un mensaje de exito,
      // caso contrario, un mensaje de error
      try {
        const res = await fetch(`${API}/torneos/usuario-registro`, {
          method: "POST",
          body: data,
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrf,
          },
        });

        const responseData = await res.json();
        if (res.ok) {
          // Generar el comprobante
          generarPDF({
            nombre: qs("#nombre").value,
            apellido: qs("#apellido").value,
            telefono: qs("#telefono").value,
            nacimientoFecha: formatearFecha(qs("#nacimiento").value),
            dni: qs("#dni").value,
            email: qs("#email").value,
            torneo: torneo.nombre_torneo,
            sedeElegida: torneo.sede,
            fechaElegida: torneo.fecha,
            identificador,
            fechaInscripcion,
          });

          mostrarToast(
            "¡Inscripción exitosa! Se generó tu comprobante en PDF",
            "success",
          );

          // --- LIMPIEZA DE LA COLUMNA COL-CARDS ---

          // 1. Resetear el input oculto
          hiddenInput.value = "";

          
          document.querySelectorAll(".torneo-card").forEach((c) => {
            c.classList.remove("selected", "dimmed");
          });

    
        }

        // Otros errores del backend
        if (!res.ok) {
          mostrarToast(`${responseData.error}`, "error");
          return;
        }

        // Éxito
        generarPDF({
          nombre: qs("#nombre").value,
          apellido: qs("#apellido").value,
          telefono: qs("#telefono").value,
          nacimientoFecha: formatearFecha(qs("#nacimiento").value),
          dni: qs("#dni").value,
          email: qs("#email").value,
          torneo: torneo.nombre_torneo,
          sedeElegida: torneo.sede,
          fechaElegida: torneo.fecha,
          identificador,
          fechaInscripcion,
        });
        mostrarToast(
          "¡Inscripción exitosa! Se generó tu comprobante en PDF",
          "success",
        );

        hiddenInput.value = "";
        document
          .querySelectorAll(".torneo-card")
          .forEach((c) => c.classList.remove("border-primary"));
      } catch (error) {
        console.error("Error inesperado:", error);
        mostrarToast("Error de conexión con el servidor", "error");
      }
    };

    if (form) form.addEventListener("submit", handleSubmit);
  }
});
