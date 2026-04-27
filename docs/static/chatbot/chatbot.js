(function () {
  "use strict";

  const GETFORM_ENDPOINT = "https://getform.io/f/amdjpymb";

  const SERVICES = [
    "Engineering",
    "Manufacturing",
    "R&D",
    "Others"
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function createElement(tag, attrs, text) {
    const el = document.createElement(tag);

    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") {
        el.className = attrs[key];
      } else if (key === "style") {
        Object.assign(el.style, attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    });

    if (text) {
      el.textContent = text;
    }

    return el;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function showError(message) {
    const errorEl = document.getElementById("msk-chatbot-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  }

  function clearError() {
    const errorEl = document.getElementById("msk-chatbot-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }
  }

  function submitToGetform(data) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GETFORM_ENDPOINT;
    form.style.display = "none";

    const fields = {
      form_name: "MSK Precision Website Chatbot Enquiry",
      name: data.name,
      email: data.email,
      service_required: data.service_required,
      project_details: data.project_details
    };

    Object.keys(fields).forEach(function (key) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key] || "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  function buildChatbot() {
    if (document.getElementById("msk-chatbot-root")) {
      return;
    }

    const style = createElement("style", {}, `
      #msk-chatbot-root {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 99999;
        font-family: Arial, Helvetica, sans-serif;
      }

      #msk-chatbot-toggle {
        background: #0f2742;
        color: #ffffff;
        border: none;
        border-radius: 999px;
        padding: 13px 18px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 28px rgba(15, 39, 66, 0.28);
      }

      #msk-chatbot-toggle:hover {
        background: #173a5f;
      }

      #msk-chatbot-panel {
        display: none;
        width: 360px;
        max-width: calc(100vw - 40px);
        background: #ffffff;
        border: 1px solid #d7dee8;
        border-radius: 14px;
        box-shadow: 0 18px 48px rgba(15, 39, 66, 0.22);
        overflow: hidden;
        margin-bottom: 12px;
      }

      #msk-chatbot-panel.is-open {
        display: block;
      }

      .msk-chatbot-header {
        background: #0f2742;
        color: #ffffff;
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .msk-chatbot-title {
        font-size: 15px;
        font-weight: 700;
      }

      .msk-chatbot-subtitle {
        font-size: 12px;
        opacity: 0.82;
        margin-top: 3px;
      }

      #msk-chatbot-close {
        background: transparent;
        color: #ffffff;
        border: none;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .msk-chatbot-body {
        padding: 16px;
        background: #f7f9fc;
      }

      .msk-chatbot-intro {
        margin: 0 0 14px;
        color: #43566f;
        font-size: 13px;
        line-height: 1.45;
      }

      .msk-chatbot-field {
        margin-bottom: 12px;
      }

      .msk-chatbot-field label {
        display: block;
        margin-bottom: 5px;
        color: #24384f;
        font-size: 12px;
        font-weight: 700;
      }

      .msk-chatbot-field input,
      .msk-chatbot-field select,
      .msk-chatbot-field textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 9px;
        padding: 10px;
        font-size: 13px;
        color: #172033;
        background: #ffffff;
        outline: none;
      }

      .msk-chatbot-field textarea {
        min-height: 95px;
        resize: vertical;
      }

      .msk-chatbot-field input:focus,
      .msk-chatbot-field select:focus,
      .msk-chatbot-field textarea:focus {
        border-color: #0f2742;
        box-shadow: 0 0 0 3px rgba(15, 39, 66, 0.12);
      }

      #msk-chatbot-error {
        display: none;
        margin-bottom: 12px;
        padding: 9px 10px;
        border-radius: 8px;
        background: #fff1f2;
        color: #9f1239;
        border: 1px solid #fecdd3;
        font-size: 12px;
        font-weight: 700;
      }

      #msk-chatbot-submit {
        width: 100%;
        border: none;
        border-radius: 9px;
        background: #0f2742;
        color: #ffffff;
        padding: 11px 14px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }

      #msk-chatbot-submit:hover {
        background: #173a5f;
      }

      #msk-chatbot-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      @media (max-width: 520px) {
        #msk-chatbot-root {
          right: 14px;
          bottom: 14px;
        }

        #msk-chatbot-panel {
          width: calc(100vw - 28px);
        }
      }
    `);

    document.head.appendChild(style);

    const root = createElement("div", { id: "msk-chatbot-root" });

    const panel = createElement("div", { id: "msk-chatbot-panel" });

    const header = createElement("div", { className: "msk-chatbot-header" });
    const headingWrap = createElement("div");
    headingWrap.appendChild(createElement("div", { className: "msk-chatbot-title" }, "MSK Precision Group"));
    headingWrap.appendChild(createElement("div", { className: "msk-chatbot-subtitle" }, "Engineering enquiry assistant"));

    const closeButton = createElement("button", {
      id: "msk-chatbot-close",
      type: "button",
      "aria-label": "Close chatbot"
    }, "×");

    header.appendChild(headingWrap);
    header.appendChild(closeButton);

    const body = createElement("div", { className: "msk-chatbot-body" });

    const intro = createElement(
      "p",
      { className: "msk-chatbot-intro" },
      "Tell us briefly what you need. Your enquiry will be sent to the MSK team for review."
    );

    const error = createElement("div", { id: "msk-chatbot-error" });

    const form = createElement("div", { id: "msk-chatbot-form" });

    const nameField = createElement("div", { className: "msk-chatbot-field" });
    nameField.appendChild(createElement("label", { for: "msk-chatbot-name" }, "Name"));
    nameField.appendChild(createElement("input", {
      id: "msk-chatbot-name",
      type: "text",
      autocomplete: "name",
      placeholder: "Your name"
    }));

    const emailField = createElement("div", { className: "msk-chatbot-field" });
    emailField.appendChild(createElement("label", { for: "msk-chatbot-email" }, "Email"));
    emailField.appendChild(createElement("input", {
      id: "msk-chatbot-email",
      type: "email",
      autocomplete: "email",
      placeholder: "you@example.com"
    }));

    const serviceField = createElement("div", { className: "msk-chatbot-field" });
    serviceField.appendChild(createElement("label", { for: "msk-chatbot-service" }, "Requirement"));
    const serviceSelect = createElement("select", { id: "msk-chatbot-service" });
    serviceSelect.appendChild(createElement("option", { value: "" }, "Select requirement"));

    SERVICES.forEach(function (service) {
      serviceSelect.appendChild(createElement("option", { value: service }, service));
    });

    serviceField.appendChild(serviceSelect);

    const messageField = createElement("div", { className: "msk-chatbot-field" });
    messageField.appendChild(createElement("label", { for: "msk-chatbot-message" }, "Project details"));
    messageField.appendChild(createElement("textarea", {
      id: "msk-chatbot-message",
      placeholder: "Briefly describe your requirement, drawings/files available, timeline, material, quantity, or analysis need."
    }));

    const submitButton = createElement("button", {
      id: "msk-chatbot-submit",
      type: "button"
    }, "Submit enquiry");

    form.appendChild(nameField);
    form.appendChild(emailField);
    form.appendChild(serviceField);
    form.appendChild(messageField);
    form.appendChild(submitButton);

    body.appendChild(intro);
    body.appendChild(error);
    body.appendChild(form);

    panel.appendChild(header);
    panel.appendChild(body);

    const toggleButton = createElement("button", {
      id: "msk-chatbot-toggle",
      type: "button"
    }, "Ask MSK");

    root.appendChild(panel);
    root.appendChild(toggleButton);
    document.body.appendChild(root);

    toggleButton.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });

    closeButton.addEventListener("click", function () {
      panel.classList.remove("is-open");
    });

    submitButton.addEventListener("click", function () {
      clearError();

      const name = document.getElementById("msk-chatbot-name").value.trim();
      const email = document.getElementById("msk-chatbot-email").value.trim();
      const service = document.getElementById("msk-chatbot-service").value.trim();
      const message = document.getElementById("msk-chatbot-message").value.trim();

      if (!name) {
        showError("Please enter your name.");
        return;
      }

      if (!email || !isValidEmail(email)) {
        showError("Please enter a valid email address.");
        return;
      }

      if (!service) {
        showError("Please select your requirement.");
        return;
      }

      if (!message) {
        showError("Please enter your project details.");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      try {
        submitToGetform({
          name: name,
          email: email,
          service_required: service,
          project_details: message
        });
      } catch (error) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit enquiry";
        showError("Could not submit the form. Please try again.");
      }
    });
  }

  ready(buildChatbot);
})();
