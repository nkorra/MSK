window.addEventListener("load", function () {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <button id="mskChatBtn">Ask MSK</button>

    <div id="mskChatBox">
      <div class="msk-chat-header">
        <strong>MSK Engineering Assistant</strong>
        <button id="mskCloseBtn">×</button>
      </div>

      <div class="msk-chat-body">
        <p><strong>Hello!</strong> Tell us what you need help with.</p>

        <input id="mskName" placeholder="Your name" required />
        <input id="mskEmail" placeholder="Email" required />

        <select id="mskService">
          <option value="">Select requirement</option>
          <option>Engineering Consultancy</option>
          <option>CNC Machining</option>
          <option>CAD / CAM Design</option>
          <option>FEA / FEM / Structural Analysis</option>
          <option>CFD / Simulation</option>
          <option>Product Design / R&D</option>
          <option>3D Printing / Additive Manufacturing</option>
          <option>Manufacturing / Precision Works</option>
          <option>Training</option>
        </select>

        <textarea id="mskMessage" placeholder="Briefly describe your project"></textarea>

        <button id="mskSubmitBtn">Send Enquiry</button>
        <p id="mskStatus" class="msk-note"></p>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  const style = document.createElement("style");
  style.innerHTML = `
    #mskChatBtn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0f172a;
      color: #fff;
      border: none;
      border-radius: 25px;
      padding: 12px 18px;
      font-weight: 700;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    #mskChatBox {
      display: none;
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 340px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      z-index: 9999;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }

    .msk-chat-header {
      background: #0f172a;
      color: white;
      padding: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #mskCloseBtn {
      background: transparent;
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
    }

    .msk-chat-body {
      padding: 14px;
    }

    .msk-chat-body input,
    .msk-chat-body select,
    .msk-chat-body textarea {
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 14px;
    }

    .msk-chat-body textarea {
      min-height: 90px;
      resize: vertical;
    }

    #mskSubmitBtn {
      width: 100%;
      background: #0f64a0;
      color: white;
      border: none;
      padding: 11px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .msk-note {
      font-size: 12px;
      color: #0f172a;
      margin-top: 10px;
      line-height: 1.4;
    }
  `;
  document.head.appendChild(style);

  document.getElementById("mskChatBtn").onclick = function () {
    document.getElementById("mskChatBox").style.display = "block";
  };

  document.getElementById("mskCloseBtn").onclick = function () {
    document.getElementById("mskChatBox").style.display = "none";
  };

  document.getElementById("mskSubmitBtn").onclick = async function () {
    const name = document.getElementById("mskName").value.trim();
    const email = document.getElementById("mskEmail").value.trim();
    const service = document.getElementById("mskService").value;
    const message = document.getElementById("mskMessage").value.trim();
    const status = document.getElementById("mskStatus");

    if (!name || !email || !service || !message) {
      status.innerText = "Please fill name, email, requirement and project details.";
      return;
    }

    status.innerText = "Sending enquiry...";

    const formData = new FormData();
    formData.append("form_name", "MSK Chatbot Enquiry");
    formData.append("name", name);
    formData.append("email", email);
    formData.append("service_required", service);
    formData.append("project_details", message);

    try {
      const response = await fetch("https://getform.io/f/amdjpymb", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        status.innerText = "Thank you. Your enquiry has been sent to MSK.";
        document.getElementById("mskName").value = "";
        document.getElementById("mskEmail").value = "";
        document.getElementById("mskService").value = "";
        document.getElementById("mskMessage").value = "";
      } else {
        status.innerText = "Could not send automatically. Please email info@mskprecisiongroup.com.";
      }
    } catch (error) {
      status.innerText = "Network issue. Please email info@mskprecisiongroup.com.";
    }
  };
});
