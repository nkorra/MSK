(function () {
  const btn = document.createElement("button");
  btn.innerText = "Ask MSK";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.padding = "12px 18px";
  btn.style.background = "#0f172a";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "25px";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "9999";
  btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  document.body.appendChild(btn);

  btn.onclick = function () {
    const name = prompt("Your Name:");
    const email = prompt("Your Email:");
    const requirement = prompt("Your Requirement:");

    const subject = "MSK Engineering Enquiry";
    const body = `
Name: ${name}
Email: ${email}
Requirement: ${requirement}
    `;

    window.location.href =
      "mailto:info@mskprecisiongroup.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  };
})();
