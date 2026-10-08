export default function Stats({ items, label = "Показатели компании" }) {
  return (
    <section className="stats" aria-label={label}>
      <div className="container stats-grid">
        {items.map((item) => (
          <div key={item.label}>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
