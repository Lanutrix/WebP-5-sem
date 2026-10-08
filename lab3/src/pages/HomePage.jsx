import { Link } from "react-router-dom";
import CtaBand from "../components/CtaBand";
import Stats from "../components/Stats";
import { HOME_STATS, SERVICE_CARDS } from "../data/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <video
          className="hero-media"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          aria-label="Озеленённый участок с системой автополива"
        >
          <source src="/images/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Юг России</p>
          <h1>Умный полив. Ответственный ландшафт.</h1>
          <p className="hero-lead">
            Надёжные решения по автополиву и озеленению для частных домов и коммерческих
            объектов — проектируем, монтируем и обслуживаем.
          </p>
          <Link className="btn btn-lg" to="/contacts">
            Бесплатная консультация →
          </Link>
        </div>
      </section>

      <Stats items={HOME_STATS} />

      <section className="section" id="services">
        <div className="container">
          <header className="section-header">
            <p className="eyebrow">Наши услуги</p>
            <h2>Чем мы занимаемся</h2>
            <p>
              От проекта системы полива до регулярного обслуживания — закрываем все задачи по
              орошению и ландшафту.
            </p>
          </header>
          <div className="cards-2">
            {SERVICE_CARDS.map((card) => (
              <article className="service-card" key={card.id}>
                <div className="service-card-media">
                  <img
                    src={card.image}
                    alt={card.alt}
                    width="800"
                    height="560"
                    loading="lazy"
                  />
                </div>
                <div className="service-card-body">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Link className="link-more" to={`/services#${card.id}`}>
                    Подробнее →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className="section-header center">
            <p className="eyebrow">Почему мы</p>
            <h2>Почему выбирают нас</h2>
          </header>
          <div className="why-grid">
            <article className="why-item">
              <div className="bar" aria-hidden="true" />
              <h3>Официально и с гарантией</h3>
              <p>
                Работаем по договору, даём гарантию на монтаж и используем проверенные
                комплектующие. Ваш участок и спокойствие под защитой.
              </p>
            </article>
            <article className="why-item">
              <div className="bar" aria-hidden="true" />
              <h3>Знаем местный климат</h3>
              <p>
                Учитываем жаркое лето, перепады осадков и особенности грунтов юга. Локальный
                опыт — меньше переделок и стабильный результат.
              </p>
            </article>
            <article className="why-item">
              <div className="bar" aria-hidden="true" />
              <h3>Частные и коммерческие объекты</h3>
              <p>
                От небольшого двора до территории бизнес-центра — есть техника и бригада под
                проекты любого масштаба.
              </p>
            </article>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Начните с нами"
        title="Готовы сделать участок зеленее?"
        text="Бесплатный выезд и предварительная смета. Без давления и догадок — понятные ответы от людей, которые знают эту землю."
      />
    </>
  );
}
