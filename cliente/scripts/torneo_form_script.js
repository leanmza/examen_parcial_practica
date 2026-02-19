document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#torneoForm");

  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { qs, validarCampos } = window.utils.forms;
  const API = "http://127.0.0.1:5000";

  let torneos = [];
  let user;

  /* ===========================
   Cargo usuario logueado
=========================== */

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

  /* ------------------------------------
   Traigo los torneos del back 
   --------------------------------------*/

  fetch(`${API}/torneos`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      torneos = data;

      const selectSede = document.getElementById("sede");
      const selectFecha = document.getElementById("fecha");

      const sedesUsadas = new Set();

      // Reset
      selectSede.innerHTML =
        '<option value="" selected hidden disabled>Selecciona una sede</option>';
      selectFecha.innerHTML =
        '<option value="" selected hidden disabled>Selecciona una fecha</option>';

      // Cargar sedes únicas
      torneos.forEach((t) => {
        if (!sedesUsadas.has(t.sede.nombre)) {
          sedesUsadas.add(t.sede.nombre);

          const option = document.createElement("option");
          option.value = t.sede.id_sede;
          option.textContent = `${t.sede.nombre} (${t.sede.ciudad})`;
          selectSede.appendChild(option);
        }
      });
    })
    .catch((error) => {
      console.error("Error al obtener torneos:", error);
    });

  // ----------------------------------------------------
  // REVISO SI EL JUGADOR YA ESTA INSCRIPTO EN EL TORNEO
  // ----------------------------------------------------

  async function validarInscripcion(idTorneo, idJugador) {
    try {
      const params = new URLSearchParams({
        id_torneo: idTorneo,
        id_usuario: idJugador,
      });

      const res = await fetch(
        `${API}/torneos/validar-inscripcion?${params.toString()}`,
        { method: "GET" },
      );

      const data = await res.json();

      return data.existe;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /* ===========================
   FECHAS SEGÚN SEDE
=========================== */
  const sedeSelect = document.getElementById("sede");
  const fechaSelect = document.getElementById("fecha");

  sedeSelect.addEventListener("change", () => {
    const idSedeSeleccionada = sedeSelect.value;

    fechaSelect.innerHTML =
      '<option value="" selected hidden disabled>Selecciona una fecha</option>';

    torneos
      .filter((t) => String(t.sede.id_sede) === idSedeSeleccionada)
      .forEach((t) => {
        const option = document.createElement("option");
        option.value = t.id_torneo;
        option.textContent = t.fecha;
        fechaSelect.appendChild(option);
      });
  });

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const [y, m, d] = fechaISO.split("-");
    return `${d}-${m}-${y}`;
  };

  // Generar identificador alfanumérico aleatorio (10 caracteres)
  const generarIdentificador = (len = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  };

  // Handler de envío (homogéneo al de contacto)
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
    if (!validarCampos(campos)) return;

    console.log(user);
    
    const identificador = generarIdentificador();
    const idTorneo = qs("#fecha").value;
    const fechaInscripcion = new Date().toISOString().split("T")[0];

    const torneo = torneos.find((t) => String(t.id_torneo) === idTorneo);
    if (!torneo) {
      alert("Torneo inválido");
      return;
    }

   const data = new FormData();

    data.append("id_usuario", user.id_usuario);
    data.append("identificador", identificador);
    data.append("id_torneo", idTorneo);
    data.append("fecha_inscripcion", fechaInscripcion);

    try {
      const res = await fetch(`${API}/torneos/usuario-registro`, {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (res.ok) {
        generarPDF({
          nombre: qs("#nombre").value,
          apellido: qs("#apellido").value,
          telefono: qs("#telefono").value,
          nacimientoFecha: formatearFecha(qs("#nacimiento").value),
          dni: qs("#dni").value,
          email: qs("#email").value,
          sedeElegida: torneo.sede,
          fechaElegida: formatearFecha(torneo.fecha),
          identificador,
          fechaInscripcion,
        });
      }

      if (!res.ok) throw new Error();
      alert("¡Inscripción exitosa! Se generó tu comprobante en PDF.");
      qs("#sede").value = "";
      qs("#fecha").value = "";
   
    } catch {
      alert("Error al enviar la inscripción");
    }
  };

  if (form) form.addEventListener("submit", handleSubmit);
});
