function generateCertificate() {
  const name = document.getElementById("name").value;
  const className = document.getElementById("class").value;
  // const event = document.getElementById("event").value;

  document.getElementById("cert-name").textContent = name;
  document.getElementById("cert-class").textContent = `Class ${className}`;
  // document.getElementById("cert-event").textContent = event;
}
function updateCertificateTemplate() {
  const event = document.getElementById("event-selector").value;
  const template = document.getElementById("template");

  if (event === "crypt.it") {
    template.src = "certificate-template.png"; // default
  } else if (event === "build.it") {
    template.src = "Build.IT.png";
  } else if (event === "make.it") {
    template.src = "Make.IT.png";
  }
}

function downloadCertificate() {
  const certificate = document.getElementById("certificate");
  const template = document.getElementById("template");

  // If image is already loaded, proceed directly
  if (template.complete) {
    html2canvas(certificate).then(canvas => {
      const link = document.createElement('a');
      link.download = 'ByteIT-2025-Certificate.png';
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  } else {
    // If not loaded yet, wait for it to load
    template.onload = () => {
      html2canvas(certificate).then(canvas => {
        const link = document.createElement('a');
        link.download = 'ByteIT-2025-Certificate.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    };
  }
}

