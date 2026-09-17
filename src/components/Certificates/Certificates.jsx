import { FiAward, FiExternalLink } from "react-icons/fi";
import "./Certificates.css";

export default function Certificates({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="cert-grid">
      {items.map((item) => (
        <li
          key={item.id}
          className="cert-card"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-once="true"
        >
          <div className="cert-top">
            <span className="cert-seal">
              <FiAward size={22} aria-hidden="true" />
            </span>
            <span className="cert-period">{item.periode}</span>
          </div>
          <h3 className="cert-name">{item.judul}</h3>
          <p className="cert-issuer">{item.instansi}</p>
          {item.nomorSertifikat && <p className="cert-id">ID: {item.nomorSertifikat}</p>}
          {item.tautan && (
            <a
              className="cert-link"
              href={item.tautan}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiExternalLink size={14} aria-hidden="true" /> Verify credential
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
