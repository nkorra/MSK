// script.js – MSK Precision Engineering Group

document.addEventListener("DOMContentLoaded", () => {
  // ===== CONFIG =====
  const GETFORM_ENDPOINT = "https://getform.io/f/amdjpymb"; // your Getform URL

  const header = document.querySelector("header");

  // ===== FIXED-HEADER OFFSETS =====
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

  // ===== SMOOTH SCROLL WITH OFFSET =====
  const linkSelector =
    '.nav-links a[href^="#"], .dropdown-menu a[href^="#"], .hero .btn[href^="#"]';

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

  // ===== DROPDOWN HOVER (DESKTOP) =====
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

  // ===== HEADER SCROLL ANIMATION =====
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll);

  // ===== INIT AOS =====
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // ===== THANK-YOU HTML BLOCK =====
  const successHTML = `
    <div class="thankyou" style="
      background:#f6fbff;
      border:1px solid #cfe6ff;
      border-radius:10px;
      padding:18px 16px;
      color:#0a3763;
      line-height:1.55;
      max-width:640px;
    ">
      <strong>Thank you for contacting MSK Precision Engineering Group.</strong><br/>
      Your message has been sent successfully. We will reply to you at the email address you provided.<br/><br/>
      — MSK Team
    </div>
  `;

  // ===== GENERIC GETFORM SUBMIT HELPER =====
  async function submitForm(form, statusEl) {
    if (statusEl) statusEl.textContent = "Sending…";

    const data = new FormData(form);

    try {
      const res = await fetch(GETFORM_ENDPOINT, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        form.outerHTML = successHTML;
      } else if (statusEl) {
        statusEl.textContent = "Something went wrong. Please try again.";
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = "Network error. Please try again.";
      }
    }
  }

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(contactForm, contactStatus);
    });
  }

  // ===== QUOTE FORM =====
  const quoteForm = document.getElementById("quote-form");
  const quoteStatus = document.getElementById("quote-status");
  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(quoteForm, quoteStatus);
    });
  }

  // ===== JOB APPLY FORM =====
  const applyForm = document.getElementById("job-form");
  const applyStatus = document.getElementById("apply-status");
  if (applyForm) {
    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(applyForm, applyStatus);
    });
  }

  // ===== PREFILL APPLY FORM AND SCROLL =====
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

