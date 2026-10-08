import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ServicesApi } from "../api/client";
import { useCart } from "../context/CartContext";
import { formatMoney, formatQty } from "../utils/format";

export default function CalculatorPage() {
  const [services, setServices] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(null);
  const [params] = useSearchParams();
  const highlight = params.get("service");
  const { addItem, count, total: cartTotal } = useCart();

  useEffect(() => {
    ServicesApi.list()
      .then((list) => {
        setServices(list);
        setQuantities(Object.fromEntries(list.map((s) => [s.id, s.min_quantity])));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!highlight || loading) return;
    const el = document.getElementById(`calc-${highlight}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight, loading]);

  const rows = useMemo(
    () =>
      services.map((s) => {
        const qty = Number(quantities[s.id] ?? s.min_quantity);
        return { service: s, qty, lineTotal: qty > 0 ? qty * s.price_per_unit : 0 };
      }),
    [services, quantities]
  );

  const estimate = rows.reduce((sum, r) => sum + r.lineTotal, 0);

  const setQty = (id, value) => setQuantities((prev) => ({ ...prev, [id]: value }));

  const handleAdd = (row) => {
    if (!(row.qty >= row.service.min_quantity)) return;
    addItem(row.service, row.qty);
    setAdded(row.service.id);
    setTimeout(() => setAdded(null), 1600);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Калькулятор</p>
          <h1>Рассчитайте стоимость работ</h1>
          <p>
            Укажите объём по каждой услуге — цена считается по прайсу с сервера. Понравилось —
            добавьте в корзину и оформите заявку.
          </p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container calc-layout">
          <div className="calc-list">
            {loading && <p className="muted">Загружаем прайс…</p>}
            {error && <div className="alert alert-error">{error}</div>}

            {rows.map(({ service, qty, lineTotal }) => (
              <article
                key={service.id}
                id={`calc-${service.slug}`}
                className={`calc-row${highlight === service.slug ? " is-highlighted" : ""}`}
              >
                <div className="calc-row-media">
                  {service.image && <img src={service.image} alt="" loading="lazy" />}
                </div>
                <div className="calc-row-body">
                  <h2>{service.title}</h2>
                  <p className="muted">{service.description}</p>
                  <p className="calc-price">
                    {formatMoney(service.price_per_unit)} <span className="muted">/ {service.unit}</span>
                  </p>
                </div>
                <div className="calc-row-controls">
                  <label htmlFor={`qty-${service.id}`}>Объём, {service.unit}</label>
                  <input
                    id={`qty-${service.id}`}
                    type="number"
                    min={service.min_quantity}
                    step={service.unit === "выезд" ? 1 : 0.5}
                    value={quantities[service.id] ?? service.min_quantity}
                    onChange={(e) => setQty(service.id, e.target.value)}
                  />
                  <p className="calc-line-total">
                    {qty >= service.min_quantity ? formatMoney(lineTotal) : "—"}
                  </p>
                  <button
                    className={`btn${added === service.id ? " btn-added" : ""}`}
                    type="button"
                    disabled={!(qty >= service.min_quantity)}
                    onClick={() => handleAdd({ service, qty })}
                  >
                    {added === service.id ? "Добавлено ✓" : "В корзину"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="calc-summary aside-card">
            <h2>Предварительный расчёт</h2>
            <ul className="calc-summary-list">
              {rows.map(({ service, qty, lineTotal }) => (
                <li key={service.id}>
                  <span>
                    {service.title}
                    <small className="muted">
                      {" "}
                      · {formatQty(qty)} {service.unit}
                    </small>
                  </span>
                  <span>{formatMoney(lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="calc-summary-total">
              <span>Итого по всем услугам</span>
              <strong>{formatMoney(estimate)}</strong>
            </p>
            <p className="muted calc-summary-note">
              Это оценка. В корзине вы выбираете только нужные позиции.
            </p>
            <Link className="btn btn-lg calc-summary-btn" to="/cart">
              Корзина ({count}) · {formatMoney(cartTotal)}
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
