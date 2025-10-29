document.addEventListener("DOMContentLoaded", () => {
  const btnSubmit = document.querySelector("button#submit");
  const form = document.querySelector("#contactoForm");

  // =============================================================
  // Validaciones del formulario de contacto (cliente)
  // -------------------------------------------------------------
  // Reglas solicitadas:
  // - Campos no vacíos ni nulos (nombre, apellido, email, motivo, mensaje, humano)
  // - Email con formato válido
  // - Mensaje con un mínimo de caracteres
  // Notas de UX:
  // - Se muestran errores en línea usando Bootstrap (.is-invalid)
  // - Se enfocará el primer campo inválido para agilizar la corrección
  // - Los errores desaparecen cuando el usuario corrige el campo
  // =============================================================

  // Parámetros y utilidades compartidas
  const MIN_MESSAGE_LENGTH = 30;
  const { EMAIL_REGEX, setError, clearError, attachLiveClear } = window.utils?.forms || window;

  // Handler único para envío (click en botón o submit con Enter)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Elementos del DOM
    const elNombre = document.querySelector("#nombre");
    const elApellido = document.querySelector("#apellido");
    const elEmail = document.querySelector("#email");
    const elMotivo = document.querySelector("#motivo");
    const elMensaje = document.querySelector("#mensaje");
    const elHumano = document.querySelector("#humano");

    const spNombre = document.querySelector("#label-nombre");
    const spApellido = document.querySelector("#label-apellido");
    const spEmail = document.querySelector("#label-email");
    const spMotivo = document.querySelector("#label-motivo");
    const spMensaje = document.querySelector("#label-mensaje");

    // Valores normalizados
    const nombre = (elNombre?.value || "").trim();
    const apellido = (elApellido?.value || "").trim();
    const email = (elEmail?.value || "").trim();
    const motivo = (elMotivo?.value || "").trim();
    const mensaje = (elMensaje?.value || "").trim();
    const humano = !!elHumano?.checked;

    // Limpia errores anteriores
    clearError(elNombre, spNombre);
    clearError(elApellido, spApellido);
    clearError(elEmail, spEmail);
    clearError(elMotivo, spMotivo);
    clearError(elMensaje, spMensaje);

    // Validaciones
    let firstInvalid = null;

        if (!humano) {
      // Para el checkbox usamos un alert como refuerzo ya que es un control binario
      alert("Debes confirmar que no eres un robot.");
      firstInvalid = firstInvalid || elHumano;
      return;
    }

    if (!nombre) {
      setError(elNombre, spNombre, "Este campo es obligatorio");
      firstInvalid = firstInvalid || elNombre;
    }

    if (!apellido) {
      setError(elApellido, spApellido, "Este campo es obligatorio");
      firstInvalid = firstInvalid || elApellido;
    }

    if (!email) {
      setError(elEmail, spEmail, "El email es obligatorio");
      firstInvalid = firstInvalid || elEmail;
    } else if (!EMAIL_REGEX.test(email)) {
      setError(elEmail, spEmail, "Formato de email inválido");
      firstInvalid = firstInvalid || elEmail;
    }

    if (!motivo) {
      setError(elMotivo, spMotivo, "Debe seleccionar un motivo");
      firstInvalid = firstInvalid || elMotivo;
    }

    if (!mensaje) {
      setError(elMensaje, spMensaje, "El mensaje es obligatorio");
      firstInvalid = firstInvalid || elMensaje;
    } else if (mensaje.length < MIN_MESSAGE_LENGTH) {
      setError(
        elMensaje,
        spMensaje,
        `Debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`
      );
      firstInvalid = firstInvalid || elMensaje;
    }



    // Enfoca el primer campo inválido y detiene el envío
    if (firstInvalid) {
      firstInvalid.focus();
      // Activar limpieza de errores en vivo (una sola vez por control)
      attachLiveClear(elNombre, spNombre);
      attachLiveClear(elApellido, spApellido);
      attachLiveClear(elEmail, spEmail);
      attachLiveClear(elMotivo, spMotivo);
      attachLiveClear(elMensaje, spMensaje);
      return;
    }

    const data = new FormData();
    data.append("nombre", nombre);
    data.append("apellido", apellido);
    data.append("email", email);
    data.append("motivo", motivo);
    data.append("mensaje", mensaje);

    try {
      const response = await fetch("http://127.0.0.1:5000/contactoForm/", {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        alert("Mensaje enviado correctamente");
        document.querySelector("#contactoForm").reset();
      } else {
        alert("Error al enviar el mensaje");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }

  };

  // Listeners: click del botón y submit del formulario (Enter)
  if (btnSubmit) btnSubmit.addEventListener("click", handleSubmit);
  if (form) form.addEventListener("submit", handleSubmit);
});

