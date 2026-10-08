import { useState } from "react";
import { formatDate, formatMoney, formatQty, STATUS_LABELS, STATUS_ORDER } from "../utils/format";
import StatusBadge from "./StatusBadge";

function StatusProgress({ status }) {
  if (status === "cancelled") {
    return <p className="order-progress-cancelled">Заявка отменена</p>;
  }
  const current = STATUS_ORDER.indexOf(status);
  return (
    <ol className="order-progress" aria-label="Этапы выполнения">
      {STATUS_ORDER.map((s, idx) => (
        <li key={s} className={idx <= current ? "done" : ""}>
          <span className="order-progress-dot" aria-hidden="true" />
          <span>{STATUS_LABELS[s]}</span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderCard({ order, actions, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="order-card">
      <header className="order-card-head">
        <div>
          <p className="order-code">
            Заявка <strong>{order.tracking_code}</strong>
            <span className="order-id">#{order.id}</span>
          </p>
          <p className="order-meta">
            {formatDate(order.created_at)} · {order.customer_name} · {order.customer_phone}
          </p>
        </div>
        <div className="order-card-right">
          <StatusBadge status={order.status} />
          <p className="order-total">{formatMoney(order.total)}</p>
        </div>
      </header>

      <StatusProgress status={order.status} />

      {order.items.length > 0 ? (
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Объём</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.service_title}</td>
                <td>
                  {formatQty(item.quantity)} {item.unit}
                </td>
                <td>{formatMoney(item.unit_price)}</td>
                <td>{formatMoney(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">Заявка на консультацию (без позиций прайса).</p>
      )}

      {order.comment && (
        <p className="order-comment">
          <span className="muted">Комментарий:</span> {order.comment}
        </p>
      )}

      <button className="link-more order-toggle" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Скрыть историю" : "История статусов"} ({order.history.length})
      </button>

      {open && (
        <ol className="timeline">
          {order.history.map((h) => (
            <li key={h.id}>
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <p className="timeline-title">
                  <StatusBadge status={h.status} />
                  <span className="timeline-date">{formatDate(h.created_at)}</span>
                </p>
                <p className="timeline-note">
                  {h.note || "—"} <span className="muted">· {h.changed_by}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {actions && <div className="order-actions">{actions}</div>}
    </article>
  );
}
