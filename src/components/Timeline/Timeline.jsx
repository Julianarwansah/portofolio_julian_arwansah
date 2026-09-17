import "./Timeline.css";

const TYPES = {
  pendidikan: { label: "Education", color: "#00e5ff", text: "#000000" },
  pengalaman: { label: "Experience", color: "#ffe600", text: "#000000" },
  organisasi: { label: "Organization", color: "#ff007f", text: "#ffffff" },
  sertifikat: { label: "Certificate", color: "#00ff66", text: "#000000" },
};

export default function Timeline({ items }) {
  return (
    <ol className="timeline-list">
      {items.map((entry) => {
        const type = TYPES[entry.tipe] ?? TYPES.pengalaman;

        return (
          <li
            key={entry.id}
            className="timeline-item"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-once="true"
          >
            <span className="timeline-dot" style={{ backgroundColor: type.color }} aria-hidden="true" />
            <div className="timeline-card">
              <div className="timeline-meta">
                <span
                  className="neo-badge timeline-type"
                  style={{ backgroundColor: type.color, color: type.text }}
                >
                  {type.label}
                </span>
                <span className="timeline-period">{entry.periode}</span>
              </div>
              <h3 className="timeline-title">{entry.judul}</h3>
              <p className="timeline-org">
                {entry.instansi}
                {entry.tempat ? ` · ${entry.tempat}` : ""}
              </p>
              <p className="timeline-desc">{entry.deskripsi}</p>
              {entry.nomorSertifikat && (
                <p className="timeline-cert">Cert ID: {entry.nomorSertifikat}</p>
              )}
              {entry.tautan && (
                <a
                  href={entry.tautan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="timeline-link"
                >
                  Verify credential
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
