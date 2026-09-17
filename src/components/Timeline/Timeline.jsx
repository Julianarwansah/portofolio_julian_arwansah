import "./Timeline.css";

export default function Timeline({ items }) {
  return (
    <ol className="xp-list">
      {items.map((item) => (
        <li
          key={item.id}
          className="xp-item"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-once="true"
        >
          <span className="xp-dot" aria-hidden="true" />
          <div className="xp-card">
            <div className="xp-head">
              <h3 className="xp-role">{item.judul}</h3>
              <span className="xp-period">{item.periode}</span>
            </div>
            <p className="xp-company">{item.instansi}</p>
            <p className="xp-desc">{item.deskripsi}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
