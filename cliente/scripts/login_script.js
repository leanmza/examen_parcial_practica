document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("loginError");
  const btnLogin = document.getElementById("btnLogin");

  const mensaje = sessionStorage.getItem("toastMensaje");
  const tipo = sessionStorage.getItem("toastTipo");

  
// Muestra un toast si alguien es redirigido al login sin estar logueado
function mostrarToast(mensaje, tipo = "warning") {
  const toastContainer = document.querySelector(".toast-container");

  const toastHTML = `
    <div class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = toastContainer.lastElementChild;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}




  if (mensaje) {
    mostrarToast(mensaje, tipo || "warning");

    // Limpiar después de usarlo
    sessionStorage.removeItem("toastMensaje");
    sessionStorage.removeItem("toastTipo");
  }

  const API_URL = "http://127.0.0.1:5000";

  // Inyecta un mensaje si hay un campo vacío
  const mostrarError = (mensaje) => {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove("d-none");
  };

  // Oculta el mensaje de error
  const ocultarError = () => {
    errorDiv.classList.add("d-none");
    errorDiv.textContent = "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    if (!usuario || !password) {
      mostrarError("Usuario y contraseña son obligatorios.");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

    // Crea un objeto con los datos 
    const formData = new FormData();
    formData.append("usuario", usuario);
    formData.append("password", password);

    // Envia los datos a servidor
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        window.location.href = "index.html";
      } else {
        mostrarError(data.error || "Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error(err);
      mostrarError(
        "Error de conexión. Verificá que el servidor esté corriendo.",
      );
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML =
        '<i class="fa-solid fa-right-to-bracket me-2"></i>Entrar';
    }
  });
});
