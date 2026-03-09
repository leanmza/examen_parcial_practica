const container = document.querySelector("#toast-container");

// Toast simple (reemplaza alert)
window.mostrarToast = (mensaje, tipo = "success") => {

  const colores = {
    success: "text-bg-success",
    error: "text-bg-danger",
    warning: "text-bg-warning",
    info: "text-bg-info"
  };

  const toastHTML = `
    <div class="toast align-items-center ${colores[tipo] || colores.info} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = container.lastElementChild;

  const toast = new bootstrap.Toast(toastElement, {
    delay: 4000
  });

  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
};

// Toast confirmación (reemplaza confirm)
window.confirmToast = (mensaje, tipoBtn) => {

   tipoBtn = tipoBtn ? tipoBtn : "primary";

  return new Promise((resolve) => {

    const toastHTML = `
    <div class="toast role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body">
        ${mensaje}
        <div class="mt-2 pt-2 border-top d-flex gap-2">
          <button type="button" class="btn btn-${tipoBtn} btn-sm btn-confirm">Sí</button>
          <button type="button" class="btn btn-secondary btn-sm btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
    `;



    container.insertAdjacentHTML("beforeend", toastHTML);

    const toastEl = container.lastElementChild;
    const toast = new bootstrap.Toast(toastEl, { autohide: false });

    toast.show();

    toastEl.querySelector(".btn-confirm").onclick = () => {
      resolve(true);
      toast.hide();
    };

    toastEl.querySelector(".btn-cancel").onclick = () => {
      resolve(false);
      toast.hide();
    };

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  });
};