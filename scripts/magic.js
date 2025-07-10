document.addEventListener("DOMContentLoaded", function () {
  // hace visible u oculta la descripción de la parte de la carta al hacer click en le ícono
  const toggleButtons = document.querySelectorAll("i.fa-plus");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const padre = btn.closest(".card-part-text");
      const parrafo = padre.querySelector(".card-description");

      if (parrafo) {
        parrafo.classList.toggle("d-none");

        btn.classList.toggle("fa-plus");
        btn.classList.toggle("fa-minus");
      }
    });
  });

  // hace visible u oculta la descripción de la parte de la carta al hacer click en el número
  // sobre la carta y cambia el ícono según este visible o no la descripcion
  if (window.matchMedia("(min-width: 768px)").matches) {
    const btnImage = document.querySelectorAll("div.number-part");

    btnImage.forEach((btn) => {
      btn.addEventListener("click", () => {
        const numero = btn.textContent.trim();

        // Busca el .parte que contiene ese número
        const partes = document.querySelectorAll(".parte");
        partes.forEach((parte) => {
          const numeroParte = parte
            .querySelector(".parte-carta")
            ?.textContent.trim();
          if (numeroParte === numero) {
            const parrafo = parte.querySelector(".card-description");
            const icono = parte.querySelector("i.fa-plus, i.fa-minus");
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

    // Resalta el div de la descripción al pasar con el mouse por el número de la imagen

    const imgPartNumbers = document.querySelectorAll(".img-partes .col");
    const parteCards = document.querySelectorAll(".parte");

    imgPartNumbers.forEach((h5) => {
      h5.addEventListener("mouseenter", () => {
        const number = h5.textContent.trim();
        parteCards.forEach((parte) => {
          const parteNumber = parte
            .querySelector(".parte-carta")
            ?.textContent.trim();
          if (parteNumber === number) {
            parte.classList.add("resaltado");
            const parrafo = parte.querySelector(".card-description");
            if (parrafo) parrafo.classList.add("visible");
          }
        });
      });

      h5.addEventListener("mouseleave", () => {
        parteCards.forEach((parte) => {
          parte.classList.remove("resaltado");
          const parrafo = parte.querySelector(".card-description");
          if (parrafo) parrafo.classList.remove("visible");
        });
      });
    });
  }

  // hace visible u oculta la descripción de la parte de la carta al hacer click en el número
  // sobre la carta y cambia el ícono según este visible o no la descripcion
  if (window.matchMedia("(max-width: 767px)").matches) {
    const btnImage = document.querySelectorAll("div.number-part");

    btnImage.forEach((btn) => {
      btn.addEventListener("click", () => {
        const numero = btn.textContent.trim();

        // // Ocultamos todos los partes primero (opcional)
        document.querySelectorAll(".parte").forEach((p) => {
          p.style.display = "none";
        });

        // Buscamos el parte correspondiente

        const partes = document.querySelectorAll(".parte");
        partes.forEach((parte) => {
          const numeroParte = parte
            .querySelector(".parte-carta")
            ?.textContent.trim();
          if (numeroParte === numero) {
            parte.style.display = "flex"; // o "block", según tu diseño

            const parrafo = parte.querySelector(".card-description");
            if (parrafo) parrafo.style.display = "block";
          }
        });
      });
    });
  }
});
