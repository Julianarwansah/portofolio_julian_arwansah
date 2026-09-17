import { FaGraduationCap } from "react-icons/fa";
import "./Education.css";

export default function Education({ items }) {
  return (
    <ul className="edu-grid">
      {items.map((item) => (
        <li
          key={item.id}
          className="edu-card"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-once="true"
        >
          <div className="edu-top">
            <span className="edu-icon">
              <FaGraduationCap size={22} aria-hidden="true" />
            </span>
            <span className="edu-period">{item.periode}</span>
          </div>
          <h3 className="edu-degree">{item.judul}</h3>
          <p className="edu-school">{item.instansi}</p>
          <p className="edu-desc">{item.deskripsi}</p>
        </li>
      ))}
    </ul>
  );
}
