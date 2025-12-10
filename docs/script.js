document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 1. Getform endpoint
  // -----------------------------
  const GETFORM_ENDPOINT = "https://getform.io/f/amdjpymb";

  // -----------------------------
  // 2. Fixed-header offsets
  // -----------------------------
  const header = document.querySelector("header");

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

  // -----------------------------
  // 3. Header effect on scroll
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
  // 4. Smooth scroll (nav & hero buttons)
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
  // 5. Dropdown behaviour
  // -----------------------------
  document.querySelectorAll(".dropdown").forEach((drop) => {
    const menu = drop.querySelector(".dropdown-menu");
    const triggerLink = drop.querySelector("a[href^='#']");

    if (!menu || !triggerLink) return;

    // Desktop hover
    drop.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 900) {
        menu.classList.add("show");
      }
    });
    drop.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 900) {
        menu.classList.remove("show");
      }
    });

    // Mobile click toggle
    triggerLink.addEventListener("click", (e) => {
      if (window.innerWidth < 900) {
        e.preventDefault();
        menu.classList.toggle("show");
      }
    });
  });

  // -----------------------------
  // 6. Init AOS
  // -----------------------------
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
    });
  }

  // -----------------------------
  // 7. Success message block
  // -----------------------------
  const successHTML = `
    <div class="thankyou">
      <div style="
        background:#f6fbff;
        border:1px solid #cfe6ff;
        border-radius:10px;
        padding:18px 16px;
        color:#0a3763;
        line-height:1.55;
      ">
        <strong>Thank you for reaching out to the MSK Precision Engineering Group team.</strong><br/>
        We will get back to you as soon as possible at the email address you have provided.<br/><br/>
        — Your trusted partner, the MSK Team
      </div>
    </div>
  `;

  // -----------------------------
  // 8. Generic Getform submit
  // -----------------------------
  async function submitForm(form, statusEl) {
    if (!form) return;

    if (statusEl) statusEl.textContent = "Sending…";

    const data = new FormData(form);

    try {
      const res = await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: data,
      });

      if (res.ok || res.type === "opaque") {
        form.outerHTML = successHTML;
      } else if (statusEl) {
        statusEl.textContent =
          "Something went wrong at the form provider. Please try again.";
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent =
          "Network / DNS error while contacting Getform. Your website is OK – this is likely a temporary issue at the form provider.";
      }
    }
  }

  // -----------------------------
  // 9. Contact form
  // -----------------------------
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(contactForm, contactStatus);
    });
  }

  // -----------------------------
  // 10. Quote form
  // -----------------------------
  const quoteForm = document.getElementById("quote-form");
  const quoteStatus = document.getElementById("quote-status");

  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, quoteStatus);
    });
  }

  // -----------------------------
  // 11. Job Apply form
  // -----------------------------
  const applyForm = document.getElementById("job-form");
  const applyStatus = document.getElementById("apply-status");

  if (applyForm) {
    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(applyForm, applyStatus);
    });
  }

  // -----------------------------
  // 12. Prefill Apply form & scroll
  // -----------------------------
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

