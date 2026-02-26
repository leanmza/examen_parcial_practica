const { qs, validarCampos } = window.utils.forms;
const API = "http://127.0.0.1:5000";

// Cargo los torneos donde el usuario esta inscripto
async function cargarMisTorneos() {
  const response = await fetch(`${API}/user/torneos`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    console.error("Error al obtener torneos");
    return;
  }

  const torneos = await response.json();
  const container = document.getElementById("card-tabla");

  if (!torneos.length) {
    container.innerHTML = ` <table class="tabla-torneos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Sede</th>
          <th>Ciudad</th>
          <th>Identificador</th>
          <th>Fecha inscripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  
    <th class='mensaje'>No estás inscripto en ningún torneo.
    </tbody>`;

    return;
  }

  let tabla = `
    <table class="tabla-torneos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Sede</th>
          <th>Ciudad</th>
          <th>Identificador</th>
          <th>Fecha inscripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  torneos.forEach((t) => {
    tabla += `
      <tr data-id="${t.id_torneo}">
        <td>${t.fecha}</td>
        <td>${t.sede.nombre}</td>
        <td>${t.sede.ciudad}</td>
        <td><span  class="identificador">${t.identificador}</span></td>
        <td>${t.fecha_inscripcion}</td>
        <td><i class="fa-solid fa-trash borrar" style="cursor:pointer;"></i></td>
      </tr>
    `;
  });

  tabla += `
      </tbody>
    </table>
  `;

  container.innerHTML = tabla;
}

// Lee datos almacenados en el navegador, específicamente obtiene el token CSRF
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
}

// Borro al usuario de un torneo específico
async function eliminarTorneo(idTorneo) {
  const csrf = getCookie("csrf_access_token");

  const response = await fetch(`${API}/torneos/baja-usuario`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrf,
    },
    body: JSON.stringify({
      id_torneo: idTorneo,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    alert("Eliminado correctamente");
    cargarMisTorneos();
  } else {
    alert(result.error || "Error al eliminar");
  }
}
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("borrar")) {
    const row = e.target.closest("tr");
    const idTorneo = row.dataset.id;

    if (confirm("¿Seguro que querés darte de baja?")) {
      eliminarTorneo(idTorneo);
    }
  }
});

//  Cargo usuario logueado
async function cargarUsuarioLogueado() {
  try {
    const res = await fetch(`${API}/user/me`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!data.logged) return;

    user = data.usuario; //inicializo user

    // Autocompletar
    qs("#usuario").value = user.usuario;
    qs("#nombre").value = user.nombre;
    qs("#apellido").value = user.apellido;
    qs("#dni").value = user.dni;
    qs("#telefono").value = user.telefono;
    qs("#email").value = user.email;
    if (user.nacimiento) {
      const fecha = new Date(user.nacimiento);

      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate() + 1).padStart(2, "0");

      qs("#nacimiento").value = `${anio}-${mes}-${dia}`;
    }

    console.log(anio, mes, dia);

    // Bloquear campos
    [
      "#nombre",
      "#apellido",
      "#dni",
      "#telefono",
      "#email",
      "#nacimiento",
    ].forEach((sel) => {
      qs(sel).setAttribute("readonly", true);
    });
  } catch (e) {
    console.error("No hay sesión activa");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarMisTorneos();

  cargarUsuarioLogueado();

  const datosForm = document.getElementById("datosForm");
  const passwordForm = document.getElementById("passwordForm");

  // Especifíco los elementos del DOM a revisar: el id del input "#",
  // el id del label y el mensaje de error
  const campos = [
    { el: "#nombre", label: "#label-nombre", msg: "Campo obligatorio" },
    { el: "#apellido", label: "#label-apellido", msg: "Campo obligatorio" },
    { el: "#telefono", label: "#label-telefono", msg: "Campo obligatorio" },
    { el: "#nacimiento", label: "#label-nacimiento", msg: "Campo obligatorio" },
    { el: "#email", label: "#label-email", msg: "Campo obligatorio" },
  ];

  datosForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Llamo a la función de validar campos y si devuelve false detiene el envio del formulario
    if (!validarCampos(campos)) return;

    // Muestro un mensaje de confirmación
    if (!confirm("¿Seguro que querés actualizar tus datos?")) {
      return;
    }

    const csrf = getCookie("csrf_access_token");

    // Creo el body con los valores de los inputs
    const body = {
      nombre: qs("#nombre").value,
      apellido: qs("#apellido").value,
      dni: qs("#dni").value,
      telefono: qs("#telefono").value,
      email: qs("#email").value,
      nacimiento: qs("#nacimiento").value,
    };

    // Hago un put para actulizar los datos de usuario, si no hay problemas 
    // muestra un mensaje de exito, caso contrario, un mensaje de error 
    const response = await fetch(`${API}/user`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrf,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Datos actualizados correctamente");
    } else {
      alert(result.error || "Error al actualizar");
    }
  });

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Muestro un mensaje de confimación
    if (!confirm("¿Seguro que querés cambiar tu contraseña?")) {
      return;
    }

    const csrf = getCookie("csrf_access_token");

    // Creo un objeto con los datos necesarios
    const formData = new FormData();
    formData.append("password", qs("#password").value);
    formData.append("clave_nueva", qs("#clave_nueva").value);

    // Hago un patch para actualizar la contraseña, si no hay problemas 
    // muestra un mensaje de exito, caso contrario, un mensaje de error
    const response = await fetch(`${API}/user/password`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "X-CSRF-TOKEN": csrf,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      alert(
        "Contraseña actualizada correctamente. Se te pedirá la proxima vez que inicies sesión",
      );
      passwordForm.reset();
    } else {
      alert(result.error || "Error al actualizar contraseña");
    }
  });
});
