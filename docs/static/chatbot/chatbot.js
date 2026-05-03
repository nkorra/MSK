(function () {
  "use strict";

  const API_ENDPOINT = "https://msk-erp.onrender.com/website-chatbot/api/enquiry/";
  const FALLBACK_REPLY =
    "I can help with MSK services, CNC machining, engineering consultancy, 3D printing, industries, careers, training, or quote requests. What would you like to know?";
  const SUCCESS_REPLY = "Thank you. Our engineering team will contact you.";
  const POST_ANSWER_REPLIES = ["Request Quote", "Talk to Team", "View Services"];
  const WELCOME_POPUP_MESSAGE = "Welcome to MSK Precision Engineering Works. How can we help you today?";
  const AUTO_POPUP_STORAGE_KEY = "msk_chatbot_welcome_shown";
  const AUTO_POPUP_DELAY_MS = 2500;

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
      keywords: [
        "about msk",
        "tell me about msk",
        "something about msk",
        "can you tell me something about msk",
        "who is msk",
        "who are you",
        "what is msk",
        "msk precision",
        "company profile",
      ],
      response:
        "MSK Precision Engineering Group supports engineering teams from concept to manufacturing.\n\n- Engineering consultancy, FEM/FEA, CFD and design support\n- CNC machining, CAD/CAM and precision manufacturing\n- 3D printing, prototypes, fixtures and R&D support",
    },
    {
      keywords: [
        "service",
        "services",
        "what do you do",
        "what msk does",
        "what does msk do",
        "what your company does",
        "what are your capabilities",
        "capabilities",
        "work do you do",
      ],
      response:
        "MSK helps customers turn engineering requirements into practical, manufacturable solutions.\n\n- Design, CAD/CAM, FEM/FEA, CFD and technical reports\n- CNC machining, precision parts, prototypes and fixtures\n- R&D, validation planning, training and project support",
    },
    {
      keywords: [
        "contact",
        "contact msk",
        "email",
        "phone",
        "reach you",
        "reach msk",
        "talk to you",
        "speak to",
        "how can i contact",
        "how to contact",
      ],
      response:
        "You can contact MSK by emailing info@mskprecisiongroup.com. You can also share your requirement here and I can capture it for the engineering team.",
    },
    {
      keywords: [
        "location",
        "where are you",
        "where is msk",
        "address",
        "office",
        "facility",
        "hyderabad",
        "telangana",
      ],
      response:
        "MSK Precision Engineering Group is based in Telangana, India. The registered office is in Cherlapally, Kapra, Medchal Malkajgiri, and the upcoming facility is at IP-Madharam, Ghatkesar.",
    },
    {
      keywords: ["industry", "industries", "sector", "sectors", "markets", "domains", "clients"],
      response:
        "MSK works across precision engineering, manufacturing, agriculture machinery, medical fixtures, mining and heavy industry, defence, marine, rail, aerospace, automotive, energy, and R&D projects.",
    },
    {
      keywords: [
        "cnc",
        "machining",
        "machine shop",
        "milling",
        "turning",
        "precision machining",
        "manufacture part",
        "manufacturing part",
        "make component",
      ],
      response:
        "MSK can support CNC machining from drawing review to manufacturable parts.\n\n- Capability: milling/turning workflow planning, tolerances, materials, inspection and DFM review\n- Industries: aerospace, defence, automotive, medical fixtures, mining, agriculture and industrial equipment",
    },
    {
      keywords: [
        "engineering consultancy",
        "consultancy",
        "consultant",
        "engineering support",
        "engineering help",
        "design support",
        "analysis support",
        "technical support",
      ],
      response:
        "MSK engineering consultancy is built around practical design decisions and manufacturable outcomes.\n\n- FEM/FEA, CFD, offshore/marine structures and mechanical design support\n- Concept review, CAD strategy, load cases, validation plans and technical documentation",
    },
    {
      keywords: [
        "3d printing",
        "3d print",
        "additive",
        "additive manufacturing",
        "prototype",
        "prototyping",
        "printing",
      ],
      response:
        "MSK can support 3D printing and additive manufacturing for prototypes, fixtures, design validation, and early R&D trials. Share the part purpose, material need, size, and available files.",
    },
    {
      keywords: ["training", "course", "student", "learn", "workshop", "cad training", "cnc training", "intern training"],
      response:
        "MSK offers practical engineering and manufacturing-oriented training across CAD/CAM, CNC workflow, simulation awareness, product development, and student project guidance.",
    },
    {
      keywords: [
        "career",
        "careers",
        "job",
        "jobs",
        "internship",
        "intern",
        "hiring",
        "vacancy",
        "apply",
        "work with msk",
      ],
      response:
        "For careers or internships, please share your role interest, background, and contact details. The MSK team can review and follow up by email.",
    },
    {
      keywords: [
        "quote process",
        "quotation process",
        "how quote",
        "quote procedure",
        "how to get quote",
        "how do i get a quote",
        "quotation",
        "proposal process",
      ],
      response:
        "For quotes, MSK usually reviews your requirement, drawings/CAD files, material, quantity, tolerances, timeline, and acceptance criteria, then confirms scope before preparing a quotation.",
    },
  ];

  const quoteTriggers = [
    "quote",
    "quotation",
    "project",
    "cost",
    "proposal",
    "price",
    "pricing",
    "estimate",
    "rfq",
  ];

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
        return isValidEmail(value) ? "" : "Please enter a valid email address (e.g., name@example.com).";
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
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s&/@.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function includesAny(message, keywords) {
    const text = normalise(message);
    return keywords.some(function (keyword) {
      return text.includes(normalise(keyword));
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
        handleQuickReply(option);
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

  function handleQuickReply(option) {
    const action = normalise(option);

    if (action === "request quote" || action === "talk to team") {
      addMessage("user", option);
      startGuidedFlow();
      return;
    }

    if (action === "view services") {
      handleUserText("services");
      return;
    }

    handleUserText(option);
  }

  function moveGuidedFlow(value) {
    const step = guidedSteps[state.stepIndex];
    const answer = String(value || "").trim();
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
      service_required: state.enquiry.service_required || "General Quote Request",
      project_details: state.enquiry.project_details,
      source_form: "chatbot",
      enquiry_type: "chatbot",
      quote_status: "draft",
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
      renderQuickReplies(POST_ANSWER_REPLIES);
      return;
    }

    botReply(FALLBACK_REPLY);
    renderQuickReplies(POST_ANSWER_REPLIES);
  }

  function handleUserText(rawText) {
    const text = String(rawText || "").trim();
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

  function hasAutoPopupShown() {
    try {
      return window.sessionStorage.getItem(AUTO_POPUP_STORAGE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markAutoPopupShown() {
    try {
      window.sessionStorage.setItem(AUTO_POPUP_STORAGE_KEY, "1");
    } catch (error) {
      // Ignore storage failures so the chatbot still works in privacy-restricted browsers.
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

    function openPanel(shouldFocus) {
      panel.classList.add("is-open");
      toggleButton.setAttribute("aria-expanded", "true");

      if (shouldFocus) {
        window.setTimeout(function () {
          input.focus();
        }, 100);
      }
    }

    function closePanel() {
      panel.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
    }

    toggleButton.addEventListener("click", function () {
      const isOpen = panel.classList.contains("is-open");

      if (isOpen) {
        closePanel();
      } else {
        openPanel(true);
        markAutoPopupShown();
      }
    });

    closeButton.addEventListener("click", function () {
      closePanel();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      handleUserText(input.value);
    });

    setComposerPlaceholder();
    addMessage("bot", WELCOME_POPUP_MESSAGE);
    renderQuickReplies(["Services", "Industries", "Quote process", "Request a quote"]);

    window.setTimeout(function () {
      if (hasAutoPopupShown()) return;

      openPanel(false);
      markAutoPopupShown();
    }, AUTO_POPUP_DELAY_MS);
  }

  ready(buildChatbot);
})();
