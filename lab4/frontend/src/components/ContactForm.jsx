import { useEffect, useState } from "react";
import { OrdersApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PROPERTY_LABELS = { residential: "Частный", commercial: "Коммерческий" };
const SERVICE_LABELS = {
  design: "Проектирование полива",
  installation: "Монтаж полива",
  repair: "Ремонт полива",
  landscaping: "Ландшафтный дизайн",
  unsure: "Пока не уверен",
};

const INITIAL = {
  name: "",
  phone: "",
  email: "",
  propertyType: "",
  service: "",
  message: "",
};

function formatRuPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const parts = ["+7"];
  if (digits.length > 1) parts.push(` (${digits.slice(1, 4)}`);
  if (digits.length >= 4) parts[1] += ")";
  if (digits.length > 4) parts.push(` ${digits.slice(4, 7)}`);
  if (digits.length > 7) parts.push(`-${digits.slice(7, 9)}`);
  if (digits.length > 9) parts.push(`-${digits.slice(9, 11)}`);
  return parts.join("");
}

function getPhoneDigits(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  return digits;
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
  email: (value) => {
    if (!value.trim()) return "Укажите email.";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    return ok ? "" : "Введите корректный email, например ivan@example.com.";
  },
  propertyType: (value) => (value ? "" : "Выберите тип объекта."),
  service: (value) => (value ? "" : "Выберите услугу."),
  message: (value) => {
    if (!value.trim()) return "";
    if (value.trim().length < 10) return "Добавьте чуть больше деталей.";
    return "";
  },
};

export default function ContactForm() {
  const { user } = useAuth();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [created, setCreated] = useState(null);

  // Подставляем контакты авторизованного пользователя
  useEffect(() => {
    if (!user) return;
    setValues((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || (user.phone ? formatRuPhone(user.phone) : ""),
    }));
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", modalOpen);
    return () => document.body.classList.remove("modal-open");
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const validateField = (name) => {
    const message = validators[name](values[name]);
    setErrors((prev) => ({ ...prev, [name]: message }));
    return !message;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const nextErrors = {};
    let valid = true;
    for (const key of Object.keys(validators)) {
      const message = validators[key](values[key]);
      nextErrors[key] = message;
      if (message) valid = false;
    }
    setErrors(nextErrors);
    if (!valid) return;

    // Заявка на консультацию: без позиций прайса, детали — в комментарии
    const comment = [
      `Тип объекта: ${PROPERTY_LABELS[values.propertyType] ?? values.propertyType}`,
      `Интересует: ${SERVICE_LABELS[values.service] ?? values.service}`,
      values.message.trim() ? `Описание: ${values.message.trim()}` : null,
    ]
      .filter(Boolean)
      .join(". ");

    setSubmitting(true);
    try {
      const order = await OrdersApi.create({
        items: [],
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        comment,
      });
      setCreated(order);
      setValues(INITIAL);
      setErrors({});
      setModalOpen(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {serverError && <div className="alert alert-error">{serverError}</div>}
      <form className="contact-form" id="contact-form" noValidate onSubmit={onSubmit}>
        <div className="form-grid">
          <div className={`form-group${errors.name ? " error" : ""}`}>
            <label htmlFor="name">
              ФИО <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Иван Иванов"
              required
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => validateField("name")}
            />
            <span className="field-error" role="alert">
              {errors.name}
            </span>
          </div>

          <div className={`form-group${errors.phone ? " error" : ""}`}>
            <label htmlFor="phone">
              Телефон <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              maxLength={18}
              required
              value={values.phone}
              onChange={(e) => setField("phone", formatRuPhone(e.target.value))}
              onFocus={() => {
                if (!values.phone) setField("phone", "+7 (");
              }}
              onBlur={() => {
                if (getPhoneDigits(values.phone).length <= 1) setField("phone", "");
                validateField("phone");
              }}
            />
            <span className="field-error" role="alert">
              {errors.phone}
            </span>
          </div>

          <div className={`form-group form-group--full${errors.email ? " error" : ""}`}>
            <label htmlFor="email">
              Email <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="ivan@example.com"
              required
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => validateField("email")}
            />
            <span className="field-error" role="alert">
              {errors.email}
            </span>
          </div>

          <div className={`form-group${errors.propertyType ? " error" : ""}`}>
            <label htmlFor="propertyType">Тип объекта</label>
            <select
              id="propertyType"
              name="propertyType"
              required
              value={values.propertyType}
              onChange={(e) => setField("propertyType", e.target.value)}
              onBlur={() => validateField("propertyType")}
            >
              <option value="">Выберите…</option>
              <option value="residential">Частный</option>
              <option value="commercial">Коммерческий</option>
            </select>
            <span className="field-error" role="alert">
              {errors.propertyType}
            </span>
          </div>

          <div className={`form-group${errors.service ? " error" : ""}`}>
            <label htmlFor="service">Нужная услуга</label>
            <select
              id="service"
              name="service"
              required
              value={values.service}
              onChange={(e) => setField("service", e.target.value)}
              onBlur={() => validateField("service")}
            >
              <option value="">Выберите…</option>
              <option value="design">Проектирование полива</option>
              <option value="installation">Монтаж полива</option>
              <option value="repair">Ремонт полива</option>
              <option value="landscaping">Ландшафтный дизайн</option>
              <option value="unsure">Пока не уверен</option>
            </select>
            <span className="field-error" role="alert">
              {errors.service}
            </span>
          </div>
        </div>

        <div className={`form-group${errors.message ? " error" : ""}`}>
          <label htmlFor="message">Расскажите о проекте</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Площадь участка, что нужно сделать…"
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            onBlur={() => validateField("message")}
          />
          <span className="field-error" role="alert">
            {errors.message}
          </span>
        </div>

        <button className="btn btn-submit" type="submit" disabled={submitting}>
          {submitting ? "Отправляем…" : "Отправить заявку"}
        </button>
      </form>

      <div
        className={`modal${modalOpen ? " is-open" : ""}`}
        id="success-modal"
        hidden={!modalOpen}
        aria-hidden={!modalOpen}
      >
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        <div
          className="modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <button
            className="modal-close"
            type="button"
            aria-label="Закрыть"
            onClick={() => setModalOpen(false)}
          >
            ×
          </button>
          <div className="modal-icon" aria-hidden="true">
            ✓
          </div>
          <h2 id="success-modal-title">Успешно отправлено</h2>
          <p>
            Заявка принята в обработку. Мы свяжемся с вами в ближайшее время, чтобы уточнить
            детали и согласовать выезд.
          </p>
          {created && (
            <p className="modal-tracking">
              Код заявки: <strong className="tracking-code">{created.tracking_code}</strong>
              <br />
              <span className="muted">
                Отслеживайте статус на странице «Статус заявки» по коду и email.
              </span>
            </p>
          )}
          <button className="btn" type="button" onClick={() => setModalOpen(false)}>
            Хорошо
          </button>
        </div>
      </div>
    </>
  );
}
