document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Dropdown hover support for desktop
  document.querySelectorAll(".dropdown").forEach(drop => {
    drop.addEventListener("mouseenter", () => {
      const menu = drop.querySelector(".dropdown-menu");
      if (menu) menu.classList.add("show");
    });
    drop.addEventListener("mouseleave", () => {
      const menu = drop.querySelector(".dropdown-menu");
      if (menu) menu.classList.remove("show");
    });
  });
});

