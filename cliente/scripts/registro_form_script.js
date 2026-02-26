document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#torneoForm");

  // Utilidades importadas desde scripts/utils/forms.js: setError, clearError, attachLiveClear
  const { qs, validarCampos } = window.utils.forms;

  // Especifíco los elementos del DOM a revisar: el id del input "#",
  // el id del label y el mensaje de error
  const campos = [
    { el: "#usuario", label: "#label-usuario", msg: "Campo obligatorio" },
    { el: "#password", label: "#label-password", msg: "Campo obligatorio" },
    { el: "#nombre", label: "#label-nombre", msg: "Campo obligatorio" },
    { el: "#apellido", label: "#label-apellido", msg: "Campo obligatorio" },
    { el: "#telefono", label: "#label-telefono", msg: "Campo obligatorio" },
    { el: "#nacimiento", label: "#label-nacimiento", msg: "Campo obligatorio" },
    { el: "#dni", label: "#label-dni", msg: "Campo obligatorio" },
    { el: "#email", label: "#label-email", msg: "Campo obligatorio" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Llamo a la función de validar campos y si devuelve false detiene el envio del formulario
    if (!validarCampos(campos)) return;

    // Creo un objeto con los valores de los campos
    const data = new FormData();
    [
      "usuario",
      "password",
      "nombre",
      "apellido",
      "telefono",
      "nacimiento",
      "dni",
      "email",
    ].forEach((c) => data.append(c, qs(`#${c}`).value));

    // Envió el objeto, si no hay problemas muestra un mensaje de exito,
    // caso contrario, un mensaje de error
    try {
      const res = await fetch("http://127.0.0.1:5000/user/signup", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error();
      alert("¡Inscripción exitosa! ");
      window.location.href = "login.html";
    } catch {
      alert("Error al enviar la inscripción");
    }
  };

  if (form) form.addEventListener("submit", handleSubmit);
});
