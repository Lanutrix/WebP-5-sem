import { Link } from "react-router-dom";

export default function CtaBand({ eyebrow, title, text, actions }) {
  return (
    <section className="cta-band">
      <div className="cta-grid">
        <div className="cta-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{text}</p>
          {actions ?? (
            <Link className="btn btn-lg" to="/contacts">
              Запросить смету →
            </Link>
          )}
        </div>
        <div className="cta-media">
          <img
            src="/images/cta-bg.jpg"
            alt="Озеленённый участок"
            width="1200"
            height="800"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
