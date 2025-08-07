document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Dropdown menu show/hide on hover
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

  // Optional: Add animation on scroll (AOS)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
    });
  }
});

