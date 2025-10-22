document.addEventListener("DOMContentLoaded", () => {
  const btnSubmit = document.querySelector("button#submit");

  btnSubmit.addEventListener("click", async function (event) {
    event.preventDefault();

    const nombre = document.querySelector("#nombre").value;
    const apellido = document.querySelector("#apellido").value;
    const email = document.querySelector("#email").value;
    const motivo = document.querySelector("#motivo").value;
    const mensaje = document.querySelector("#mensaje").value;
    const humano = document.querySelector("#humano").checked;




    if (!humano) {
      alert("Debes confirmar que no eres un robot.");
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


  });
});
