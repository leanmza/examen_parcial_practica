document.addEventListener("DOMContentLoaded", () => {
  const btnSubmit = document.querySelector("button#submit");
  const form = document.querySelector("#contactoForm");

  // Parámetros y utilidades compartidas
  const { validarCampos } = window.utils?.forms || window;

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Especifíco los elementos del DOM a revisar: el id del input/checkbox "#",
    // el id del label y el mensaje de error 
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

    // Llamo a la función de validar campos y si devuelve false detiene el envio del formulario
    if (!validarCampos(campos)) {
      return;
    }

    // Creo un objeto con los valores de los campos
    const data = new FormData();
    ["nombre", "apellido", "email", "motivo", "mensaje"].forEach((c) =>
      data.append(c, qs(`#${c}`).value)
    );

    // Envió el objeto, si no hay problemas muestra un mensaje de exito, 
    // caso contrario, un mensaje de error
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
