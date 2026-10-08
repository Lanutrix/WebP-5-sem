import { useState } from "react";
import { Link } from "react-router-dom";
import { OrdersApi } from "../api/client";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatMoney, formatQty } from "../utils/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, total } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return setError("Корзина пуста — добавьте услуги в калькуляторе.");
    const bad = items.find((i) => !(Number(i.quantity) >= i.min_quantity));
    if (bad) return setError(`Минимальный объём для «${bad.title}» — ${bad.min_quantity} ${bad.unit}.`);
    if (!isAuthenticated) {
      if (guest.name.trim().length < 2) return setError("Укажите имя.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) return setError("Укажите корректный email.");
      if (guest.phone.replace(/\D/g, "").length < 10) return setError("Укажите телефон.");
    }

    setBusy(true);
    try {
      const payload = {
        items: items.map((i) => ({ service_id: i.service_id, quantity: Number(i.quantity) })),
        comment,
        ...(isAuthenticated
          ? {}
          : { name: guest.name.trim(), phone: guest.phone.trim(), email: guest.email.trim() }),
      };
      const order = await OrdersApi.create(payload);
      setCreated(order);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <section className="contact-section">
        <div className="container cart-layout">
          <div className="contact-card">
            <p className="eyebrow">Готово</p>
            <h1>Заявка оформлена</h1>
            <p className="contact-card-lead">
              Код для отслеживания: <strong className="tracking-code">{created.tracking_code}</strong>.
              {isAuthenticated
                ? " Заявка привязана к вашему аккаунту."
                : " Сохраните код — по нему и email вы сможете проверить статус."}
            </p>
            <OrderCard order={created} defaultOpen />
            <div className="cta-actions">
              {isAuthenticated ? (
                <Link className="btn" to="/orders">
                  Мои заявки
                </Link>
              ) : (
                <Link
                  className="btn"
                  to={`/track?code=${created.tracking_code}&email=${encodeURIComponent(created.customer_email)}`}
                >
                  Отслеживать статус
                </Link>
              )}
              <Link className="btn btn-ghost" to="/calculator">
                Новый расчёт
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Корзина</p>
          <h1>Оформление заявки</h1>
          <p>Проверьте состав работ и оставьте контакты — менеджер подтвердит сроки и оплату.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container cart-layout">
          <div className="contact-card">
            <h2>Состав заявки</h2>
            {items.length === 0 ? (
              <p className="muted">
                Пока пусто. <Link to="/calculator">Перейти в калькулятор →</Link>
              </p>
            ) : (
              <table className="table cart-table">
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Объём</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                    <th aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.service_id}>
                      <td>{item.title}</td>
                      <td>
                        <div className="qty-cell">
                          <input
                            type="number"
                            min={item.min_quantity}
                            step={item.unit === "выезд" ? 1 : 0.5}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.service_id, e.target.value)}
                            aria-label={`Объём: ${item.title}`}
                          />
                          <span className="muted">{item.unit}</span>
                        </div>
                      </td>
                      <td>{formatMoney(item.unit_price)}</td>
                      <td>{formatMoney(item.unit_price * item.quantity)}</td>
                      <td>
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label="Удалить"
                          onClick={() => removeItem(item.service_id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Итого</td>
                    <td colSpan={2}>
                      <strong>{formatMoney(total)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
            {items.length > 0 && (
              <p className="muted cart-hint">
                {items.length} поз. · суммарный объём{" "}
                {formatQty(items.reduce((s, i) => s + Number(i.quantity || 0), 0))} ед.
              </p>
            )}
          </div>

          <aside className="aside-card checkout-card">
            <h2>Контакты</h2>
            {isAuthenticated ? (
              <div className="checkout-user">
                <p>
                  <strong>{user.name}</strong>
                </p>
                <p className="muted">{user.email}</p>
                <p className="muted">{user.phone || "Телефон не указан"}</p>
              </div>
            ) : (
              <p className="muted checkout-guest-note">
                Оформляете как гость. <Link to="/login">Войти</Link> или{" "}
                <Link to="/register">зарегистрироваться</Link>, чтобы видеть историю заявок.
              </p>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <form className="contact-form" onSubmit={onSubmit} noValidate>
              {!isAuthenticated && (
                <>
                  <div className="form-group">
                    <label htmlFor="g-name">Имя *</label>
                    <input id="g-name" type="text" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="g-phone">Телефон *</label>
                    <input id="g-phone" type="tel" placeholder="+7 (999) 123-45-67" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="g-email">Email *</label>
                    <input id="g-email" type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                  </div>
                </>
              )}
              <div className="form-group">
                <label htmlFor="g-comment">Комментарий</label>
                <textarea
                  id="g-comment"
                  rows={4}
                  placeholder="Адрес участка, удобное время, особенности…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button className="btn btn-submit" type="submit" disabled={busy || items.length === 0}>
                {busy ? "Отправляем…" : `Оформить заявку · ${formatMoney(total)}`}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </>
  );
}
