import ContactForm from "../components/ContactForm";

const AREAS = [
  "Ростов-на-Дону",
  "Таганрог",
  "Новочеркасск",
  "Азов",
  "Батайск",
  "Шахты",
];

export default function ContactsPage() {
  return (
    <>
      <section className="page-hero page-hero--banner">
        <div className="page-hero-bg page-hero-bg--contacts" aria-hidden="true" />
        <div className="page-hero-inner">
          <p className="page-hero-eyebrow">Связь</p>
          <h1>Расскажите о своём участке</h1>
          <p className="page-hero-lead">
            Заполните форму — ответим в течение одного рабочего дня. Удобнее позвонить? Будем рады
            разговору.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-layout">
          <div className="contact-card">
            <h2>Запросить бесплатную смету</h2>
            <p className="contact-card-lead">Опишите задачу — подготовим план работ.</p>
            <ContactForm />
          </div>

          <aside className="contact-aside">
            <div className="aside-card">
              <h2>Контактные данные</h2>
              <div className="info-list">
                <a className="info-row" href="tel:+78635551234">
                  <span className="info-icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span>
                    <span className="info-label">Телефон</span>
                    <span className="info-value">+7 (863) 555-12-34</span>
                  </span>
                </a>

                <a className="info-row" href="mailto:info@zelenybereg.ru">
                  <span className="info-icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <span>
                    <span className="info-label">Email</span>
                    <span className="info-value">info@zelenybereg.ru</span>
                  </span>
                </a>

                <div className="info-row">
                  <span className="info-icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span>
                    <span className="info-label">Часы работы</span>
                    <span className="info-value">Пн–Пт 8:00–17:00, Сб 9:00–12:00</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="aside-card">
              <h2>Зона обслуживания</h2>
              <p className="aside-lead">
                Работаем с частными и коммерческими объектами по Ростовской области. В том числе:
              </p>
              <ul className="area-list">
                {AREAS.map((area) => (
                  <li key={area}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
