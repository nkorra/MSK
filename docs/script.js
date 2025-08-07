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

  // Toggle dropdown menus on hover
  document.querySelectorAll(".dropdown").forEach(drop => {
    drop.addEventListener("mouseenter", () => {
      drop.querySelector(".dropdown-menu").classList.add("show");
    });
    drop.addEventListener("mouseleave", () => {
      drop.querySelector(".dropdown-menu").classList.remove("show");
    });
  });
});

