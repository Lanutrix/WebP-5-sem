import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OrdersApi } from "../api/client";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/AuthContext";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    OrdersApi.my()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Личный кабинет</p>
          <h1>Мои заявки</h1>
          <p>
            {user.name}, здесь история ваших заявок и текущие статусы. Данные обновляются с
            сервера.
          </p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container orders-layout">
          <div className="orders-toolbar">
            <button className="btn btn-ghost" type="button" onClick={load} disabled={loading}>
              {loading ? "Обновляем…" : "Обновить"}
            </button>
            <Link className="btn" to="/calculator">
              Новая заявка
            </Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && orders.length === 0 && (
            <div className="contact-card">
              <p className="muted">
                Заявок пока нет. Рассчитайте стоимость в{" "}
                <Link to="/calculator">калькуляторе</Link> и оформите первую.
              </p>
            </div>
          )}

          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
