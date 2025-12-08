// docs/script.js
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 1. Fixed-header offsets
  // -----------------------------
  const header = document.querySelector("header");

  const setOffsets = () => {
    const h = header ? header.offsetHeight : 0;

    // Layout & anchor targets account for the fixed header
    document.body.style.paddingTop = h + "px";
    document
      .querySelectorAll("section, .section-content")
      .forEach((el) => (el.style.scrollMarginTop = h + "px"));

    return h;
  };

  let headerHeight = setOffsets();

  window.addEventListener("resize", () => {
    headerHeight = setOffsets();
  });

  window.addEventListener("load", () => {
    headerHeight = setOffsets();
  });

  // -----------------------------
  // 2. Header "animated" on scroll
  // -----------------------------
  window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // -----------------------------
  // 3. Smooth scroll with offset
  // -----------------------------
  const linkSelector =
    '.nav-links a[href^="#"], .dropdown-menu a[href^="#"], a.btn[href^="#"]';

  document.querySelectorAll(linkSelector).forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const h = header ? header.offsetHeight : headerHeight;
      const y = target.getBoundingClientRect().top + window.pageYOffset - h;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // -----------------------------
  // 4. Dropdown hover (desktop)
  // -----------------------------
  document.querySelectorAll(".dropdown").forEach((drop) => {
    const menu = drop.querySelector(".dropdown-menu");
    if (!menu) return;

    drop.addEventListener("mouseenter", () => {
      menu.classList.add("show");
    });
    drop.addEventListener("mouseleave", () => {
      menu.classList.remove("show");
    });
  });

  // -----------------------------
  // 5. Init AOS (if loaded)
  // -----------------------------
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
    });
  }

  // -----------------------------
  // 6. Prefill Apply form & scroll
  // -----------------------------
  document.querySelectorAll(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "General Application";
      const input = document.getElementById("job_title");
      if (input) input.value = title;

      const applySection = document.getElementById("careers");
      if (applySection) {
        const h = header ? header.offsetHeight : headerHeight;
        const y =
          applySection.getBoundingClientRect().top +
          window.pageYOffset -
          h;

        window.scrollTo({ top: y, behavior: "smooth" });

        setTimeout(() => {
          document.getElementById("candidate_name")?.focus();
        }, 300);
      }
    });
  });
});

