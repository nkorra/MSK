// script.js – MSK Precision Engineering Group

document.addEventListener("DOMContentLoaded", () => {
  // ----- Fixed-header aware offsets -----
  const header = document.querySelector("header");

  const setOffsets = () => {
    const h = header ? header.offsetHeight : 0;

    // Make layout & anchor targets account for the fixed header
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

  // ----- Smooth scroll with fixed-header offset -----
  const linkSelector =
    '.nav-links a[href^="#"], .dropdown-menu a[href^="#"], .quote-btn[href^="#"]';

  document.querySelectorAll(linkSelector).forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const h = header ? header.offsetHeight : headerHeight;
      const y = target.getBoundingClientRect().top + window.pageYOffset - h;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // ----- Dropdown hover for desktop -----
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

  // ----- Init AOS -----
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // ===== IMPORTANT =====
  // We DO NOT intercept form submissions anymore.
  // No fetch(), no preventDefault(), no manual error messages.
  // Forms submit directly to FormSubmit as normal HTML POST.

  // ----- Prefill Apply form with job title and scroll to form -----
  document.querySelectorAll(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "General Application";
      const input = document.getElementById("job_title");
      if (input) input.value = title;

      const applySection = document.getElementById("apply");
      if (applySection) {
        const h = header ? header.offsetHeight : headerHeight;
        const y =
          applySection.getBoundingClientRect().top +
          window.pageYOffset -
          h;

        window.scrollTo({ top: y, behavior: "smooth" });

        setTimeout(() => {
          document.getElementById("name")?.focus();
        }, 300);
      }
    });
  });
});

