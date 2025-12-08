// MSK Precision Engineering – Frontend Script
document.addEventListener("DOMContentLoaded", () => {
  console.log("MSK website loaded");

  // ==============================
  // 1. Fixed header offset
  // ==============================
  const header = document.querySelector("header");

  function updateOffsets() {
    const h = header ? header.offsetHeight : 120;

    // body padding so hero/content not hidden
    document.body.style.paddingTop = h + "px";

    // anchor scroll offset
    document.querySelectorAll("section, .section-content").forEach((el) => {
      el.style.scrollMarginTop = h + "px";
    });
  }

  updateOffsets();
  window.addEventListener("resize", updateOffsets);
  window.addEventListener("load", updateOffsets);

  // ==============================
  // 2. Header scroll effect
  // ==============================
  window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // ==============================
  // 3. Dropdown hover (desktop)
  // ==============================
  document.querySelectorAll(".dropdown").forEach((drop) => {
    const menu = drop.querySelector(".dropdown-menu");
    if (!menu) return;

    drop.addEventListener("mouseenter", () => menu.classList.add("show"));
    drop.addEventListener("mouseleave", () => menu.classList.remove("show"));
  });

  // ==============================
  // 4. Smooth scroll for nav + CTA links
  // ==============================
  const linkSelector =
    '.nav-links a[href^="#"], .dropdown-menu a[href^="#"], a.btn[href^="#"], a.btn-outline[href^="#"]';

  document.querySelectorAll(linkSelector).forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const h = header ? header.offsetHeight : 120;
      const y = target.getBoundingClientRect().top + window.scrollY - h;

      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // ==============================
  // 5. Prefill "Apply" form from job cards
  // ==============================
  document.querySelectorAll(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "General Application";
      const jobInput = document.getElementById("job_title");
      if (jobInput) jobInput.value = title;

      const applySection = document.getElementById("apply");
      if (applySection) {
        const h = header ? header.offsetHeight : 120;
        const y = applySection.getBoundingClientRect().top + window.scrollY - h;

        window.scrollTo({ top: y, behavior: "smooth" });

        setTimeout(() => {
          document.getElementById("name")?.focus();
        }, 300);
      }
    });
  });

  // ==============================
  // 6. Init AOS if available
  // ==============================
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 700,
      once: true,
    });
  }
});

