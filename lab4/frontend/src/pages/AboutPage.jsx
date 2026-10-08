import CtaBand from "../components/CtaBand";
import Stats from "../components/Stats";
import { ABOUT_STATS, COUNTIES } from "../data/site";

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Наша история</p>
          <h1>Работаем на земле, которую знаем</h1>
          <p>
            С 2011 года помогаем владельцам участков на Юге России создавать умные и красивые
            ландшафты.
          </p>
        </div>
      </section>

      <section className="section section--flush-top">
        <div className="container about-story">
          <div>
            <h2>Местная компания до конца</h2>
            <p className="muted">
              «Зелёный Берег» основали специалисты по поливу, которые выросли на юге и хорошо
              знают его особенности: плотные грунты, скалистые участки, непредсказуемые осадки и
              необходимость беречь воду.
            </p>
            <p className="muted">
              Из небольшой бригады с одним фургоном выросла полноценная компания по поливу и
              озеленению. Работаем в Ростове-на-Дону, Таганроге, Новочеркасске, Азове, Батайске и
              ближайших районах.
            </p>
            <p className="muted">
              Мы не франшиза. Каждый проект ведём на месте, бригаду готовим сами, а систему
              подбираем именно под ваш участок. В этом и разница.
            </p>
          </div>
          <img
            src="/images/about-story.jpg"
            alt="Работа на участке: полив и озеленение"
            width="900"
            height="700"
            loading="lazy"
          />
        </div>
      </section>

      <Stats items={ABOUT_STATS} />

      <section className="section">
        <div className="container">
          <header className="section-header center">
            <p className="eyebrow">Ценности</p>
            <h2>На чём мы стоим</h2>
          </header>
          <div className="values-grid">
            <article className="value-card">
              <h3>Бережное отношение к воде</h3>
              <p className="muted">
                Каждую систему проектируем с расчётом на экономию. Ресурсы региона важны — и
                инженерия это отражает.
              </p>
            </article>
            <article className="value-card">
              <h3>Честные цены</h3>
              <p className="muted">
                Без скрытых доплат. Даём подробную смету до начала работ и придерживаемся
                договорённостей.
              </p>
            </article>
            <article className="value-card">
              <h3>Местная экспертиза</h3>
              <p className="muted">
                Знаем почвы, растения и погоду юга. Этот опыт виден в каждом сданном проекте.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section bg-soft">
        <div className="container">
          <header className="section-header">
            <p className="eyebrow">Доверие</p>
            <h2>Официально и надёжно</h2>
            <p>
              Работаем по договору, оформляем гарантию и несём ответственность за результат —
              можно обращаться без опасений.
            </p>
          </header>
          <div className="cert-list">
            <div className="cert-item">
              <span className="dot" aria-hidden="true" />
              <div>
                <h3>Профильные специалисты</h3>
                <p className="muted">
                  Ведущие инженеры и монтажники проходят внутреннее обучение и работают по
                  утверждённым стандартам компании.
                </p>
              </div>
            </div>
            <div className="cert-item">
              <span className="dot" aria-hidden="true" />
              <div>
                <h3>Страхование и гарантия</h3>
                <p className="muted">
                  На каждый объект — договор, гарантия на работы и ответственность за сохранность
                  участка во время монтажа.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className="section-header">
            <p className="eyebrow">География</p>
            <h2>Зона обслуживания</h2>
            <p>
              Обслуживаем частных и коммерческих клиентов по Ростовской области. Если не уверены,
              входим ли в ваш район — просто позвоните.
            </p>
          </header>
          <div className="counties">
            {COUNTIES.map((county) => (
              <article className="county" key={county.title}>
                <h3>{county.title}</h3>
                <p>{county.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Свяжитесь с нами"
        title="Обсудим ваш участок"
        text="Нужна новая система полива, обновление ландшафта или просто совет специалиста — мы на связи."
      />
    </>
  );
}
