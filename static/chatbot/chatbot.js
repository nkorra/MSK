(function () {
  "use strict";

  const API_ENDPOINT = "https://msk-erp.onrender.com/website-chatbot/api/enquiry/";
  const FALLBACK_MESSAGE =
    "Please email info@mskprecisiongroup.com with your drawings/details.";

  const services = [
    "Engineering Consultancy",
    "CAD / 3D Modelling",
    "FEA / FEM / Structural Analysis",
    "CFD / Simulation",
    "Product Design / R&D",
    "Manufacturing / Precision Works",
    "Agriculture Machinery",
    "Medical Devices / Fixtures",
    "Mining / Heavy Industry",
    "General Quote Request",
  ];

  function injectStyles() {
    if (document.getElementById("msk-chatbot-styles")) return;

    const style = document.createElement("style");
    style.id = "msk-chatbot-styles";
    style.textContent = `
      .msk-chatbot-root {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 9999;
        font-family: Inter, Arial, sans-serif;
        color: #122033;
      }

      .msk-chatbot-button {
        border: 0;
        border-radius: 999px;
        background: #102a43;
        color: #ffffff;
        box-shadow: 0 14px 32px rgba(15, 35, 55, 0.24);
        cursor: pointer;
        font-weight: 700;
        letter-spacing: 0;
        padding: 14px 18px;
      }

      .msk-chatbot-panel {
        position: absolute;
        right: 0;
        bottom: 64px;
        width: min(380px, calc(100vw - 32px));
        max-height: min(680px, calc(100vh - 104px));
        overflow: auto;
        background: #ffffff;
        border: 1px solid #d9e2ec;
        border-radius: 14px;
        box-shadow: 0 22px 58px rgba(15, 35, 55, 0.26);
        display: none;
      }

      .msk-chatbot-root.is-open .msk-chatbot-panel {
        display: block;
      }

      .msk-chatbot-header {
        background: linear-gradient(135deg, #102a43 0%, #243b53 100%);
        color: #ffffff;
        padding: 16px 18px;
      }

      .msk-chatbot-header strong {
        display: block;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .msk-chatbot-header span {
        color: #d9e2ec;
        display: block;
        font-size: 13px;
        line-height: 1.4;
      }

      .msk-chatbot-body {
        padding: 16px 18px 18px;
      }

      .msk-chatbot-message {
        background: #f0f4f8;
        border-radius: 12px;
        line-height: 1.45;
        margin-bottom: 14px;
        padding: 12px 13px;
        font-size: 14px;
      }

      .msk-chatbot-field {
        display: block;
        margin-bottom: 10px;
      }

      .msk-chatbot-field span {
        display: block;
        color: #334e68;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 5px;
      }

      .msk-chatbot-field input,
      .msk-chatbot-field select,
      .msk-chatbot-field textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #bcccdc;
        border-radius: 8px;
        color: #122033;
        font: inherit;
        font-size: 14px;
        padding: 10px 11px;
        outline: none;
      }

      .msk-chatbot-field textarea {
        min-height: 92px;
        resize: vertical;
      }

      .msk-chatbot-field input:focus,
      .msk-chatbot-field select:focus,
      .msk-chatbot-field textarea:focus {
        border-color: #2f80ed;
        box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.14);
      }

      .msk-chatbot-submit {
        width: 100%;
        border: 0;
        border-radius: 8px;
        background: #1f6feb;
        color: #ffffff;
        cursor: pointer;
        font-weight: 700;
        padding: 11px 14px;
      }

      .msk-chatbot-submit:disabled {
        cursor: not-allowed;
        opacity: 0.72;
      }

      .msk-chatbot-status {
        min-height: 20px;
        margin-top: 10px;
        color: #486581;
        font-size: 13px;
        line-height: 1.4;
      }

      .msk-chatbot-status.is-error {
        color: #b42318;
      }

      .msk-chatbot-status.is-success {
        color: #067647;
      }

      .msk-chatbot-success {
        border: 1px solid #abefc6;
        background: #ecfdf3;
        border-radius: 12px;
        color: #05603a;
        line-height: 1.5;
        padding: 14px;
      }

      @media (max-width: 520px) {
        .msk-chatbot-root {
          right: 14px;
          bottom: 14px;
        }

        .msk-chatbot-panel {
          bottom: 58px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createOption(label) {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    return option;
  }

  function getValue(form, name) {
    const field = form.elements[name];
    return field ? field.value.trim() : "";
  }

  function setStatus(statusEl, message, kind) {
    statusEl.textContent = message;
    statusEl.classList.remove("is-error", "is-success");
    if (kind) statusEl.classList.add(kind);
  }

  function validate(payload) {
    if (!payload.name) return "Please enter your name.";
    if (!payload.email) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return "Please enter a valid email address.";
    }
    if (!payload.service_required) return "Please select the required service.";
    if (!payload.project_details) return "Please add a short project description.";
    return "";
  }

  async function submitEnquiry(form, statusEl, submitButton) {
    const payload = {
      name: getValue(form, "name"),
      email: getValue(form, "email"),
      phone: getValue(form, "phone"),
      company: getValue(form, "company"),
      service_required: getValue(form, "service_required"),
      project_details: getValue(form, "project_details"),
      source: "mskprecisiongroup.com",
      company_website: getValue(form, "company_website"),
    };

    const validationError = validate(payload);
    if (validationError) {
      setStatus(statusEl, validationError, "is-error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    setStatus(statusEl, "Sending your enquiry to MSK...", "");

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result = {};
      try {
        result = await response.json();
      } catch (error) {
        result = {};
      }

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Enquiry submission failed.");
      }

      form.innerHTML = `
        <div class="msk-chatbot-success">
          <strong>Thank you.</strong><br>
          Your enquiry has been sent to MSK Precision Engineering Group. Our team will review it and contact you soon.
        </div>
      `;
    } catch (error) {
      setStatus(statusEl, FALLBACK_MESSAGE, "is-error");
      submitButton.disabled = false;
      submitButton.textContent = "Send Enquiry";
    }
  }

  function buildWidget() {
    if (document.getElementById("msk-chatbot-root")) return;

    injectStyles();

    const root = document.createElement("div");
    root.id = "msk-chatbot-root";
    root.className = "msk-chatbot-root";

    const panel = document.createElement("div");
    panel.className = "msk-chatbot-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "MSK enquiry chatbot");

    const header = document.createElement("div");
    header.className = "msk-chatbot-header";
    header.innerHTML = `
      <strong>Ask MSK</strong>
      <span>Tell us what you need. We will route your enquiry to the right engineering team.</span>
    `;

    const body = document.createElement("div");
    body.className = "msk-chatbot-body";

    const intro = document.createElement("div");
    intro.className = "msk-chatbot-message";
    intro.textContent =
      "For drawings, STEP/IGES/STL/PDF files, please mention them in the message. We can request attachments by email after reviewing your enquiry.";

    const form = document.createElement("form");
    form.noValidate = true;
    form.innerHTML = `
      <input type="text" name="company_website" value="" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;" aria-hidden="true">
      <label class="msk-chatbot-field">
        <span>Name</span>
        <input type="text" name="name" autocomplete="name" required>
      </label>
      <label class="msk-chatbot-field">
        <span>Email</span>
        <input type="email" name="email" autocomplete="email" required>
      </label>
      <label class="msk-chatbot-field">
        <span>Phone</span>
        <input type="tel" name="phone" autocomplete="tel">
      </label>
      <label class="msk-chatbot-field">
        <span>Company</span>
        <input type="text" name="company" autocomplete="organization">
      </label>
      <label class="msk-chatbot-field">
        <span>Required Service</span>
        <select name="service_required" required></select>
      </label>
      <label class="msk-chatbot-field">
        <span>Project Details</span>
        <textarea name="project_details" required></textarea>
      </label>
      <button class="msk-chatbot-submit" type="submit">Send Enquiry</button>
      <div class="msk-chatbot-status" aria-live="polite"></div>
    `;

    const select = form.elements.service_required;
    select.appendChild(createOption(""));
    services.forEach((service) => select.appendChild(createOption(service)));

    const statusEl = form.querySelector(".msk-chatbot-status");
    const submitButton = form.querySelector(".msk-chatbot-submit");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitEnquiry(form, statusEl, submitButton);
    });

    body.append(intro, form);
    panel.append(header, body);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "msk-chatbot-button";
    button.textContent = "Ask MSK";
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", () => {
      const isOpen = root.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });

    root.append(panel, button);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
