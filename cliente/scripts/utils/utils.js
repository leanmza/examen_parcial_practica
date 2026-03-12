// Gestiona las sesiones sesiones de usuario, cookies y seguridad básica
document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://127.0.0.1:5000";

  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navUser = document.getElementById("nav-user");
  const userToggle = document.getElementById("user-toggle");

  // Lee datos almacenados en el navegador, específicamente obtiene el token CSRF
  window.getCookie = function (name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) return value;
    }
    return null;
  };
  // Consulta el servidor si el usuario esta logueado, si lo esta oculta
  // los botones iniciar sesion y registrame, y muestra el menú de usuario
  try {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });

    const data = await res.json();

    if (data.logged) {
      // Ocultar login/register
      navLogin.classList.add("d-none");
      navRegister.classList.add("d-none");

      // Mostrar dropdown usuario
      navUser.classList.remove("d-none");

      userToggle.textContent = data.usuario.usuario;

      const rol = data.usuario.rol;

      if (rol === "admin") {
        const dropdownMenu = document.querySelector("#nav-user .dropdown-menu");

        const adminItem = document.createElement("li");

        adminItem.innerHTML = `
    <a class="dropdown-item" href="adminDashboard.html">
      Administrar torneos
    </a>
    <a class="dropdown-item" href="sedesDashboard.html">
      Administrar sedes
    </a>
  `;

        dropdownMenu.prepend(adminItem);
      }

      // Logout
      document.getElementById("logout").addEventListener("click", async (e) => {
        e.preventDefault();

        const csrf = getCookie("csrf_access_token");

        await fetch(`${API}/auth/logout`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": csrf,
          },
        });

          window.location.href = "index.html";
      });
    } else {
      navUser.classList.add("d-none");
    }
  } catch (error) {
    console.error(error);
  }
});
