import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { NAV_LINKS } from "../data/site";

function CartLink({ count, onClick, className = "" }) {
  return (
    <Link className={`cart-link ${className}`.trim()} to="/cart" onClick={onClick} aria-label="Корзина">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      <span>Корзина</span>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </Link>
  );
}

function AuthLinks({ onClick, mobile = false }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClick?.();
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <>
        <NavLink className="auth-link" to="/track" onClick={onClick}>
          Статус заявки
        </NavLink>
        <Link className={mobile ? "btn" : "btn btn-pill"} to="/login" onClick={onClick}>
          Войти
        </Link>
      </>
    );
  }

  return (
    <>
      <NavLink className="auth-link" to="/orders" onClick={onClick}>
        {isAdmin ? "Заявки" : "Мои заявки"}
      </NavLink>
      {isAdmin && (
        <NavLink className="auth-link auth-link--admin" to="/admin" onClick={onClick}>
          Админ
        </NavLink>
      )}
      <span className="auth-user" title={user.email}>
        {user.name}
      </span>
      <button className="auth-logout" type="button" onClick={handleLogout}>
        Выйти
      </button>
    </>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link className="logo" to="/" onClick={closeMenu}>
          <img src="/images/logo.png" alt="Зелёный Берег" width="200" height="70" />
        </Link>

        <nav className="nav-desktop" aria-label="Основная навигация">
          {NAV_LINKS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <CartLink count={count} />
          <AuthLinks />
        </div>

        <button
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="icon-menu" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <svg className="icon-close" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <nav className={`nav-mobile${menuOpen ? " is-open" : ""}`} id="mobile-nav" aria-label="Мобильная навигация">
        {NAV_LINKS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMenu}>
            {item.label}
          </NavLink>
        ))}
        <CartLink count={count} onClick={closeMenu} className="nav-mobile-cart" />
        <div className="nav-mobile-auth">
          <AuthLinks onClick={closeMenu} mobile />
        </div>
      </nav>
    </header>
  );
}
