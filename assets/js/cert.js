function generateCertificate() {
  const name = document.getElementById("name").value;
  const className = document.getElementById("class").value;
  // const event = document.getElementById("event").value;

  document.getElementById("cert-name").textContent = name;
  document.getElementById("cert-class").textContent = `Class ${className}`;
  // document.getElementById("cert-event").textContent = event;
}

function downloadCertificate() {
  html2canvas(document.getElementById("certificate")).then(canvas => {
    const link = document.createElement('a');
    link.download = 'ByteIT-2025-Certificate.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
