const modal = document.getElementById("requestModal");
const form = document.getElementById("requestForm");
const statusModal = document.getElementById("statusModal");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const statusCloseButtons = document.querySelectorAll("[data-close-status]");
const statusIcon = statusModal ? statusModal.querySelector(".status-icon") : null;
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

function openStatusModal(title, message, type) {
  if (!statusModal || !statusTitle || !statusText || !statusIcon) {
    return;
  }

  statusTitle.textContent = title;
  statusText.textContent = message;

  statusModal.classList.remove("is-success", "is-error");
  statusModal.classList.add(type === "success" ? "is-success" : "is-error");

  statusIcon.textContent = type === "success" ? "✓" : "!";

  statusModal.classList.add("is-open");
  statusModal.setAttribute("aria-hidden", "false");
}

function closeStatusModal() {
  if (!statusModal) {
    return;
  }

  statusModal.classList.remove("is-open", "is-success", "is-error");
  statusModal.setAttribute("aria-hidden", "true");
}

statusCloseButtons.forEach((button) => {
  button.addEventListener("click", closeStatusModal);
});

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

  if (event.key === "Escape" && statusModal && statusModal.classList.contains("is-open")) {
    closeStatusModal();
  }
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const fullName = (data.get("fullName") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const availability = (data.get("availability") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();
    const services = data.getAll("services");

    if (!fullName || !email) {
      openStatusModal("Information manquante", "Merci de renseigner votre nom et votre e-mail.", "error");
      return;
    }

    if (!services.length) {
      openStatusModal("Information manquante", "Merci de selectionner au moins un service.", "error");
      return;
    }

    const submitButton = form.querySelector(".request-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";
    }

    try {
      const payload = JSON.stringify({
        fullName,
        email,
        phone,
        availability,
        services,
        details
      });
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json"
      };

      let response = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers,
        body: payload
      });

      if (!response.ok && window.location.hostname === "localhost") {
        response = await fetch("/api/contact", {
          method: "POST",
          headers,
          body: payload
        });
      }

      if (!response.ok) {
        let errorMessage = "Erreur reseau";
        try {
          const errorPayload = await response.json();
          if (errorPayload && errorPayload.error) {
            errorMessage = errorPayload.error;
          }
        } catch (_error) {
          // Keep default message when response body is not JSON.
        }
        throw new Error(errorMessage);
      }

      form.reset();
      closeModal();
      openStatusModal(
        "Message envoye",
        "Votre demande a bien ete envoyee. Merci, je vous recontacte tres vite.",
        "success"
      );
    } catch (error) {
      const message =
        error && error.message
          ? `L'envoi a echoue: ${error.message}`
          : "L'envoi a echoue. Merci de reessayer dans quelques instants.";
      openStatusModal("Envoi impossible", message, "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer ma demande";
      }
    }
  });
}
