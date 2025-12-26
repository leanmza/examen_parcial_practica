document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#torneoForm");

  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { setError, clearError, attachLiveClear } = window.utils.forms;

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

  // Handler de envío (homogéneo al de contacto)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Elementos
    const elNombre = document.querySelector("#nombre");
    const elApellido = document.querySelector("#apellido");
    const elNacimiento = document.querySelector("#nacimiento");
    const elDni = document.querySelector("#dni");
    const elTelefono = document.querySelector("#telefono");
    const elEmail = document.querySelector("#email");
    const elSede = document.querySelector("#sede");
    const elFecha = document.querySelector("#fecha");
    const elTerminos = document.querySelector("#terminos");

    const spNombre = document.querySelector("#label-nombre");
    const spApellido = document.querySelector("#label-apellido");
    const spNacimiento = document.querySelector("#label-nacimiento");
    const spDni = document.querySelector("#label-dni");
    const spTelefono = document.querySelector("#label-telefono");
    const spEmail = document.querySelector("#label-email");
    const spSede = document.querySelector("#label-sede");
    const spFecha = document.querySelector("#label-fecha");

    // Valores
    const nombre = (elNombre?.value || "").trim();
    const apellido = (elApellido?.value || "").trim();
    const telefono = (elTelefono?.value || "").trim();
    const email = (elEmail?.value || "").trim();
    const nacimiento = (elNacimiento.value || "").trim();
    const dni = (elDni.value || "").trim();
    const sede = (elSede?.value || "").trim();
    const fecha = (elFecha?.value || "").trim();
    const terminos = !!elTerminos?.checked;

    // Limpiar errores
    clearError(elNombre, spNombre);
    clearError(elApellido, spApellido);
    clearError(elTelefono, spTelefono);
    clearError(elNacimiento, spNacimiento);
    clearError(elDni, spDni);
    clearError(elEmail, spEmail);
    clearError(elSede, spSede);
    clearError(elFecha, spFecha);

    let firstInvalid = null;

    if (!nombre) {
      setError(elNombre, spNombre, "Campo obligatorio");
      firstInvalid = firstInvalid || elNombre;
    }
    if (!apellido) {
      setError(elApellido, spApellido, "Campo obligatorio");
      firstInvalid = firstInvalid || elApellido;
    }

    if (!telefono) {
      setError(elTelefono, spTelefono, "Campo obligatorio");
      firstInvalid = firstInvalid || elTelefono;
    }
    if (!email) {
      setError(elEmail, spEmail, "Campo obligatorio");
      firstInvalid = firstInvalid || elEmail;
    }
    if (!nacimiento) {
      setError(elNacimiento, spNacimiento, "Campo obligatorio");
      firstInvalid = firstInvalid || elNacimiento;
    }
    if (!dni) {
      setError(elDni, spDni, "Campo obligatorio");
      firstInvalid = firstInvalid || elDni;
    }
    if (!sede) {
      setError(elSede, spSede, "Debes seleccionar una sede");
      firstInvalid = firstInvalid || elSede;
    }
    if (!fecha) {
      setError(elFecha, spFecha, "Debes seleccionar una fecha");
      firstInvalid = firstInvalid || elFecha;
    }
    if (!terminos) {
      alert("Debes aceptar los términos y condiciones");
      firstInvalid = firstInvalid || elTerminos;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      attachLiveClear(elNombre, spNombre);
      attachLiveClear(elApellido, spApellido);
      attachLiveClear(elTelefono, spTelefono);
      attachLiveClear(elNacimiento, spNacimiento);
      attachLiveClear(elDni, spDni);
      attachLiveClear(elEmail, spEmail);
      attachLiveClear(elSede, spSede);
      attachLiveClear(elFecha, spFecha);
      attachLiveClear(elTerminos, null);
      return;
    }

    // Generar identificador alfanumérico aleatorio (10 caracteres)
    const generarIdentificador = (len = 10) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let out = "";
      for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return out;
    };
    const identificador = generarIdentificador(10);

    const sedeElegida = torneos[sede - 1].sede;
    const fechaElegida = formatearFecha(torneos[sede - 1].fecha);
    const nacimientoFecha = formatearFecha(nacimiento);

    function formatearFecha(fechaISO) {
      if (!fechaISO) return "-";

      const partes = fechaISO.split("-");
      if (partes.length !== 3) return fechaISO;

      const [yyyy, mm, dd] = partes;
      return `${dd}-${mm}-${yyyy}`;
    }
    // Generar PDF
    generarPDF({
      nombre,
      apellido,
      telefono,
      nacimientoFecha,
      dni,
      email,
      sedeElegida,
      fechaElegida,
      identificador,
    });

    const idTorneo = elFecha.value;

    const data = new FormData();
    data.append("nombre", nombre);
    data.append("apellido", apellido);
    data.append("telefono", telefono);
    data.append("nacimiento", nacimiento);
    data.append("dni", dni);
    data.append("email", email);
    data.append("identificador", identificador);
    data.append("id_torneo", idTorneo);

    try {
      const response = await fetch("http://127.0.0.1:5000/torneoForm/", {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        alert("Inscripción exitosa");
      } else {
        alert("Error al enviar el mensaje");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
    alert("¡Inscripción exitosa! Se ha generado tu comprobante en PDF.");

    // Reset form
    form?.reset();
    if (fechaSelect) {
      fechaSelect.innerHTML =
        '<option value="" selected hidden disabled>Selecciona una fecha y horario</option>';
    }
  };

  if (form) form.addEventListener("submit", handleSubmit);
});
