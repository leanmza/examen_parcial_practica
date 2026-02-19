document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("loginError");
  const btnLogin = document.getElementById("btnLogin");

  const API_URL = "http://127.0.0.1:5000";

  const mostrarError = (mensaje) => {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove("d-none");
  };

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
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

    const formData = new FormData();
    formData.append("usuario", usuario);
    formData.append("password", password);

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
      mostrarError("Error de conexión. Verificá que el servidor esté corriendo.");
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i>Entrar';
    }
  });
});
