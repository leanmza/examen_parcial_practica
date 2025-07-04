document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll("i.fa-plus");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".textoPaso");
      const paragraph = parent.querySelector(".card-description");

      if (paragraph) {
        paragraph.classList.toggle("d-none");
        // Opcional: rotar o cambiar el ícono
        btn.classList.toggle("fa-plus");
        btn.classList.toggle("fa-minus");
      }
    });
  });
});
