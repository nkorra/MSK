// script.js – MSK Precision Engineering Group

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");

  // ----- Fixed-header aware offsets -----
  const setOffsets = () => {
    const h = header ? header.offsetHeight : 0;

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

  // ----- Dropdown hover show/hide (desktop) -----
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

  // ----- Animated header on scroll (shrink & deepen color) -----
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  handleScroll(); // run once on load
  window.addEventListener("scroll", handleScroll);

  // ----- Init AOS if available -----
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

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

  // IMPORTANT: We no longer intercept form submits.
  // Forms post directly to FormSubmit via the action="" in HTML.
});

