(function () {
  "use strict";

  const API_ENDPOINT = "https://msk-erp.onrender.com/website-chatbot/api/enquiry/";
  const FALLBACK_REPLY = "I'm not fully sure. Can you share your requirement?";
  const SUCCESS_REPLY = "Thank you. Our engineering team will contact you.";

  const services = [
    "Engineering Consultancy",
    "CAD / 3D Modelling",
    "FEA / FEM / Structural Analysis",
    "CFD / Simulation",
    "CNC Machining",
    "3D Printing / Additive Manufacturing",
    "Product Design / R&D",
    "Manufacturing / Precision Works",
    "Training",
    "Careers",
    "General Quote Request",
  ];

  const knowledgeBase = [
    {
      keywords: ["service", "services", "what do you do", "capabilities"],
      response:
        "MSK supports engineering consultancy, CAD/3D modelling, FEA/FEM and CFD simulation, CNC machining, 3D printing, R&D/product development, precision manufacturing, training, and technical project support.",
    },
    {
      keywords: ["industry", "industries", "sector", "sectors"],
      response:
        "MSK works across precision engineering, manufacturing, agriculture machinery, medical fixtures, mining and heavy industry, defence, marine, rail, aerospace, automotive, energy, and R&D projects.",
    },
    {
      keywords: ["cnc", "machining", "machine shop", "milling", "turning"],
      response:
        "For CNC machining, MSK can review drawings, material, tolerances, quantities, inspection needs, and delivery expectations to plan a manufacturable quotation.",
    },
    {
      keywords: ["engineering consultancy", "consultancy", "consultant", "engineering support"],
      response:
        "MSK engineering consultancy covers concept review, mechanical design, analysis planning, FEA/CFD support, manufacturing feasibility, documentation, and validation planning.",
    },
    {
      keywords: ["3d printing", "additive", "prototype", "printing"],
      response:
        "MSK can support 3D printing and additive manufacturing for prototypes, fixtures, design validation, and early R&D trials. Share the part purpose, material need, size, and available files.",
    },
    {
      keywords: ["training", "course", "student", "learn"],
      response:
        "MSK offers practical engineering and manufacturing-oriented training across CAD/CAM, CNC workflow, simulation awareness, product development, and student project guidance.",
    },
    {
      keywords: ["career", "careers", "job", "internship", "hiring", "vacancy"],
      response:
        "For careers or internships, please share your role interest, background, and contact details. The MSK team can review and follow up by email.",
    },
    {
      keywords: ["quote process", "quotation process", "how quote", "quote procedure"],
      response:
        "For quotes, MSK usually reviews your requirement, drawings/CAD files, material, quantity, tolerances, timeline, and acceptance criteria, then confirms scope before preparing a quotation.",
    },
  ];

  const quoteTriggers = ["quote", "project", "cost", "proposal", "price", "estimate", "rfq"];

  const guidedSteps = [
    {
      key: "name",
      prompt: "Sure. Let's capture the basics first. What is your name?",
      validate(value) {
        return value ? "" : "Please enter your name.";
      },
    },
    {
      key: "email",
      prompt: "Thanks. What email should our engineering team use?",
      validate(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Please enter a valid email address.";
      },
    },
    {
      key: "phone",
      prompt: "Please share your phone number. You can type N/A if you prefer email only.",
      validate(value) {
        return value ? "" : "Please enter a phone number or N/A.";
      },
    },
    {
      key: "company",
      prompt: "What company or organisation are you from? You can type Individual if not applicable.",
      validate(value) {
        return value ? "" : "Please enter your company name or Individual.";
      },
    },
    {
      key: "service_required",
      prompt: "Which service do you need?",
      validate(value) {
        return value ? "" : "Please select or type the service required.";
      },
    },
    {
      key: "project_details",
      prompt:
        "Please describe the project, part, analysis, drawings/files available, material, quantity, timeline, or any constraints.",
      validate(value) {
        return value.length >= 10 ? "" : "Please add a little more project detail.";
      },
    },
  ];

  const state = {
    mode: "chat",
    stepIndex: 0,
    enquiry: {},
    isSubmitting: false,
  };

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
      } else {
        el.setAttribute(key, attrs[key]);
      }
    });
    if (text) el.textContent = text;
    return el;
  }

  function normalise(value) {
    return String(value || "").trim();
  }

  function includesAny(message, keywords) {
    const text = message.toLowerCase();
    return keywords.some(function (keyword) {
      return text.includes(keyword);
    });
  }

  function matchKnowledge(message) {
    return knowledgeBase.find(function (item) {
      return includesAny(message, item.keywords);
    });
  }

  function shouldStartGuidedFlow(message) {
    return includesAny(message, quoteTriggers);
  }

  function scrollMessages() {
    const messages = document.getElementById("msk-chatbot-messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(sender, text) {
    const messages = document.getElementById("msk-chatbot-messages");
    if (!messages) return;

    const message = createElement("div", {
      className: `msk-chat-message msk-chat-message-${sender}`,
    });
    message.textContent = text;
    messages.appendChild(message);
    scrollMessages();
  }

  function showTyping(callback) {
    const messages = document.getElementById("msk-chatbot-messages");
    if (!messages) {
      callback();
      return;
    }

    const typing = createElement("div", {
      className: "msk-chat-message msk-chat-message-bot msk-chat-typing",
    });
    typing.textContent = "MSK is typing...";
    messages.appendChild(typing);
    scrollMessages();

    window.setTimeout(function () {
      typing.remove();
      callback();
    }, 350);
  }

  function botReply(text) {
    showTyping(function () {
      addMessage("bot", text);
    });
  }

  function setInputEnabled(enabled) {
    const input = document.getElementById("msk-chatbot-input");
    const sendButton = document.getElementById("msk-chatbot-send");
    if (input) input.disabled = !enabled;
    if (sendButton) sendButton.disabled = !enabled;
  }

  function setComposerPlaceholder() {
    const input = document.getElementById("msk-chatbot-input");
    if (!input) return;

    if (state.mode === "guided") {
      input.placeholder = state.stepIndex === 4 ? "Type or choose a service..." : "Type your answer...";
    } else {
      input.placeholder = "Ask about services, CNC, careers, training, or request a quote...";
    }
  }

  function renderQuickReplies(options) {
    const quickReplies = document.getElementById("msk-chatbot-quick-replies");
    if (!quickReplies) return;

    quickReplies.innerHTML = "";
    options.forEach(function (option) {
      const button = createElement("button", { type: "button" }, option);
      button.addEventListener("click", function () {
        handleUserText(option);
      });
      quickReplies.appendChild(button);
    });
  }

  function clearQuickReplies() {
    const quickReplies = document.getElementById("msk-chatbot-quick-replies");
    if (quickReplies) quickReplies.innerHTML = "";
  }

  function startGuidedFlow() {
    state.mode = "guided";
    state.stepIndex = 0;
    state.enquiry = {};
    setComposerPlaceholder();
    clearQuickReplies();
    botReply(guidedSteps[0].prompt);
  }

  function moveGuidedFlow(value) {
    const step = guidedSteps[state.stepIndex];
    const answer = normalise(value);
    const error = step.validate(answer);

    if (error) {
      botReply(error);
      return;
    }

    state.enquiry[step.key] = step.key === "phone" && answer.toLowerCase() === "n/a" ? "" : answer;
    state.stepIndex += 1;

    if (state.stepIndex < guidedSteps.length) {
      const nextStep = guidedSteps[state.stepIndex];
      setComposerPlaceholder();
      if (nextStep.key === "service_required") {
        renderQuickReplies(services);
      } else {
        clearQuickReplies();
      }
      botReply(nextStep.prompt);
      return;
    }

    clearQuickReplies();
    submitEnquiry();
  }

  async function submitEnquiry() {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    setInputEnabled(false);
    addMessage("bot", "Submitting your enquiry to MSK ERP...");

    const payload = {
      name: state.enquiry.name,
      email: state.enquiry.email,
      phone: state.enquiry.phone || "",
      company: state.enquiry.company || "",
      service_required: state.enquiry.service_required,
      project_details: state.enquiry.project_details,
      source_form: "chatbot",
      enquiry_type: "quote",
      source: "mskprecisiongroup.com",
      company_website: "",
    };

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
        throw new Error(result.error || "Submission failed");
      }

      addMessage("bot", SUCCESS_REPLY);
      state.mode = "chat";
      state.stepIndex = 0;
      state.enquiry = {};
    } catch (error) {
      addMessage("bot", "Please email info@mskprecisiongroup.com with your drawings/details.");
    } finally {
      state.isSubmitting = false;
      setInputEnabled(true);
      setComposerPlaceholder();
      renderQuickReplies(["Services", "Industries", "Quote process", "Request a quote"]);
    }
  }

  function handleChatMessage(text) {
    if (shouldStartGuidedFlow(text)) {
      startGuidedFlow();
      return;
    }

    const matched = matchKnowledge(text);
    if (matched) {
      botReply(matched.response);
      return;
    }

    botReply(FALLBACK_REPLY);
  }

  function handleUserText(rawText) {
    const text = normalise(rawText);
    if (!text || state.isSubmitting) return;

    const input = document.getElementById("msk-chatbot-input");
    if (input) input.value = "";

    addMessage("user", text);

    if (state.mode === "guided") {
      moveGuidedFlow(text);
    } else {
      handleChatMessage(text);
    }
  }

  function buildChatbot() {
    if (document.getElementById("msk-chatbot-root")) return;

    const root = createElement("div", { id: "msk-chatbot-root" });
    const panel = createElement("div", {
      id: "msk-chatbot-panel",
      role: "dialog",
      "aria-label": "MSK Engineering Assistant",
    });

    const header = createElement("div", { className: "msk-chatbot-header" });
    const titleWrap = createElement("div");
    titleWrap.appendChild(createElement("div", { className: "msk-chatbot-title" }, "MSK Engineering Assistant"));
    titleWrap.appendChild(createElement("div", { className: "msk-chatbot-subtitle" }, "Services, quotes, careers and engineering enquiries"));

    const closeButton = createElement("button", {
      id: "msk-chatbot-close",
      type: "button",
      "aria-label": "Close chatbot",
    }, "×");

    header.appendChild(titleWrap);
    header.appendChild(closeButton);

    const messages = createElement("div", { id: "msk-chatbot-messages" });
    const quickReplies = createElement("div", { id: "msk-chatbot-quick-replies" });

    const form = createElement("form", { id: "msk-chatbot-composer" });
    const input = createElement("input", {
      id: "msk-chatbot-input",
      type: "text",
      autocomplete: "off",
      "aria-label": "Message",
    });
    const sendButton = createElement("button", { id: "msk-chatbot-send", type: "submit" }, "Send");
    form.appendChild(input);
    form.appendChild(sendButton);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(quickReplies);
    panel.appendChild(form);

    const toggleButton = createElement("button", {
      id: "msk-chatbot-toggle",
      type: "button",
      "aria-expanded": "false",
    }, "Ask MSK");

    root.appendChild(panel);
    root.appendChild(toggleButton);
    document.body.appendChild(root);

    toggleButton.addEventListener("click", function () {
      const isOpen = panel.classList.toggle("is-open");
      toggleButton.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) input.focus();
    });

    closeButton.addEventListener("click", function () {
      panel.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      handleUserText(input.value);
    });

    setComposerPlaceholder();
    addMessage("bot", "Hi, I'm MSK Engineering Assistant. How can I help you?");
    renderQuickReplies(["Services", "Industries", "Quote process", "Request a quote"]);
  }

  ready(buildChatbot);
})();
