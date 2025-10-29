document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#torneoForm");
  const btnSubmit = document.querySelector("#inscribirse");

  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { setError, clearError, attachLiveClear } = window.utils.forms;

  // Poblado dinámico de fechas según sede (extraído del inline original)
  const sedeSelect = document.getElementById('sede');
  const fechaSelect = document.getElementById('fecha');
  const horarios = {
    "Seminario 507, Providencia, Santiago de Chile, Chile": [
      "Sábado 15/05 - 10:00 a 14:00",
      "Sábado 15/05 - 16:00 a 20:00",
      "Domingo 16/05 - 11:00 a 15:00",
      "Sábado 22/05 - 10:00 a 14:00",
      "Sábado 22/05 - 16:00 a 20:00",
    ],
    "Av San Martin 325, Mendoza, Argentina": [
      "Viernes 14/05 - 18:00 a 22:00",
      "Sábado 15/05 - 10:00 a 14:00",
      "Sábado 15/05 - 16:00 a 20:00",
      "Viernes 21/05 - 18:00 a 22:00",
      "Sábado 22/05 - 10:00 a 14:00",
    ],
    "Av Belgrano 12, CABA, Argentina": [
      "Viernes 14/05 - 17:00 a 21:00",
      "Sábado 15/05 - 09:00 a 13:00",
      "Sábado 15/05 - 15:00 a 19:00",
      "Domingo 16/05 - 10:00 a 14:00",
      "Viernes 21/05 - 17:00 a 21:00",
    ],
  };

  if (sedeSelect && fechaSelect) {
    sedeSelect.addEventListener('change', function () {
      const sedeSeleccionada = this.value;
      fechaSelect.innerHTML = '<option value="" selected hidden disabled>Selecciona una fecha y horario</option>';
      if (sedeSeleccionada && horarios[sedeSeleccionada]) {
        horarios[sedeSeleccionada].forEach((horario) => {
          const option = document.createElement('option');
          option.value = horario;
          option.textContent = horario;
          fechaSelect.appendChild(option);
        });
      }
    });
  }

  // Handler de envío (homogéneo al de contacto)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Elementos
    const elNombre = document.querySelector('#nombre');
    const elApellido = document.querySelector('#apellido');
    const elEdad = document.querySelector('#edad');
    const elTelefono = document.querySelector('#telefono');
    const elDireccion = document.querySelector('#direccion');
    const elSede = document.querySelector('#sede');
    const elFecha = document.querySelector('#fecha');
    const elTerminos = document.querySelector('#terminos');

    const spNombre = document.querySelector('#label-nombre');
    const spApellido = document.querySelector('#label-apellido');
    const spEdad = document.querySelector('#label-edad');
    const spTelefono = document.querySelector('#label-telefono');
    const spDireccion = document.querySelector('#label-direccion');
    const spSede = document.querySelector('#label-sede');
    const spFecha = document.querySelector('#label-fecha');

    // Valores
    const nombre = (elNombre?.value || '').trim();
    const apellido = (elApellido?.value || '').trim();
    const edad = parseInt(elEdad?.value || '');
    const telefono = (elTelefono?.value || '').trim();
    const direccion = (elDireccion?.value || '').trim();
    const sede = (elSede?.value || '').trim();
    const fecha = (elFecha?.value || '').trim();
    const terminos = !!elTerminos?.checked;

    // Limpiar errores
    clearError(elNombre, spNombre);
    clearError(elApellido, spApellido);
    clearError(elEdad, spEdad);
    clearError(elTelefono, spTelefono);
    clearError(elDireccion, spDireccion);
    clearError(elSede, spSede);
    clearError(elFecha, spFecha);

    let firstInvalid = null;

    if (!nombre) {
      setError(elNombre, spNombre, 'Campo obligatorio');
      firstInvalid = firstInvalid || elNombre;
    }
    if (!apellido) {
      setError(elApellido, spApellido, 'Campo obligatorio');
      firstInvalid = firstInvalid || elApellido;
    }
    if (!edad || edad < 16) {
      setError(elEdad, spEdad, 'Debes tener al menos 16 años');
      firstInvalid = firstInvalid || elEdad;
    }
    if (!telefono) {
      setError(elTelefono, spTelefono, 'Campo obligatorio');
      firstInvalid = firstInvalid || elTelefono;
    }
    if (!direccion) {
      setError(elDireccion, spDireccion, 'Campo obligatorio');
      firstInvalid = firstInvalid || elDireccion;
    }
    if (!sede) {
      setError(elSede, spSede, 'Debes seleccionar una sede');
      firstInvalid = firstInvalid || elSede;
    }
    if (!fecha) {
      setError(elFecha, spFecha, 'Debes seleccionar una fecha');
      firstInvalid = firstInvalid || elFecha;
    }
    if (!terminos) {
      alert('Debes aceptar los términos y condiciones');
      firstInvalid = firstInvalid || elTerminos;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      attachLiveClear(elNombre, spNombre);
      attachLiveClear(elApellido, spApellido);
      attachLiveClear(elEdad, spEdad);
      attachLiveClear(elTelefono, spTelefono);
      attachLiveClear(elDireccion, spDireccion);
      attachLiveClear(elSede, spSede);
      attachLiveClear(elFecha, spFecha);
      attachLiveClear(elTerminos, null);
      return;
    }

    // Generar identificador alfanumérico aleatorio (10 caracteres)
    const generarIdentificador = (len = 10) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let out = '';
      for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return out;
    };
    const identificador = generarIdentificador(10);

    // Generar PDF
    generarPDF({ nombre, apellido, edad, telefono, direccion, sede, fecha, identificador });

    alert('¡Inscripción exitosa! Se ha generado tu comprobante en PDF.');

    // Reset form
    form?.reset();
    if (fechaSelect) {
      fechaSelect.innerHTML = '<option value="" selected hidden disabled>Selecciona una fecha y horario</option>';
    }
  };

  if (form) form.addEventListener('submit', handleSubmit);
  if (btnSubmit) btnSubmit.addEventListener('click', handleSubmit);
});
