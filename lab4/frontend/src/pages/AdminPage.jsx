import { useCallback, useEffect, useState } from "react";
import { AdminApi, ServicesApi } from "../api/client";
import OrderCard from "../components/OrderCard";
import { formatMoney, NEXT_STATUSES, STATUS_LABELS } from "../utils/format";

const FILTERS = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "paid", label: "Оплаченные" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Выполненные" },
  { value: "cancelled", label: "Отменённые" },
];

const EMPTY_SERVICE = {
  slug: "",
  title: "",
  description: "",
  unit: "сотка",
  price_per_unit: "",
  min_quantity: 1,
  image: "",
};

function OrdersPanel() {
  const [filter, setFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, st] = await Promise.all([AdminApi.orders(filter), AdminApi.stats()]);
      setOrders(list);
      setStats(st);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order, status) => {
    const note = window.prompt(`Комментарий к статусу «${STATUS_LABELS[status]}» (необязательно):`, "");
    if (note === null) return;
    setBusyId(order.id);
    try {
      const updated = await AdminApi.setStatus(order.id, status, note);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      AdminApi.stats().then(setStats).catch(() => {});
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeOrder = async (order) => {
    if (!window.confirm(`Удалить заявку ${order.tracking_code}? Действие необратимо.`)) return;
    setBusyId(order.id);
    try {
      await AdminApi.removeOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      AdminApi.stats().then(setStats).catch(() => {});
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {stats && (
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-card-value">{stats.orders_total}</span>
            <span className="stat-card-label">Всего заявок</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{stats.orders_new}</span>
            <span className="stat-card-label">Новых</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{stats.orders_in_progress}</span>
            <span className="stat-card-label">В работе</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{stats.orders_completed}</span>
            <span className="stat-card-label">Выполнено</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{formatMoney(stats.revenue_paid)}</span>
            <span className="stat-card-label">Оплачено</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{stats.users_total}</span>
            <span className="stat-card-label">Пользователей</span>
          </div>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={`admin-tab${filter === f.value ? " is-active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" type="button" onClick={load} disabled={loading}>
          {loading ? "Обновляем…" : "Обновить"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!loading && orders.length === 0 && <p className="muted">Заявок с таким статусом нет.</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            actions={
              <>
                {NEXT_STATUSES[order.status].map((next) => (
                  <button
                    key={next.value}
                    type="button"
                    className={`btn${next.value === "cancelled" ? " btn-danger" : ""}`}
                    disabled={busyId === order.id}
                    onClick={() => changeStatus(order, next.value)}
                  >
                    {next.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busyId === order.id}
                  onClick={() => removeOrder(order)}
                >
                  Удалить
                </button>
                <span className="muted order-customer">{order.customer_email}</span>
              </>
            }
          />
        ))}
      </div>
    </>
  );
}

function ServicesPanel() {
  const [services, setServices] = useState([]);
  const [draft, setDraft] = useState(EMPTY_SERVICE);
  const [edits, setEdits] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    ServicesApi.list(true)
      .then((list) => {
        setServices(list);
        setEdits(Object.fromEntries(list.map((s) => [s.id, s.price_per_unit])));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const savePrice = async (service) => {
    const price = Number(edits[service.id]);
    if (!(price > 0)) return window.alert("Цена должна быть больше нуля.");
    setBusy(true);
    try {
      const updated = await ServicesApi.update(service.id, { price_per_unit: price });
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (service) => {
    setBusy(true);
    try {
      const updated = await ServicesApi.update(service.id, { active: !service.active });
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (service) => {
    if (!window.confirm(`Удалить услугу «${service.title}»?`)) return;
    setBusy(true);
    try {
      await ServicesApi.remove(service.id);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await ServicesApi.create({
        ...draft,
        price_per_unit: Number(draft.price_per_unit),
        min_quantity: Number(draft.min_quantity) || 1,
        image: draft.image || null,
      });
      setDraft(EMPTY_SERVICE);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-services">
      <div className="contact-card">
        <h2>Прайс услуг</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Ед.</th>
              <th>Цена за ед.</th>
              <th>Статус</th>
              <th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className={s.active ? "" : "is-inactive"}>
                <td>
                  <strong>{s.title}</strong>
                  <br />
                  <span className="muted">{s.slug}</span>
                </td>
                <td>{s.unit}</td>
                <td>
                  <div className="qty-cell">
                    <input
                      type="number"
                      min={1}
                      step={100}
                      value={edits[s.id] ?? s.price_per_unit}
                      onChange={(e) => setEdits({ ...edits, [s.id]: e.target.value })}
                      aria-label={`Цена: ${s.title}`}
                    />
                    <button
                      className="btn btn-sm"
                      type="button"
                      disabled={busy || Number(edits[s.id]) === s.price_per_unit}
                      onClick={() => savePrice(s)}
                    >
                      Сохранить
                    </button>
                  </div>
                </td>
                <td>{s.active ? "Активна" : "Скрыта"}</td>
                <td className="table-actions">
                  <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => toggleActive(s)}>
                    {s.active ? "Скрыть" : "Показать"}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={() => remove(s)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="aside-card" onSubmit={create}>
        <h2>Новая услуга</h2>
        <div className="form-group">
          <label htmlFor="svc-title">Название</label>
          <input id="svc-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label htmlFor="svc-slug">Slug (латиница, дефисы)</label>
          <input id="svc-slug" value={draft.slug} pattern="[a-z0-9-]+" onChange={(e) => setDraft({ ...draft, slug: e.target.value })} required />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="svc-unit">Единица</label>
            <input id="svc-unit" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="svc-price">Цена за ед., ₽</label>
            <input id="svc-price" type="number" min={1} value={draft.price_per_unit} onChange={(e) => setDraft({ ...draft, price_per_unit: e.target.value })} required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="svc-desc">Описание</label>
          <textarea id="svc-desc" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <button className="btn btn-submit" type="submit" disabled={busy}>
          Добавить услугу
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("orders");

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Администрирование</p>
          <h1>Панель управления</h1>
          <p>Заявки клиентов, смена статусов оказания услуг и управление прайсом.</p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container">
          <div className="admin-tabs admin-tabs--main" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "orders"} className={`admin-tab${tab === "orders" ? " is-active" : ""}`} onClick={() => setTab("orders")}>
              Заявки
            </button>
            <button type="button" role="tab" aria-selected={tab === "services"} className={`admin-tab${tab === "services" ? " is-active" : ""}`} onClick={() => setTab("services")}>
              Услуги и цены
            </button>
          </div>
          {tab === "orders" ? <OrdersPanel /> : <ServicesPanel />}
        </div>
      </section>
    </>
  );
}
