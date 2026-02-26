// Form utilities shared across pages
// Exposes both global functions and a namespaced object at window.utils.forms

(function () {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Muestra visualmente un error agragando la clase is-invalid e inyecta el mensaje en el span
  function setError(inputEl, labelSpanEl, message) {
    if (inputEl) inputEl.classList.add("is-invalid");
    if (labelSpanEl) labelSpanEl.textContent = `- ${message}`;
  }

  // Elimina la clase is-invalid y limpia el contenido del mensaje de error
  function clearError(inputEl, labelSpanEl) {
    if (inputEl) inputEl.classList.remove("is-invalid");
    if (labelSpanEl) labelSpanEl.textContent = "";
  }

  // Escucha cuando el usuario interactúa con un campo
  // (input para texto o change para selects/checkboxes).
  // En cuanto el usuario escribe o cambia algo, llama a clearError .
  function attachLiveClear(inputEl, labelSpanEl) {
    if (!inputEl) return;
    const evt =
      inputEl.tagName === "SELECT" || inputEl.type === "checkbox"
        ? "change"
        : "input";
    inputEl.addEventListener(evt, () => clearError(inputEl, labelSpanEl));
  }

  //  Selecciona elementos del DOM, simplifica tener que
  // escribir siempre document.querySelector()
  function qs(selector) {
    return document.querySelector(selector);
  }

  // Recibe una lista de objetos con los campos a revisar
  // Verifica si están vacíos, la longitud del campo "mensaje" y
  // si los checkbox están seleccionados 
  function validarCampos(campos) {
    let firstInvalid = null;

    campos.forEach(({ el, label, msg }) => {
      const input = qs(el);
      const span = qs(label);

      if (!input) return; // ← AGREGAR ESTO

      clearError(input, span);

      if (!input.value.trim()) {
        setError(input, span, msg);
        firstInvalid ??= input;
        attachLiveClear(input, span);
      }
    });

    const mensaje = qs("#mensaje");
    const labelMensaje = qs("#label-mensaje");
    const MIN_MESSAGE_LENGTH = 30;

    if (mensaje) {
      clearError(mensaje, labelMensaje);

      if (mensaje.value.trim().length < MIN_MESSAGE_LENGTH) {
        setError(
          mensaje,
          labelMensaje,
          `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`,
        );

        firstInvalid ??= mensaje;
        attachLiveClear(mensaje, labelMensaje);
      }
    }

    const terminos = qs("#terminos");
    if (terminos && !terminos.checked) {
      alert("Debes aceptar los términos y condiciones");
      firstInvalid ??= terminos;
    }

    const humano = qs("#humano");
    if (humano && !humano.checked) {
      alert("Debes confirmar que no eres un robot");
      firstInvalid ??= humano;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  // Expose as globals (back-compat)
  window.EMAIL_REGEX = EMAIL_REGEX;
  window.setError = setError;
  window.clearError = clearError;
  window.attachLiveClear = attachLiveClear;
  window.qs = qs;
  window.validarCampos = validarCampos;

  // Expose as namespaced utils
  window.utils = window.utils || {};
  window.utils.forms = {
    EMAIL_REGEX,
    setError,
    clearError,
    attachLiveClear,
    qs,
    validarCampos,
  };
})();
