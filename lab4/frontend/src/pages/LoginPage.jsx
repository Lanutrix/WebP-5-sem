import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/orders";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(user.role === "admin" && from === "/orders" ? "/admin" : from, { replace: true });
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
          <h1>Вход</h1>
          <p className="contact-card-lead">
            Войдите, чтобы видеть историю заявок и статусы работ.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Пароль</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-submit" type="submit" disabled={busy}>
              {busy ? "Входим…" : "Войти"}
            </button>
          </form>

          <p className="auth-switch">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
          <p className="auth-hint muted">
            Демо-администратор: admin@zelenybereg.ru / admin12345
          </p>
        </div>
      </div>
    </section>
  );
}
