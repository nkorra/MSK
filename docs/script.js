document.addEventListener("DOMContentLoaded", () => {
  // Single Getform endpoint for both forms
  const GETFORM_ENDPOINT = "https://getform.io/f/allqjkra";

  // Smooth scroll with sticky-header offset
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 0;

  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Dropdown hover for desktop
  document.querySelectorAll(".dropdown").forEach(drop => {
    drop.addEventListener("mouseenter", () => drop.querySelector(".dropdown-menu")?.classList.add("show"));
    drop.addEventListener("mouseleave", () => drop.querySelector(".dropdown-menu")?.classList.remove("show"));
  });

  // Init AOS (from CDN in index.html)
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // ----- Form helpers (Getform) -----
  async function submitForm(form, statusEl) {
    statusEl.textContent = "Sending…";
    const data = new FormData(form);

    try {
      const res = await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: data
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "Thanks! We’ll be in touch shortly.";
      } else {
        statusEl.textContent = "Something went wrong. Please try again.";
      }
    } catch (err) {
      statusEl.textContent = "Network error. Please try again.";
    }
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(contactForm, contactStatus);
    });
  }

  // Quote form (supports file input)
  const quoteForm = document.getElementById("quote-form");
  const quoteStatus = document.getElementById("quote-status");
  if (quoteForm && quoteStatus) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, quoteStatus);
    });
  }
});

