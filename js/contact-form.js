(() => {
  "use strict";

  const form = document.querySelector("#contact-form");
  const statusMessage = document.querySelector("#form-status");

  if (!form) return;

  const fields = {
    fullName: form.querySelector("#full-name"),
    email: form.querySelector("#email-address"),
    subject: form.querySelector("#subject"),
    message: form.querySelector("#message"),
  };

  function setError(field, message) {
    field.setAttribute("aria-invalid", "true");
    const errorElement = document.querySelector(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute("aria-invalid");
    const errorElement = document.querySelector(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = "";
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let valid = true;
    let firstInvalid = null;

    Object.values(fields).forEach(clearError);

    if (fields.fullName.value.trim().length < 2) {
      setError(fields.fullName, "Please enter your full name.");
      valid = false;
      firstInvalid ??= fields.fullName;
    }

    if (!validateEmail(fields.email.value.trim())) {
      setError(fields.email, "Please enter a valid email address.");
      valid = false;
      firstInvalid ??= fields.email;
    }

    if (fields.subject.value.trim().length < 2) {
      setError(fields.subject, "Please enter a subject.");
      valid = false;
      firstInvalid ??= fields.subject;
    }

    if (fields.message.value.trim().length < 10) {
      setError(fields.message, "Please enter a message of at least 10 characters.");
      valid = false;
      firstInvalid ??= fields.message;
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") clearError(field);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    statusMessage.textContent = "";
    statusMessage.className = "form-status";

    if (!validateForm()) return;

    const submitButton = form.querySelector(".contact-submit-button");
    submitButton.disabled = true;
    const originalButtonText = submitButton.querySelector("span").textContent;
    submitButton.querySelector("span").textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (!response.ok) throw new Error("Submission failed.");

      statusMessage.textContent = "Thanks \u2014 your message has been sent.";
      statusMessage.classList.add("is-success");
      form.reset();
    } catch (error) {
      console.error(error);
      statusMessage.textContent = "Your message could not be sent. Please try again.";
      statusMessage.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = originalButtonText;
    }
  });
})();
