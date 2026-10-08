import { Link } from "react-router-dom";
import CtaBand from "../components/CtaBand";
import { SERVICE_DETAILS } from "../data/site";

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Что делаем</p>
          <h1>Услуги под климат юга</h1>
          <p>
            От умных систем полива до полного озеленения — решения, которые берегут воду и
            поддерживают участок в порядке весь год.
          </p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container">
          {SERVICE_DETAILS.map((service) => (
            <article
              className={`service-block${service.reverse ? " reverse" : ""}`}
              id={service.id}
              key={service.id}
            >
              <img
                src={service.image}
                alt={service.alt}
                width="900"
                height="600"
                loading="lazy"
              />
              <div>
                <h2>{service.title}</h2>
                <p className="eyebrow service-block-eyebrow">{service.eyebrow}</p>
                <p className="muted">{service.text}</p>
                <ul className="check-list">
                  {service.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className="btn" to="/contacts">
                  Запросить смету
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        eyebrow="Следующий шаг"
        title="Не знаете, с чего начать?"
        text="Осмотрим участок, ответим на вопросы и составим план под ваши цели и бюджет. Без давления и обязательств."
        actions={
          <div className="cta-actions">
            <Link className="btn btn-lg" to="/contacts">
              Запросить смету →
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
