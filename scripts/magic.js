document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll("i.fa-plus");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const padre = btn.closest(".card-part-text");
      const parrafo = padre.querySelector(".card-description");

      if (parrafo) {
        parrafo.classList.toggle("d-none");
        // Opcional: rotar o cambiar el ícono
        btn.classList.toggle("fa-plus");
        btn.classList.toggle("fa-minus");
      }
    });
  });

  const btnImage = document.querySelectorAll("h5.number-part");

  btnImage.forEach((btn) => {
    btn.addEventListener("click", () => {
      const numero = btn.textContent.trim();

      // Buscar el .paso que contiene ese número
      const pasos = document.querySelectorAll(".paso");
      pasos.forEach((paso) => {
        const numeroPaso = paso
          .querySelector(".parte-carta")
          ?.textContent.trim();
        if (numeroPaso === numero) {
          const parrafo = paso.querySelector(".card-description");
          const icono = paso.querySelector("i.fa-plus, i.fa-minus");
          if (parrafo) {
            const seAbre = parrafo.classList.toggle("d-none");

            // Si seAbre es true => se ocultó, si false => se mostró
            if (icono) {
              icono.classList.toggle("fa-plus", !seAbre);
              icono.classList.toggle("fa-minus", seAbre);
            }
          }
        }
      });
    });
  });

  const imgPartNumbers = document.querySelectorAll(".img-partes .col");
  const pasoCards = document.querySelectorAll(".paso");

  imgPartNumbers.forEach((h5) => {
    h5.addEventListener("mouseenter", () => {
      const number = h5.textContent.trim();
      pasoCards.forEach((paso) => {
        const pasoNumber = paso
          .querySelector(".parte-carta")
          ?.textContent.trim();
        if (pasoNumber === number) {
          paso.classList.add("resaltado");
          const parrafo = paso.querySelector(".card-description");
          if (parrafo) parrafo.classList.add("visible");
        }
      });
    });

    h5.addEventListener("mouseleave", () => {
      pasoCards.forEach((paso) => {
        paso.classList.remove("resaltado");
        const parrafo = paso.querySelector(".card-description");
        if (parrafo) parrafo.classList.remove("visible");
      });
    });
  });
});
