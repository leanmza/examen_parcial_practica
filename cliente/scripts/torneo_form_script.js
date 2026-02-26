document.addEventListener("DOMContentLoaded", async () => {
  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { qs, validarCampos } = window.utils.forms;
  const API = "http://127.0.0.1:5000";
  const toast = new bootstrap.Toast(document.getElementById("miToast"));

  // Primero controlo que el usuario este logueado
  try {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!data.logged) {
      sessionStorage.setItem(
        "toastMensaje",
        "Tenés que iniciar sesión para inscribirte en los torneos",
      );

      sessionStorage.setItem("toastTipo", "warning");

      window.location.href = "login.html?redirect=torneoForm.html";
      return;
    }
  } catch (error) {
    window.location.href = "login.html";
  }

  const form = document.querySelector("#torneoForm");

  let torneos = [];
  let user;

  // Lee datos almacenados en el navegador, específicamente obtiene el token CSRF
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  }

  // Cargo usuario logueado
  async function cargarUsuarioLogueado() {
    try {
      const res = await fetch(`${API}/user/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.logged) return;

      user = data.usuario; //inicializo user

      // Autocompletar
      qs("#nombre").value = user.nombre;
      qs("#apellido").value = user.apellido;
      qs("#dni").value = user.dni;
      qs("#telefono").value = user.telefono;
      qs("#email").value = user.email;
      if (user.nacimiento) {
        const fecha = new Date(user.nacimiento);

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate() + 1).padStart(2, "0");

        qs("#nacimiento").value = `${anio}-${mes}-${dia}`;
      }

      console.log(anio, mes, dia);

      // Bloquear campos
      [
        "#nombre",
        "#apellido",
        "#dni",
        "#telefono",
        "#email",
        "#nacimiento",
      ].forEach((sel) => {
        qs(sel).setAttribute("readonly", true);
      });
    } catch (e) {
      console.error("No hay sesión activa");
    }
  }

  cargarUsuarioLogueado();

  // Cargo los torneos en cards
  fetch(`${API}/torneos`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      torneos = data;

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
    })
    .catch((error) => {
      console.error("Error al obtener torneos:", error);
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
    { el: "#nacimiento", label: "#label-nacimiento", msg: "Campo obligatorio" },
    { el: "#dni", label: "#label-dni", msg: "Campo obligatorio" },
    { el: "#email", label: "#label-email", msg: "Campo obligatorio" },
    { el: "#sede", label: "#label-sede", msg: "Debes seleccionar una sede" },
    { el: "#fecha", label: "#label-fecha", msg: "Debes seleccionar una fecha" },
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
      alert("Debes seleccionar un torneo");
      return;
    }

    const idTorneo = hiddenInput.value;
    const fechaInscripcion = new Date().toISOString().split("T")[0];

    const torneo = torneos.find(
      (t) => String(t.id_torneo) === String(idTorneo),
    );

    if (!torneo) {
      alert("Torneo inválido");
      return;
    }
   // Creo un objeto con lo datos a persistir, el idUsuario lo saca el backend
    const data = new FormData();
    data.append("identificador", identificador);
    data.append("id_torneo", idTorneo);
    data.append("fecha_inscripcion", fechaInscripcion);

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

      // Usuario ya inscripto
      if (res.status === 409) {
        alert("⚠️ Ya estás inscripto en este torneo.");
        return;
      }

      // Otros errores del backend
      if (!res.ok) {
        alert(responseData.error || "Error al enviar la inscripción");
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

      alert("¡Inscripción exitosa! Se generó tu comprobante en PDF.");

      hiddenInput.value = "";
      document
        .querySelectorAll(".torneo-card")
        .forEach((c) => c.classList.remove("border-primary"));
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Error de conexión con el servidor");
    }
  };

  if (form) form.addEventListener("submit", handleSubmit);
});
