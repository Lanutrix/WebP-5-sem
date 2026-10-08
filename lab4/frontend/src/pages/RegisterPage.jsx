import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Укажите имя (не короче 2 символов).");
    if (form.password.length < 6) return setError("Пароль должен быть не короче 6 символов.");
    if (form.password !== form.confirm) return setError("Пароли не совпадают.");

    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      });
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="contact-section auth-section">
      <div className="container auth-layout">
        <div className="contact-card auth-card">
          <p className="eyebrow">Личный кабинет</p>
          <h1>Регистрация</h1>
          <p className="contact-card-lead">
            После регистрации заявки будут привязаны к вашему аккаунту.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="reg-name">Имя</label>
                <input id="reg-name" type="text" autoComplete="name" required value={form.name} onChange={update("name")} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone">Телефон</label>
                <input id="reg-phone" type="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" value={form.phone} onChange={update("phone")} />
              </div>
              <div className="form-group form-group--full">
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Пароль</label>
                <input id="reg-password" type="password" autoComplete="new-password" required value={form.password} onChange={update("password")} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Повторите пароль</label>
                <input id="reg-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={update("confirm")} />
              </div>
            </div>
            <button className="btn btn-submit" type="submit" disabled={busy}>
              {busy ? "Создаём…" : "Создать аккаунт"}
            </button>
          </form>

          <p className="auth-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
