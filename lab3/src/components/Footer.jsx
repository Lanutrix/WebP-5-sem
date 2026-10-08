import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p>
            Рациональный полив и ландшафтные решения для Юга России. Доверяют владельцы частных
            домов и коммерческих объектов.
          </p>
        </div>
        <div className="footer-col">
          <h3>Услуги</h3>
          <nav aria-label="Услуги в подвале">
            <Link to="/services">Проектирование полива</Link>
            <Link to="/services">Монтаж полива</Link>
            <Link to="/services">Ремонт полива</Link>
            <Link to="/services">Ландшафтный дизайн</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h3>Компания</h3>
          <nav aria-label="Разделы сайта">
            <Link to="/">Главная</Link>
            <Link to="/services">Услуги</Link>
            <Link to="/about">О нас</Link>
            <Link to="/contacts">Контакты</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h3>Контакты</h3>
          <div className="footer-contact">
            <a href="tel:+78635551234">+7 (863) 555-12-34</a>
            <a href="mailto:info@zelenybereg.ru">info@zelenybereg.ru</a>
            <div>
              <span>
                Работаем по Ростовской области
                <br />
                Ростов-на-Дону, Таганрог и окрестности
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 Зелёный Берег. Все права защищены.</p>
      </div>
    </footer>
  );
}
