import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServicesApi } from "../api/client";
import CtaBand from "../components/CtaBand";
import { useCart } from "../context/CartContext";
import { SERVICE_DETAILS } from "../data/site";
import { formatMoney } from "../utils/format";

export default function ServicesPage() {
  const [prices, setPrices] = useState({});
  const [addedSlug, setAddedSlug] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    ServicesApi.list()
      .then((list) => setPrices(Object.fromEntries(list.map((s) => [s.slug, s]))))
      .catch(() => setPrices({}));
  }, []);

  const handleAdd = (service) => {
    addItem(service, service.min_quantity);
    setAddedSlug(service.slug);
    setTimeout(() => setAddedSlug(null), 1600);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Что делаем</p>
          <h1>Услуги под климат юга</h1>
          <p>
            От умных систем полива до полного озеленения — решения, которые берегут воду и
            поддерживают участок в порядке весь год. Цены загружаются с сервера.
          </p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container">
          {SERVICE_DETAILS.map((service) => {
            const price = prices[service.id];
            return (
              <article
                className={`service-block${service.reverse ? " reverse" : ""}`}
                id={service.id}
                key={service.id}
              >
                <img src={service.image} alt={service.alt} width="900" height="600" loading="lazy" />
                <div>
                  <h2>{service.title}</h2>
                  <p className="eyebrow service-block-eyebrow">{service.eyebrow}</p>
                  <p className="muted">{service.text}</p>
                  <ul className="check-list">
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {price ? (
                    <p className="service-price">
                      от <strong>{formatMoney(price.price_per_unit)}</strong>
                      <span className="muted"> / {price.unit}</span>
                    </p>
                  ) : (
                    <p className="service-price muted">Цена уточняется…</p>
                  )}

                  <div className="cta-actions">
                    <Link className="btn" to={`/calculator?service=${service.id}`}>
                      Рассчитать стоимость
                    </Link>
                    {price && (
                      <button
                        className={`btn btn-ghost${addedSlug === service.id ? " btn-added" : ""}`}
                        type="button"
                        onClick={() => handleAdd(price)}
                      >
                        {addedSlug === service.id ? "Добавлено ✓" : "В корзину"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaBand
        eyebrow="Следующий шаг"
        title="Не знаете, с чего начать?"
        text="Осмотрим участок, ответим на вопросы и составим план под ваши цели и бюджет. Без давления и обязательств."
        actions={
          <div className="cta-actions">
            <Link className="btn btn-lg" to="/calculator">
              Открыть калькулятор →
            </Link>
            <a className="btn btn-lg btn-outline" href="tel:+78635551234">
              Позвонить сейчас
            </a>
          </div>
        }
      />
    </>
  );
}
