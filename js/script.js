/* Shared interactivity: mobile menu + contact form validation */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initContactForm();
});

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-nav]");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.classList.remove("is-open");
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const success = form.querySelector("[data-form-success]");

  const validators = {
    name: (value) => {
      if (!value.trim()) return "Please enter your full name.";
      if (value.trim().length < 2) return "Name is too short.";
      return "";
    },
    email: (value) => {
      if (!value.trim()) return "Please enter your email.";
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      return ok ? "" : "Please enter a valid email address.";
    },
    phone: (value) => {
      if (!value.trim()) return "Please enter your phone number.";
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Enter a valid phone (at least 10 digits).";
    },
    propertyType: (value) => (value ? "" : "Select a property type."),
    service: (value) => (value ? "" : "Select a service."),
    message: (value) => {
      if (!value.trim()) return "Tell us a bit about your project.";
      if (value.trim().length < 10) return "Please add a few more details.";
      return "";
    },
  };

  const setError = (field, message) => {
    const group = field.closest(".form-group");
    const errorEl = group?.querySelector(".field-error");
    if (!group || !errorEl) return;
    if (message) {
      group.classList.add("error");
      errorEl.textContent = message;
    } else {
      group.classList.remove("error");
      errorEl.textContent = "";
    }
  };

  const validateField = (field) => {
    const name = field.name;
    const fn = validators[name];
    if (!fn) return true;
    const message = fn(field.value);
    setError(field, message);
    return !message;
  };

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-group")?.classList.contains("error")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) {
      const firstError = form.querySelector(".form-group.error input, .form-group.error select, .form-group.error textarea");
      firstError?.focus();
      return;
    }

    if (success) {
      success.classList.add("is-visible");
      success.textContent =
        "Thanks! Your request was validated locally. We'll get back within one business day.";
    }
    form.reset();
  });
}
