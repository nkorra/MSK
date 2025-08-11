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

  // Shared success message HTML (your custom text)
  const successHTML = `
    <div class="thankyou" style="
      background:#f6fbff; border:1px solid #cfe6ff; border-radius:10px;
      padding:18px 16px; color:#0a3763; line-height:1.55;
    ">
      <strong>Thank you for reaching out to the MSK Precision Engineering Works team.</strong><br/>
      We will get back to you as soon as possible, and we appreciate your patience in the meantime.<br/><br/>
      — Your trusted partner, the MSK Team
    </div>
  `;

  // ----- Form helpers (Getform) -----
  async function submitForm(form, statusEl) {
    if (statusEl) statusEl.textContent = "Sending…";
    const data = new FormData(form);

    try {
      const res = await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: data
      });

      if (res.ok) {
        // Replace entire form with the thank-you block
        form.outerHTML = successHTML;
      } else {
        if (statusEl) statusEl.textContent = "Something went wrong. Please try again.";
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "Network error. Please try again.";
    }
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(contactForm, contactStatus);
    });
  }

  // Quote form (supports file input)
  const quoteForm = document.getElementById("quote-form");
  const quoteStatus = document.getElementById("quote-status");
  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, quoteStatus);
    });
  }
});

