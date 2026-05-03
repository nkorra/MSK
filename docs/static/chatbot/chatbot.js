(function () {
  "use strict";

  const API_ENDPOINT = "https://msk-erp.onrender.com/website-chatbot/api/enquiry/";
  const FALLBACK_REPLY =
    "I can help with engineering services, CNC machining, CAD/CAM/CAE, 3D printing, scanning, welding/fabrication, contact details, or quote requests. What would you like to know?";
  const SUCCESS_REPLY = "Thank you. Your enquiry has been received. Our team will contact you shortly.";
  const SUBMISSION_FALLBACK_REPLY =
    "The ERP system is taking longer than expected. Please email your enquiry to info@mskprecisiongroup.com, or try again in a few minutes.";
  const SUBMISSION_WAIT_REPLY =
    "Submitting your enquiry to MSK ERP. This may take up to 30 seconds if the system is waking up.";
  const POST_ANSWER_REPLIES = ["Request Quote", "Talk to Team", "View Services"];
  const WELCOME_POPUP_MESSAGE = "Welcome to MSK Precision Engineering Works. How can we help you today?";
  const AUTO_POPUP_STORAGE_KEY = "msk_chatbot_welcome_shown";
  const AUTO_POPUP_DELAY_MS = 2500;
  const SUBMISSION_TIMEOUT_MS = 45000;
  const QUOTE_FORM_URL = "#quote";
  const CAREERS_URL = "#apply";
  const CONTACT_URL = "#contact";

  const services = [
    "Engineering Consultancy",
    "CAD / 3D Modelling",
    "FEA / FEM / Structural Analysis",
    "CFD / Simulation",
    "CNC Machining",
    "CAD / CAM / CAE",
    "3D Printing / Additive Manufacturing",
    "Scanning / Reverse Engineering",
    "Welding / Fabrication",
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
        "engineering services",
        "what do you do",
        "what msk does",
        "what does msk do",
        "what your company does",
        "what are your capabilities",
        "capabilities",
        "work do you do",
      ],
      response:
        "MSK helps customers turn engineering requirements into practical, manufacturable solutions.\n\n- Engineering: design review, CAD/CAM/CAE, FEA/CFD and reports\n- Manufacturing: CNC machining, welding, fabrication and precision parts\n- R&D: prototypes, 3D printing, scanning and product development\n\nFor a quotation, tell me your service and project details.",
    },
    {
      keywords: [
        "contact",
        "contact msk",
        "email",
        "phone",
        "mobile",
        "call",
        "reach you",
        "reach msk",
        "talk to you",
        "speak to",
        "how can i contact",
        "how to contact",
      ],
      response:
        "You can contact MSK at info@mskprecisiongroup.com.\n\nYou can also share your requirement here and I will capture it for the engineering team.",
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
        "MSK supports CNC machining from drawing review to finished parts.\n\n- CNC milling/turning workflow planning, tolerances and material review\n- CAD/CAM readiness, DFM checks and inspection planning\n- Suitable for prototypes, fixtures and precision components\n\nShare drawings, material, quantity and timeline for a quote.",
    },
    {
      keywords: [
        "engineering",
        "engineering services",
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
        "MSK engineering services focus on practical, manufacturable decisions.\n\n- Mechanical design, design review, DFM and technical documentation\n- FEA/FEM, CFD, load cases, boundary conditions and validation planning\n- Support for concept, prototype and industrial product development\n\nFor a quote, share the problem statement, inputs and expected deliverables.",
    },
    {
      keywords: [
        "cad",
        "computer aided design",
        "drawing",
        "drawings",
        "2d drawing",
        "manufacturing drawing",
        "3d model",
        "3d modelling",
        "3d modeling",
        "modelling",
        "modeling",
      ],
      response:
        "MSK can support CAD work for engineering and manufacturing.\n\n- 3D models, 2D manufacturing drawings, assemblies, fixtures and jigs\n- Drawing cleanup, concept layouts and design-for-manufacture review\n\nShare sketches, photos, existing drawings or part requirements to start a quote.",
    },
    {
      keywords: [
        "cam",
        "computer aided manufacturing",
        "toolpath",
        "tool path",
        "machining strategy",
        "cnc programming",
        "g code",
      ],
      response:
        "MSK can support CAM and manufacturing planning for CNC jobs.\n\n- Toolpath strategy, setup planning, machining sequence and fixture approach\n- CAD/CAM review for manufacturability, tolerance and inspection needs\n\nShare CAD files, drawings, material and quantity for review.",
    },
    {
      keywords: [
        "cae",
        "analysis",
        "simulation",
        "fea",
        "fem",
        "cfd",
        "structural analysis",
        "stress analysis",
        "thermal analysis",
        "flow analysis",
      ],
      response:
        "MSK supports CAE, FEA and simulation planning for engineering decisions.\n\n- Structural FEA/FEM, CFD/flow, thermal and design review support\n- Load cases, boundary conditions, assumptions, acceptance criteria and reports\n\nFor a quote, share geometry, loads, constraints, materials and required outputs.",
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
        "MSK can support 3D printing and additive manufacturing for prototypes, fixtures and design validation.\n\n- Useful for early R&D, fit checks, concept trials and low-volume prototype parts\n- Share part size, material preference, purpose, quantity and available CAD files for review.",
    },
    {
      keywords: [
        "scanning",
        "3d scanning",
        "scan",
        "reverse engineering",
        "reverse engineer",
        "part scanning",
        "point cloud",
        "measure existing part",
        "copy part",
        "legacy part",
      ],
      response:
        "MSK can support 3D scanning and reverse engineering workflows.\n\n- Existing part review, scan/point-cloud input, measurement capture and CAD reconstruction\n- Output can include 3D model, drawing, fit/function notes and manufacturing-ready data where feasible\n\nShare photos, dimensions and the part purpose to start.",
    },
    {
      keywords: [
        "welding",
        "fabrication",
        "fabricate",
        "weld",
        "structure fabrication",
        "frames",
        "brackets",
        "sheet metal",
        "heavy fabrication",
      ],
      response:
        "MSK can support welding and fabrication enquiries for industrial components and equipment structures.\n\n- Frames, brackets, fixtures, sheet-metal items and welded assemblies\n- Review of drawings, material, weld requirements, tolerances and inspection expectations\n\nFor a quote, share drawings, material, quantity and usage conditions.",
    },
    {
      keywords: [
        "r&d",
        "rnd",
        "research and development",
        "product development",
        "new product",
        "prototype development",
        "concept development",
        "design development",
        "innovation",
      ],
      response:
        "MSK can support R&D and product development from concept to prototype readiness.\n\n- Concept review, CAD strategy, prototype planning and validation approach\n- Engineering calculations, FEA/CFD planning, manufacturing feasibility and test notes\n\nShare your product idea, target use, constraints and required output.",
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
        "quote",
        "request quote",
        "get quote",
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
    "request quote",
    "get a quote",
    "send enquiry",
    "submit enquiry",
  ];

  const intentDefinitions = [
    {
      name: "quote_request",
      keywords: quoteTriggers,
      response:
        "For a detailed quotation, please use our Request Quote form so you can provide drawings, files, contact details and project requirements.\n\nIf you prefer, I can still capture a basic enquiry here.",
      quickReplies: ["Capture in Chat", "Services", "Contact details"],
      actionLinks: [
        { label: "Open Request Quote Form", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "job_request",
      keywords: [
        "job",
        "jobs",
        "career",
        "careers",
        "vacancy",
        "hiring",
        "internship",
        "intern",
        "work with you",
        "work with msk",
        "resume",
        "cv",
        "employment",
        "apply",
      ],
      response:
        "For job, internship or career enquiries, please use the Careers / Apply section so you can submit your role interest and CV.\n\nIf the form is not convenient, email your CV and details to info@mskprecisiongroup.com.",
      quickReplies: ["Contact details", "Services"],
      actionLinks: [
        { label: "Open Careers / Job Enquiry", href: CAREERS_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "cnc_machining",
      keywords: [
        "cnc",
        "machining",
        "machine shop",
        "milling",
        "turning",
        "precision machining",
        "manufacture part",
        "make component",
      ],
      response:
        "MSK supports CNC machining for prototypes, fixtures and precision components.\n\n- Drawing/CAD review, material and tolerance checks\n- CNC milling/turning process planning\n- Inspection and manufacturability review",
      quickReplies: ["Request Quote", "CAD / CAM / CAE", "Contact details"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "3d_printing",
      keywords: ["3d printing", "3d print", "additive", "additive manufacturing", "prototype", "prototyping"],
      response:
        "MSK can support 3D printing and additive manufacturing for early prototypes, fit checks and R&D trials.\n\nFor detailed review, the quote form is best because you can provide files, material, size and quantity.",
      quickReplies: ["Request Quote", "R&D", "Contact details"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "scanning_reverse_engineering",
      keywords: [
        "3d scanning",
        "scanning",
        "scan",
        "reverse engineering",
        "reverse engineer",
        "point cloud",
        "copy part",
        "legacy part",
      ],
      response:
        "MSK can support 3D scanning and reverse engineering workflows.\n\n- Existing part review and measurement capture\n- CAD reconstruction and drawing creation where feasible\n- Manufacturing-ready data support after technical review",
      quickReplies: ["Request Quote", "CAD", "Contact details"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "cad_cam_cae",
      keywords: [
        "cad",
        "cam",
        "cae",
        "drawing",
        "drawings",
        "3d model",
        "3d modelling",
        "3d modeling",
        "toolpath",
        "simulation",
        "fea",
        "fem",
        "cfd",
        "stress analysis",
      ],
      response:
        "MSK supports CAD/CAM/CAE for design and manufacturing readiness.\n\n- CAD: 3D models, assemblies, drawings, jigs and fixtures\n- CAM: CNC strategy, setup and toolpath planning\n- CAE: FEA/FEM, CFD and technical review reports",
      quickReplies: ["Request Quote", "Engineering services", "CNC machining"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "welding_fabrication",
      keywords: ["welding", "fabrication", "fabricate", "weld", "frames", "brackets", "sheet metal", "heavy fabrication"],
      response:
        "MSK can support welding and fabrication enquiries for frames, brackets, fixtures and industrial assemblies.\n\nUse the quote form to share drawings, material, quantity, weld requirements and use conditions.",
      quickReplies: ["Request Quote", "CNC machining", "Contact details"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "r_and_d",
      keywords: [
        "r&d",
        "rnd",
        "research and development",
        "product development",
        "new product",
        "concept",
        "prototype development",
        "innovation",
      ],
      response:
        "MSK can support R&D and product development from concept to prototype readiness.\n\n- Concept review and CAD strategy\n- Prototype, simulation and manufacturing feasibility planning\n- Validation and next-step engineering support",
      quickReplies: ["Request Quote", "3D Printing", "Engineering services"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
    {
      name: "contact_request",
      keywords: [
        "contact",
        "email",
        "phone",
        "mobile",
        "call",
        "reach you",
        "reach msk",
        "how to contact",
        "where are you",
        "location",
        "address",
      ],
      response:
        "You can contact MSK at info@mskprecisiongroup.com.\n\nYou can also describe your requirement here and I will capture it for the team.",
      quickReplies: ["Request Quote", "Services", "Location"],
      actionLinks: [
        { label: "Contact MSK", href: CONTACT_URL },
        { label: "Request Quote", href: QUOTE_FORM_URL },
      ],
    },
    {
      name: "general_enquiry",
      keywords: [
        "service",
        "services",
        "what do you do",
        "what msk does",
        "about msk",
        "tell me about msk",
        "capabilities",
        "industries",
      ],
      response:
        "MSK supports engineering and manufacturing teams with design, CAD/CAM/CAE, CNC machining, 3D printing, scanning, fabrication and R&D support.\n\nTell me the service you need or choose Request Quote.",
      quickReplies: ["Request Quote", "CNC machining", "CAD / CAM / CAE"],
      actionLinks: [
        { label: "Request Quote", href: QUOTE_FORM_URL },
        { label: "Contact MSK", href: CONTACT_URL },
      ],
    },
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

  function extractEmail(text) {
    const match = String(text || "").match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    return match ? match[0].trim() : "";
  }

  function extractPhone(text) {
    const match = String(text || "").match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}/);
    return match ? match[0].trim() : "";
  }

  function extractName(text) {
    const match = String(text || "").match(/\b(?:my name is|i am|i'm|this is)\s+([a-z][a-z\s.'-]{1,50})/i);
    return match ? match[1].replace(/\s+/g, " ").trim() : "";
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

  function detectIntent(message) {
    const text = normalise(message);
    return (
      intentDefinitions.find(function (intent) {
        return intent.keywords.some(function (keyword) {
          return text.includes(normalise(keyword));
        });
      }) || intentDefinitions.find(function (intent) {
        return intent.name === "general_enquiry";
      })
    );
  }

  function captureKnownDetails(message) {
    const name = extractName(message);
    const email = extractEmail(message);
    const phone = extractPhone(message);

    if (!name && !email && !phone) return false;

    if (name) state.enquiry.name = name;
    if (email) state.enquiry.email = email;
    if (phone) state.enquiry.phone = phone;

    const captured = [];
    if (state.enquiry.name) captured.push(`Name: ${state.enquiry.name}`);
    if (state.enquiry.email) captured.push(`Email: ${state.enquiry.email}`);
    if (state.enquiry.phone) captured.push(`Phone: ${state.enquiry.phone}`);

    botReply(
      `Thanks, I captured these contact details:\n\n${captured.join("\n")}\n\nFor a quote, please type "Request Quote" and I will collect the remaining project details.`
    );
    renderQuickReplies(["Request Quote", "Services", "Contact details"]);
    return true;
  }

  function currentStepHasValidValue(step) {
    const value = String(state.enquiry[step.key] || "").trim();
    return Boolean(value && !step.validate(value));
  }

  function nextMissingStepIndex(startIndex) {
    for (let index = startIndex; index < guidedSteps.length; index += 1) {
      if (!currentStepHasValidValue(guidedSteps[index])) {
        return index;
      }
    }
    return guidedSteps.length;
  }

  function promptGuidedStep() {
    if (state.stepIndex >= guidedSteps.length) {
      clearQuickReplies();
      submitEnquiry();
      return;
    }

    const step = guidedSteps[state.stepIndex];
    setComposerPlaceholder();
    if (step.key === "service_required") {
      renderQuickReplies(services);
    } else {
      clearQuickReplies();
    }
    botReply(step.prompt);
  }

  function scrollMessages() {
    const messages = document.getElementById("msk-chatbot-messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(sender, text) {
    const messages = document.getElementById("msk-chatbot-messages");
    if (!messages) return null;

    const message = createElement("div", {
      className: `msk-chat-message msk-chat-message-${sender}`,
    });
    message.textContent = text;
    messages.appendChild(message);
    scrollMessages();
    return message;
  }

  function addActionLinks(actions) {
    const messages = document.getElementById("msk-chatbot-messages");
    if (!messages || !actions || !actions.length) return;

    const actionWrap = createElement("div", { className: "msk-chat-actions" });
    actions.forEach(function (action) {
      const link = createElement(
        "a",
        {
          href: action.href,
          className: "msk-chat-action-link",
        },
        action.label
      );
      actionWrap.appendChild(link);
    });
    messages.appendChild(actionWrap);
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

  function botReply(text, actions) {
    showTyping(function () {
      addMessage("bot", text);
      addActionLinks(actions);
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
    const existing = state.enquiry || {};
    state.enquiry = {
      name: existing.name || "",
      email: existing.email || "",
      phone: existing.phone || "",
      company: existing.company || "",
      service_required: existing.service_required || "",
    };
    state.stepIndex = nextMissingStepIndex(0);
    promptGuidedStep();
  }

  function handleQuickReply(option) {
    const action = normalise(option);

    if (action === "request quote") {
      addMessage("user", option);
      botReply(
        "For a detailed quotation, please use the full Request Quote form. I can also capture a basic enquiry here if you choose Capture in Chat.",
        [
          { label: "Open Request Quote Form", href: QUOTE_FORM_URL },
          { label: "Contact MSK", href: CONTACT_URL },
        ]
      );
      renderQuickReplies(["Capture in Chat", "Services", "Contact details"]);
      return;
    }

    if (action === "capture in chat" || action === "start quote" || action === "talk to team") {
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
    state.stepIndex = nextMissingStepIndex(state.stepIndex + 1);

    promptGuidedStep();
  }

  async function submitEnquiry() {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    setInputEnabled(false);
    addMessage("bot", SUBMISSION_WAIT_REPLY);

    const payload = {
      name: state.enquiry.name,
      email: state.enquiry.email,
      phone: state.enquiry.phone || "",
      company: state.enquiry.company || "",
      service_required: state.enquiry.service_required || "General Quote Request",
      project_details: state.enquiry.project_details,
      source_form: "chatbot",
      enquiry_type: "quote",
      quote_status: "draft",
      source: "mskprecisiongroup.com",
      company_website: "",
    };

    const controller = new AbortController();
    const timeoutId = window.setTimeout(function () {
      controller.abort();
    }, SUBMISSION_TIMEOUT_MS);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        mode: "cors",
        signal: controller.signal,
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
      addMessage("bot", SUBMISSION_FALLBACK_REPLY);
    } finally {
      window.clearTimeout(timeoutId);
      state.isSubmitting = false;
      setInputEnabled(true);
      setComposerPlaceholder();
      renderQuickReplies(["Services", "Industries", "Quote process", "Request a quote"]);
    }
  }

  function handleChatMessage(text) {
    const capturedKnownDetails = captureKnownDetails(text);
    const intent = detectIntent(text);

    if (intent.startsQuoteFlow) {
      if (capturedKnownDetails) {
        addMessage("bot", "I'll use the details already captured and collect only what is still missing.");
      }
      startGuidedFlow();
      return;
    }

    if (capturedKnownDetails) {
      return;
    }

    botReply(intent.response || FALLBACK_REPLY, intent.actionLinks || []);
    renderQuickReplies(intent.quickReplies || POST_ANSWER_REPLIES);
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
