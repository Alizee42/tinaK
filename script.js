const modal = document.getElementById("requestModal");
const form = document.getElementById("requestForm");
const openButtons = document.querySelectorAll("[data-open-request]");
const closeButtons = document.querySelectorAll("[data-close-request]");

function openModal() {
  if (!modal) {
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

openButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
    closeModal();
  }
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const fullName = (data.get("fullName") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const availability = (data.get("availability") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();
    const services = data.getAll("services");

    if (!fullName || !email) {
      window.alert("Merci de renseigner votre nom et votre e-mail.");
      return;
    }

    if (!services.length) {
      window.alert("Merci de selectionner au moins un service.");
      return;
    }

    const subject = `Demande de service - ${fullName}`;
    const bodyLines = [
      "Bonjour Tina,",
      "",
      "Je souhaite faire une demande pour les services suivants :",
      ...services.map((service) => `- ${service}`),
      "",
      "Mes informations :",
      `Nom : ${fullName}`,
      `E-mail : ${email}`,
      `Telephone : ${phone || "Non renseigne"}`,
      `Disponibilites : ${availability || "Non renseigne"}`,
      "",
      "Details :",
      details || "Non renseigne",
      "",
      "Merci."
    ];

    const body = bodyLines.join("\n");
    const mailto = `mailto:Tina.k-bureau@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}
