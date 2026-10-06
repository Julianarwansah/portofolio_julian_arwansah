export default function SectionHeading({
  id,
  badge,
  badgeClassName,
  title,
  subtitle,
  className = "mb-14",
}) {
  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-once="true"
    >
      <span className={`neo-badge ${badgeClassName} mb-4 text-sm`}>{badge}</span>
      <h2 id={id} className="text-4xl sm:text-5xl font-black mb-4 text-white">
        {title}
      </h2>
      <p className="text-zinc-400 font-bold max-w-2xl leading-relaxed">{subtitle}</p>
    </div>
  );
}
