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
  const { validarCampos } = window.utils?.forms || window;

  // Handler único para envío (click en botón o submit con Enter)
  const handleSubmit = async (event) => {
    event.preventDefault();

    const campos = [
      { el: "#nombre", label: "#label-nombre", msg: "Campo obligatorio" },
      { el: "#apellido", label: "#label-apellido", msg: "Campo obligatorio" },
      { el: "#email", label: "#label-email", msg: "Campo obligatorio" },
      {
        el: "#motivo",
        label: "#label-motivo",
        msg: "Debe seleccionar una opción",
      },
      {
        el: "#mensaje",
        label: "#label-mensaje",
        msg: `Debe tener al menos 30 caracteres`,
      },
      {
        el: "#humano",
        label: "#label-humano",
        msg: "Debe seleccionar una opción",
      },
    ];

    if (!validarCampos(campos)) {
      return;
    }

    const data = new FormData();
    ["nombre", "apellido", "email", "motivo", "mensaje"].forEach((c) =>
      data.append(c, qs(`#${c}`).value)
    );

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
