document.addEventListener("DOMContentLoaded", () => {
  // ====== CONFIG: paste your Formspree endpoints here ======
  const FORMSPREE_CONTACT = "https://formspree.io/f/your-contact-id";
  const FORMSPREE_QUOTE   = "https://formspree.io/f/your-quote-id";
  // =========================================================

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

  // ----- Form helpers -----
  async function submitForm(form, endpoint, statusEl) {
    statusEl.textContent = "Sending…";
    const data = new FormData(form);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "Thanks! We’ll be in touch shortly.";
      } else {
        const msg = await res.json().catch(() => ({}));
        statusEl.textContent = msg?.error || "Something went wrong. Please try again.";
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
      submitForm(contactForm, FORMSPREE_CONTACT, contactStatus);
    });
  }

  // Quote form (supports file input)
  const quoteForm = document.getElementById("quote-form");
  const quoteStatus = document.getElementById("quote-status");
  if (quoteForm && quoteStatus) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, FORMSPREE_QUOTE, quoteStatus);
    });
  }
});

