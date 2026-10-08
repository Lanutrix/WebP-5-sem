import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OrdersApi } from "../api/client";
import OrderCard from "../components/OrderCard";

export default function TrackPage() {
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState({
    code: params.get("code") ?? "",
    email: params.get("email") ?? "",
  });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const lookup = async (code, email) => {
    setError("");
    setOrder(null);
    setBusy(true);
    try {
      setOrder(await OrdersApi.track(code.trim(), email.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (form.code && form.email) lookup(form.code, form.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setParams({ code: form.code.trim(), email: form.email.trim() });
    lookup(form.code, form.email);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Отслеживание</p>
          <h1>Статус заявки</h1>
          <p>Введите код заявки и email, указанный при оформлении.</p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container track-layout">
          <div className="contact-card track-card">
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="track-code">Код заявки</label>
                  <input
                    id="track-code"
                    type="text"
                    placeholder="ZB-XXXXXX"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="track-email">Email</label>
                  <input
                    id="track-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Ищем…" : "Проверить статус"}
              </button>
            </form>
            {error && <div className="alert alert-error">{error}</div>}
          </div>

          {order && <OrderCard order={order} defaultOpen />}
        </div>
      </section>
    </>
  );
}
