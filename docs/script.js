document.addEventListener("DOMContentLoaded", () => {
  // Single Getform endpoint for all forms
  const GETFORM_ENDPOINT = "https://getform.io/f/allqjkra";

  // ----- Fixed-header aware offsets -----
  const header = document.querySelector("header");

  const setOffsets = () => {
    const h = header ? header.offsetHeight : 0;
    // Make layout & anchor targets account for the fixed header
    document.body.style.paddingTop = h + "px";
    document.querySelectorAll("section, .section-content")
      .forEach(el => el.style.scrollMarginTop = h + "px");
    return h;
  };

  let headerHeight = setOffsets();
  window.addEventListener("resize", () => { headerHeight = setOffsets(); });
  window.addEventListener("load", () => { headerHeight = setOffsets(); });

  // Smooth scroll with fixed-header offset
  const linkSelector = '.nav-links a[href^="#"], .dropdown-menu a[href^="#"]';
  document.querySelectorAll(linkSelector).forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const h = header ? header.offsetHeight : headerHeight;
      const y = target.getBoundingClientRect().top + window.pageYOffset - h;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Dropdown hover for desktop
  document.querySelectorAll(".dropdown").forEach(drop => {
    drop.addEventListener("mouseenter", () =>
      drop.querySelector(".dropdown-menu")?.classList.add("show")
    );
    drop.addEventListener("mouseleave", () =>
      drop.querySelector(".dropdown-menu")?.classList.remove("show")
    );
  });

  // Init AOS
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // Success message HTML
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
      const res = await fetch(GETFORM_ENDPOINT, { method: "POST", body: data });
      if (res.ok) {
        form.outerHTML = successHTML; // Replace form with thank-you
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

  // Job Apply form (supports file input)
  const applyForm = document.getElementById("job-form");
  const applyStatus = document.getElementById("apply-status");
  if (applyForm) {
    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(applyForm, applyStatus);
    });
  }

  // Prefill Apply form with job title and jump to form
  document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || 'General Application';
      const input = document.getElementById('job_title');
      if (input) { input.value = title; }
      // jump to the form using current header height
      const apply = document.getElementById('apply');
      if (apply) {
        const h = header ? header.offsetHeight : headerHeight;
        const y = apply.getBoundingClientRect().top + window.pageYOffset - h;
        window.scrollTo({ top: y, behavior: "smooth" });
        setTimeout(() => document.getElementById('name')?.focus(), 300);
      }
    });
  });
});

