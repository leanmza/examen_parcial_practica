document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#torneoForm");

  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { qs, validarCampos } = window.utils.forms;

  let torneos = [];
  /* ------------------------------------
   Traigo los torneos del back 
   --------------------------------------*/

  fetch("http://127.0.0.1:5000/torneos/")
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

  async function validarInscripcion(idTorneo, dni) {
    try {
      const params = new URLSearchParams({
        id_torneo: idTorneo,
        dni: dni,
      });

      const res = await fetch(
        `http://localhost:5000/validar-inscripcion?${params.toString()}`,
        { method: "GET" }
      );

      const data = await res.json();
      return data.existe;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // ----------------------------------------------------
  // REVISO SI EL JUGADOR YA EXISTE EN LA BD PARA
  // EVITAR DUPLICADOS
  // ----------------------------------------------------

  async function validarJugador(dni) {
    try {
      const params = new URLSearchParams({ dni });

      const res = await fetch(
        `http://localhost:5000/validar-jugador?${params}`,
        { method: "GET" }
      );

      const data = await res.json();
      return data.id_jugador; // 👈 clave correcta
    } catch (e) {
      console.error(e);
      return null;
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

  const inscribirJugadorExistente = async (
    identificador,
    idTorneo,
    idJugador,
    fechaInscripcion,
    torneo
  ) => {
    const data = new FormData();
    data.append("identificador", identificador);
    data.append("id_torneo", idTorneo);
    data.append("fecha_inscripcion", fechaInscripcion);
    data.append("id_jugador", idJugador);

    try {
      const res = await fetch("http://127.0.0.1:5000/torneoForm/", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("HTTP error");

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

      alert("¡Inscripción exitosa! Se generó tu comprobante en PDF.");
      form.reset();
    } catch (e) {
      console.error(e);
      alert("Error al enviar la inscripción");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos(campos)) return;

    const identificador = generarIdentificador();
    const idTorneo = qs("#fecha").value;
    const dni = qs("#dni").value.trim();
    const fechaInscripcion = new Date().toISOString().split("T")[0];

    const torneo = torneos.find((t) => String(t.id_torneo) === idTorneo);
    if (!torneo) {
      alert("Torneo inválido");
      return;
    }

    const idJugador = await validarJugador(dni);

    if (idJugador != null) {
      const existe = await validarInscripcion(idTorneo, dni);

      if (existe) {
        alert("El DNI ya está inscripto en este torneo");
        return;
      }
      inscribirJugadorExistente(
        identificador,
        idTorneo,
        idJugador,
        fechaInscripcion,
        torneo
      );
      return;
    }

    const data = new FormData();
    ["nombre", "apellido", "telefono", "nacimiento", "dni", "email"].forEach(
      (c) => data.append(c, qs(`#${c}`).value)
    );
    data.append("identificador", identificador);
    data.append("id_torneo", idTorneo);
    data.append("fecha_inscripcion", fechaInscripcion);

    try {
      const res = await fetch("http://127.0.0.1:5000/torneo-jugador-form/", {
        method: "POST",
        body: data,
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
      form.reset();
    } catch {
      alert("Error al enviar la inscripción");
    }
  };

  if (form) form.addEventListener("submit", handleSubmit);
});
