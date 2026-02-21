document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://127.0.0.1:5000";
  const userMenu = document.getElementById("user-menu");

  const renderLoggedOutMenu = () => {
    userMenu.innerHTML = `
      <li>
        <a class="dropdown-item" href="login.html">
          Iniciar sesión
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="registroUsuario.html">
          Registrame
        </a>
      </li>
    `;
  };

  const renderLoggedInMenu = () => {
    userMenu.innerHTML = `
      <li>
        <a class="dropdown-item" href="userDashboard.html">
          Mi cuenta
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" id="logout">
          Cerrar sesión
        </a>
      </li>
    `;

    document.getElementById("logout").addEventListener("click", async (e) => {
      e.preventDefault();

      const csrf = getCookie("csrf_access_token");

      await fetch(`${API}/logout`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": csrf,
        },
      });

      alert("Sesión cerrada");
      window.location.reload(); 
    });
  };

  function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) return value;
    }
    return null;
  }

  try {
    const res = await fetch(`${API}/user/me`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (data.logged) {
      renderLoggedInMenu();
    } else {
      renderLoggedOutMenu();
    }
  } catch (error) {
    console.error("Error verificando sesión:", error);
    renderLoggedOutMenu();
    window.location.href = "index.html";
  }
});
