document.addEventListener("DOMContentLoaded", async () => {
  const API = "http://127.0.0.1:5000";

  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navUser = document.getElementById("nav-user");
  const userToggle = document.getElementById("user-toggle");

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

      // Logout
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

        window.location.reload();
      });

    } else {
      navUser.classList.add("d-none");
    }

  } catch (error) {
    console.error(error);
  }
});