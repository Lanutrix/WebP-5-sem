/* Общая интерактивность: бургер-меню, маска телефона, форма, модалка */

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

/** Маска российского номера: +7 (999) 123-45-67 */
function formatRuPhone(value) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }
  if (!digits.startsWith("7")) {
    digits = "7" + digits;
  }

  digits = digits.slice(0, 11);

  const parts = ["+7"];
  if (digits.length > 1) {
    parts.push(" (" + digits.slice(1, 4));
  }
  if (digits.length >= 4) {
    parts[1] += ")";
  }
  if (digits.length > 4) {
    parts.push(" " + digits.slice(4, 7));
  }
  if (digits.length > 7) {
    parts.push("-" + digits.slice(7, 9));
  }
  if (digits.length > 9) {
    parts.push("-" + digits.slice(9, 11));
  }

  return parts.join("");
}

function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  return digits;
}

function initSuccessModal() {
  const modal = document.querySelector("#success-modal");
  if (!modal) return null;

  const open = () => {
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("[data-modal-close]")?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });

  return { open, close };
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const phoneInput = form.querySelector("#phone");
  const modal = initSuccessModal();

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatRuPhone(phoneInput.value);
    });

    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) phoneInput.value = "+7 (";
    });

    phoneInput.addEventListener("blur", () => {
      if (getPhoneDigits(phoneInput.value).length <= 1) {
        phoneInput.value = "";
      }
    });
  }

  const validators = {
    name: (value) => {
      if (!value.trim()) return "Укажите ФИО.";
      if (value.trim().length < 2) return "Имя слишком короткое.";
      return "";
    },
    phone: (value) => {
      if (!value.trim()) return "Укажите номер телефона.";
      const digits = getPhoneDigits(value);
      return digits.length === 11 && digits.startsWith("7")
        ? ""
        : "Введите номер в формате +7 (999) 123-45-67.";
    },
    propertyType: (value) => (value ? "" : "Выберите тип объекта."),
    service: (value) => (value ? "" : "Выберите услугу."),
    message: (value) => {
      if (!value.trim()) return "Опишите ваш проект.";
      if (value.trim().length < 10) return "Добавьте чуть больше деталей.";
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
      const firstError = form.querySelector(
        ".form-group.error input, .form-group.error select, .form-group.error textarea"
      );
      firstError?.focus();
      return;
    }

    form.reset();
    modal?.open();
  });
}
