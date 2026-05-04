document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 0. Light copy deterrent
  // -----------------------------
  const isInteractiveElement = (target) =>
    Boolean(
      target.closest(
        "input, textarea, select, button, a, label, form, [contenteditable='true'], #msk-chatbot-root, #msk-chatbot-panel, #msk-chatbot-toggle"
      )
    );

  document.addEventListener("contextmenu", (event) => {
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
  });

  document.addEventListener("selectstart", (event) => {
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
  });

  // -----------------------------
  // 1. MSK ERP enquiry endpoint
  // -----------------------------
  const ERP_ENQUIRY_ENDPOINT =
    "https://msk-erp.onrender.com/website-chatbot/api/enquiry/";
  const FORM_FAILURE_MESSAGE =
    "Submission failed. Please try again or email info@mskprecisiongroup.com";
  const FORM_SLOW_MESSAGE = "Please wait, submitting your request...";

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
  // 2a. Highlight routed sections
  // -----------------------------
  const routedSectionHashes = new Set(["#quote", "#apply", "#contact"]);

  function highlightRoutedSection() {
    const hash = window.location.hash;
    if (!routedSectionHashes.has(hash)) return;

    const section = document.querySelector(hash);
    if (!section) return;

    section.classList.remove("section-route-highlight");
    window.requestAnimationFrame(() => {
      section.classList.add("section-route-highlight");
    });

    window.setTimeout(() => {
      section.classList.remove("section-route-highlight");
    }, 2000);
  }

  ["pushState", "replaceState"].forEach((methodName) => {
    const originalMethod = window.history[methodName];
    if (typeof originalMethod !== "function") return;

    window.history[methodName] = function patchedHistoryMethod() {
      const result = originalMethod.apply(this, arguments);
      window.dispatchEvent(new Event("msk-location-change"));
      return result;
    };
  });

  window.addEventListener("hashchange", highlightRoutedSection);
  window.addEventListener("msk-location-change", highlightRoutedSection);
  window.addEventListener("load", highlightRoutedSection);

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
  // 4. Hamburger toggle
  // -----------------------------
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      navToggle.classList.toggle("open");
    });
  }

  // Close nav after clicking a link on mobile
  const closeNavAfterClick = () => {
    if (
      window.innerWidth <= 900 &&
      navLinks &&
      navLinks.classList.contains("open")
    ) {
      navLinks.classList.remove("open");
      navToggle?.classList.remove("open");
    }

    // Also close any open submenus
    document
      .querySelectorAll(".dropdown-menu.show")
      .forEach((m) => m.classList.remove("show"));
  };

  // -----------------------------
  // 5. Smooth scroll (nav & hero buttons)
  // -----------------------------
  const linkSelector =
    '.nav-links a[href^="#"], .dropdown-menu a[href^="#"], a.btn[href^="#"]';

  document.querySelectorAll(linkSelector).forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      // Is this the top-level label inside a dropdown?
      const isTopLevelDropdownLink =
        link.closest(".dropdown") && !link.closest(".dropdown-menu");

      if (isTopLevelDropdownLink) {
        // Desktop: prevent jump to section; just leave dropdown open
        if (window.innerWidth > 900) {
          e.preventDefault();
        }
        // Mobile: do nothing here; Section 6 handler will toggle the submenu
        return;
      }

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const h = header ? header.offsetHeight : headerHeight;
      const y = target.getBoundingClientRect().top + window.pageYOffset - h;
      window.scrollTo({ top: y, behavior: "smooth" });
      if (routedSectionHashes.has(id)) {
        window.history.pushState(null, "", id);
      }

      closeNavAfterClick();
    });
  });

  // -----------------------------
  // 6. Dropdown behaviour (click-driven)
  // -----------------------------
  document.querySelectorAll(".dropdown").forEach((drop) => {
    const menu = drop.querySelector(".dropdown-menu");
    const triggerLink = drop.querySelector("a[href^='#']");

    if (!menu || !triggerLink) return;

    triggerLink.addEventListener("click", (e) => {
      // Top-level dropdown labels (Services / Industries / Training / Careers)
      // should only toggle the submenu, not scroll the page.
      e.preventDefault();

      // Close any other open dropdowns first
      document.querySelectorAll(".dropdown-menu.show").forEach((m) => {
        if (m !== menu) m.classList.remove("show");
      });

      // Toggle this one
      menu.classList.toggle("show");
    });
  });

  // -----------------------------
  // 7. Init AOS
  // -----------------------------
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
    });
  }

  // -----------------------------
  // 8. Success message block
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
  // 9. Generic ERP enquiry submit
  // -----------------------------
  function readField(form, name) {
    const field = form.elements[name];
    return field ? field.value.trim() : "";
  }

  function buildProjectDetails(form) {
    const formName = readField(form, "form_name");
    const details = readField(form, "project_details") || readField(form, "details") || readField(form, "message");
    const jobTitle = readField(form, "job_title");

    return [formName, jobTitle ? `Position: ${jobTitle}` : "", details]
      .filter(Boolean)
      .join("\n\n");
  }

  function buildPayload(form) {
    const countryCode = readField(form, "country_code");
    const phone = readField(form, "phone");
    const compactPhone = phone.replace(/[\s()-]/g, "");
    const fullPhone =
      countryCode && phone && countryCode !== "Other"
        ? `${countryCode}${compactPhone}`
        : phone;

    return {
      name: readField(form, "name"),
      email: readField(form, "email"),
      phone: fullPhone,
      company: readField(form, "company"),
      country_code: countryCode,
      service_required: readField(form, "service_required"),
      project_details: buildProjectDetails(form),
      enquiry_type: readField(form, "enquiry_type"),
      source_form: readField(form, "source_form") || readField(form, "form_name") || "website_form",
      quote_status: readField(form, "quote_status"),
      source: "mskprecisiongroup.com",
      company_website: readField(form, "company_website"),
    };
  }

  function buildFormData(form, payload) {
    const formData = new FormData(form);

    Object.keys(payload).forEach((key) => {
      formData.set(key, payload[key]);
    });

    return formData;
  }

  function validatePayload(payload) {
    if (!payload.name) return "Please enter your name.";
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return "Please enter a valid email address.";
    }
    if (payload.source_form === "quote" || payload.enquiry_type === "quote") {
      if (!payload.service_required) return "Please select service type.";
      if (!payload.company) return "Company name is required";
      if (!payload.country_code) return "Please select country code.";
      if (!payload.phone) return "Phone number is required";
    }
    if (!payload.service_required) return "Please select a service.";
    if (!payload.project_details) return "Please enter your enquiry details.";
    return "";
  }

  function validateFormFiles(form) {
    if (!form || form.id !== "job-form") return "";

    const fileInput = form.elements.uploaded_file;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return "Please attach your CV before submitting the application.";
    }

    return "";
  }

  async function submitForm(form, statusEl) {
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "";

    const payload = buildPayload(form);
    const validationError = validatePayload(payload);

    if (validationError) {
      if (statusEl) {
        statusEl.textContent = validationError;
        statusEl.classList.remove("is-info", "is-success");
        statusEl.classList.add("is-error");
      }
      return;
    }

    const fileValidationError = validateFormFiles(form);
    if (fileValidationError) {
      if (statusEl) {
        statusEl.textContent = fileValidationError;
        statusEl.classList.remove("is-info", "is-success");
        statusEl.classList.add("is-error");
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Submitting...";
      statusEl.classList.remove("is-error", "is-success");
      statusEl.classList.add("is-info");
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    const slowTimer = window.setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = FORM_SLOW_MESSAGE;
        statusEl.classList.remove("is-error", "is-success");
        statusEl.classList.add("is-info");
      }
    }, 3500);

    try {
      const res = await fetch(ERP_ENQUIRY_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { Accept: "application/json" },
        body: buildFormData(form, payload),
      });

      let result = {};
      try {
        result = await res.json();
      } catch (err) {
        result = {};
      }

      if (!res.ok || result.ok !== true) {
        throw new Error(result.error || "Submission failed");
      }

      form.outerHTML = successHTML;
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = FORM_FAILURE_MESSAGE;
        statusEl.classList.remove("is-info", "is-success");
        statusEl.classList.add("is-error");
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    } finally {
      window.clearTimeout(slowTimer);
    }
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
  // 12. Keep chatbot launcher active
  // -----------------------------
  function keepChatbotButtonClickable() {
    document.body.classList.remove("msk-form-section-visible");

    const root = document.getElementById("msk-chatbot-root");
    const button = document.getElementById("msk-chatbot-toggle");

    if (root) {
      root.style.zIndex = "2147483647";
      root.style.pointerEvents = "auto";
      root.style.visibility = "visible";
    }

    if (button) {
      button.style.zIndex = "2147483647";
      button.style.pointerEvents = "auto";
      button.style.visibility = "visible";
      button.style.opacity = "1";
      button.removeAttribute("hidden");
      button.disabled = false;
    }
  }

  keepChatbotButtonClickable();

  window.addEventListener("load", keepChatbotButtonClickable);

  document.addEventListener("click", (event) => {
    const button = event.target.closest("#msk-chatbot-toggle");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.remove("msk-form-section-visible");
    keepChatbotButtonClickable();

    const panel = document.getElementById("msk-chatbot-panel");
    const input = document.getElementById("msk-chatbot-input");

    if (!panel) return;

    const isOpen = panel.classList.contains("is-open");

    if (isOpen) {
      panel.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    } else {
      panel.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");

      setTimeout(() => {
        input?.focus();
      }, 100);
    }
  }, true);

  // -----------------------------
  // 13. Prefill Apply form & scroll
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
