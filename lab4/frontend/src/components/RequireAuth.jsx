import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ admin = false, children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="muted">Проверяем авторизацию…</p>
        </div>
      </section>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (admin && !isAdmin) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert-error">Доступ только для администратора.</div>
        </div>
      </section>
    );
  }
  return children;
}
