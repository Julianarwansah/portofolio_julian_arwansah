import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiSearch } from "react-icons/fi";
import { RiGithubFill, RiInstagramFill } from "react-icons/ri";
import AOS from "aos";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import BlurText from "./components/BlurText/BlurText";
import Lanyard from "./components/Lanyard/Lanyard";
import { listTools, listProyek, listPengalaman, listPendidikan, listSertifikat, listFakta } from "./data";
import Timeline from "./components/Timeline/Timeline";
import Education from "./components/Education/Education";
import Certificates from "./components/Certificates/Certificates";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import CreativeCursor from "./components/CreativeCursor";
import { usePageMeta } from "./lib/meta";
import { useTheme } from "./lib/theme";
import { scrollToId } from "./lib/scroll";
import { filterProjects, projectCategories } from "./lib/projects";

const ChatRoom = lazy(() => import("./components/ChatRoom"));

function ToolMarquee({ items, duration, reverse = false }) {
  return (
    <div
      className={`marquee ${reverse ? "marquee-reverse" : ""}`}
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-once="true"
    >
      <div className="marquee-track" style={{ animationDuration: duration }}>
        {[...items, ...items].map((tool, i) => {
          const clone = i >= items.length;
          return (
            <div
              key={`${tool.id}-${i}`}
              aria-hidden={clone || undefined}
              className="tool-chip flex items-center gap-3 mr-6 p-3 border-3 border-black rounded-lg bg-zinc-950 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#ffe600] transition-shadow duration-200 shrink-0"
            >
              <img
                src={tool.gambar}
                alt={clone ? "" : tool.nama}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 object-contain bg-zinc-900 border-2 border-black p-2 rounded-md"
              />
              <div className="flex flex-col">
                <span className="tool-name font-bold text-white text-sm whitespace-nowrap">{tool.nama}</span>
                <span className="tool-ket text-[10px] text-zinc-500 font-mono tracking-tight uppercase whitespace-nowrap mt-0.5">{tool.ket}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Typewriter({ text, speed = 45 }) {
  const [length, setLength] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? text.length : 0
  );

  useEffect(() => {
    if (length >= text.length) return;
    const t = setTimeout(() => setLength((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [length, text, speed]);

  return (
    <>
      {text.slice(0, length)}
      {length < text.length && (
        <span className="tw-caret" aria-hidden="true">
          ▌
        </span>
      )}
    </>
  );
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function KonamiConfetti() {
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    let idx = 0;
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      idx = key === KONAMI[idx] ? idx + 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        setBurst((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!burst || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ffe600", "#00e5ff", "#ff007f", "#00ff66"];
    const host = document.createElement("div");
    host.className = "confetti-host";
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      host.appendChild(piece);
    }
    document.body.appendChild(host);
    const t = setTimeout(() => host.remove(), 3400);
    return () => {
      clearTimeout(t);
      host.remove();
    };
  }, [burst]);

  return null;
}

const CATEGORY_CHIPS = ["all", ...projectCategories];

const CHAT_PLACEHOLDER = (
  <div className="h-[28rem] flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-wider">
    Loading chat…
  </div>
);

function ProjectsSection({ onProjectClick }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => filterProjects({ category, query }), [category, query]);
  const isFiltering = category !== "all" || query.trim() !== "";

  // Filtering swaps in DOM nodes AOS has never measured, and they would sit at
  // opacity 0 until the next scroll event.
  useEffect(() => {
    AOS.refreshHard();
  }, [visible]);

  const clearFilters = () => {
    setCategory("all");
    setQuery("");
  };

  return (
    <section className="proyek mt-32" id="project" aria-labelledby="projects-title">
      <div className="flex flex-col items-center text-center mt-10" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
        <span className="neo-badge bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 mb-4 text-sm">
          MY WORK
        </span>
        <h2 id="projects-title" className="text-4xl sm:text-5xl font-black mb-4 text-white">Featured Projects</h2>
        <p className="text-zinc-400 font-bold max-w-2xl leading-relaxed">
          Showcasing a selection of projects that reflect my skills, creativity, and passion for building meaningful digital experiences.
        </p>
      </div>

      <div className="mt-12 max-w-6xl mx-auto w-full" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true">
        <div className="relative">
          <FiSearch size={18} className="proj-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects or tech — try Laravel, Flutter, EV…"
            aria-label="Search projects"
            className="proj-search w-full border-3 border-black rounded-md bg-zinc-950 py-3 pl-12 pr-4 text-sm font-bold text-white placeholder:text-zinc-600 shadow-[4px_4px_0px_#000000] focus:shadow-[4px_4px_0px_#ffe600] focus:outline-none transition-shadow"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Filter projects by category">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = chip === category;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setCategory(chip)}
                aria-pressed={isActive}
                className={`proj-chip border-2 border-black rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "proj-chip-active bg-[#ffe600] text-black shadow-[3px_3px_0px_#000000]"
                    : "bg-zinc-950 text-zinc-400 shadow-[2px_2px_0px_#000000] hover:text-white hover:shadow-[3px_3px_0px_#00e5ff]"
                }`}
              >
                {chip === "all" ? "All" : chip}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <p className="proj-count text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Showing {visible.length} of {listProyek.length} projects
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="proj-clear text-[11px] font-mono uppercase tracking-wider font-bold text-[#ff007f] hover:text-white border-b-2 border-current cursor-pointer transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="proj-empty mt-14 max-w-6xl mx-auto w-full border-4 border-dashed border-black rounded-xl bg-zinc-950 p-10 text-center">
          <p className="proj-empty-title text-2xl font-black text-white mb-2">No projects match that.</p>
          <p className="proj-empty-desc text-zinc-400 font-bold mb-6">
            Try a different keyword, or reset the filters to see all {listProyek.length} projects.
          </p>
          <button type="button" onClick={clearFilters} className="neo-btn-yellow p-3 px-6 rounded-md text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="proyek-box mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
          {visible.map((project, i) => (
            <article
              key={project.slug}
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${project.title}`}
              onClick={() => onProjectClick(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onProjectClick(project);
                }
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
              }}
              style={{ "--card-border": project.borderColor || "transparent", cursor: "pointer" }}
              className="proj-card group relative flex flex-col border-4 border-black rounded-xl overflow-hidden bg-zinc-950 shadow-[8px_8px_0px_#000000] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000000] focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-[12px_12px_0px_#000000] focus-visible:outline-3 focus-visible:outline-[#00e5ff] focus-visible:outline-offset-4"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={(i % 3) * 100}
              data-aos-once="true"
            >
              <div className="overflow-hidden border-b-4 border-black">
                <img
                  src={project.image}
                  alt={`Screenshot of ${project.title}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col gap-1">
                <span className="proj-sub text-[11px] font-mono uppercase tracking-wider text-[#ffe600]">{project.subtitle}</span>
                <h3 className="proj-name text-xl font-black text-white leading-tight">{project.title}</h3>
              </div>
              <div className="mt-auto px-5 pb-5 flex flex-wrap items-center gap-2">
                <span className="proj-year text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-[#00e5ff] border-2 border-black rounded-sm px-1.5 py-0.5">
                  {project.year}
                </span>
                {(project.stack ?? []).slice(0, 3).map((tech) => (
                  <span key={tech} className="proj-tag text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 border-2 border-black rounded-sm px-1.5 py-0.5">
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// Stable references so toggling the theme does not rebuild the physics scene.
const LANYARD_POSITION = [0, 0, 15];
const LANYARD_GRAVITY = [0, -40, 0];

function App() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Navbar links clicked from a project page land here carrying a section to reveal.
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    scrollToId(target);
    navigate(location.pathname, { replace: true });
  }, [location.state, location.pathname, navigate]);

  const heroTextRef = useRef(null);
  const heroCardRef = useRef(null);
  const chatHostRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [chatNear, setChatNear] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      if (heroTextRef.current) heroTextRef.current.style.transform = `translateY(${y * -0.05}px)`;
      if (heroCardRef.current) heroCardRef.current.style.transform = `translateY(${y * -0.1}px)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // The chat chunk drags Firebase in with it, so it is only requested once the
  // visitor gets close to the contact section.
  useEffect(() => {
    const host = chatHostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setChatNear(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("julianarwansahh@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is blocked (permissions/private mode); the mailto link still works.
    }
  };

  const handleProjectClick = (project) => navigate(`/projects/${project.slug}`);

  usePageMeta(
    "Julian Arwansah — Fullstack Developer",
    "Portfolio of Julian Arwansah, a fullstack developer proficient in PHP, JavaScript, Python and Laravel. Projects, experience and skills."
  );

  return (
    <>
      <ScrollProgress />
      <CreativeCursor />
      <KonamiConfetti />
      <div className="container mx-auto px-4 sm:px-6">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="hero grid md:grid-cols-2 items-center pt-16 xl:gap-0 gap-8 grid-cols-1">
          <div className="animate-fade-in-up animate-delay-1s">
            <div ref={heroTextRef}>
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-zinc-950 w-fit max-w-full p-4 border-3 border-black neo-shadow-yellow rounded-md">
              <img
                src={`${import.meta.env.BASE_URL}assets/cardjul.webp`}
                alt=""
                width={40}
                height={40}
                decoding="async"
                className="w-10 h-10 border-2 border-black rounded-sm"
              />
              <q className="font-bold text-zinc-100 text-sm sm:text-base" aria-label="Building smarter solutions with IT and AI">
                <span aria-hidden="true">
                  <Typewriter text="Building smarter solutions with IT and AI" />
                </span>
              </q>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black mb-6 text-white leading-none tracking-tight">
              Hi I'm <br className="sm:hidden" />
              <span className="bg-[#ffe600] text-black px-4 py-1 border-3 border-black inline-block transform -rotate-1 select-none my-2 neo-shadow-black">
                Julian Arwansah
              </span>
            </h1>
            <BlurText
              text="I am a seventh-semester Software Engineering student with a strong interest in web development, proficient in PHP, JavaScript, Python, and frameworks such as Laravel. I enjoy solving technical problems and continuously honing my skills through personal projects and collaboration."
              delay={100}
              animateBy="words"
              direction="top"
              className="mb-6 text-zinc-400 text-lg leading-relaxed font-medium block"
            />
            <dl className="fact-bar grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {listFakta.map((fact) => (
                <div key={fact.label} className="fact-cell border-3 border-black rounded-md bg-zinc-950 p-3 shadow-[4px_4px_0px_#000000]">
                  <dt className="fact-label text-[10px] font-mono uppercase tracking-wider text-zinc-500">{fact.label}</dt>
                  <dd className="fact-value text-sm font-bold text-white mt-1">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center sm:gap-6 gap-3 flex-wrap">
              <a
                href={`${import.meta.env.BASE_URL}assets/CV.pdf`}
                download="Julian_Arwansah_CV.pdf"
                data-magnetic
                className="neo-btn-cyan p-4 px-6 rounded-md text-base"
              >
                Download CV
              </a>

              <a 
                href="#project" 
                data-magnetic
                className="neo-btn-yellow p-4 px-6 rounded-md text-base"
              >
                Explore My Projects
              </a>

              <a
                href="https://github.com/Julianarwansah"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in a new tab)"
                data-magnetic
                className="neo-btn-magenta p-4 px-4 rounded-md"
              >
                <RiGithubFill size={20} aria-hidden="true" />
              </a>

              <a
                href="https://www.instagram.com/iyan_juliann/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram profile (opens in a new tab)"
                data-magnetic
                className="neo-btn-cyan p-4 px-4 rounded-md"
              >
                <RiInstagramFill size={20} aria-hidden="true" />
              </a>
            </div>
            </div>
          </div>
          <div className="md:ml-auto animate-fade-in-up animate-delay-2s">
            <div ref={heroCardRef}>
            <ProfileCard
              name="Julian"
              handle="iyan_julian"
              status="Online"
              contactText="Contact Me"
              avatarUrl={`${import.meta.env.BASE_URL}assets/ftjul.webp`}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {
                window.location.href = "mailto:julianarwansahh@gmail.com";
              }}
            />
            </div>
          </div>
        </div>
        {/* tentang */}
        <section
          className="mt-20 mx-auto w-full max-w-[1600px] rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-zinc-950 p-8"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-0 px-4 md:px-8" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
            <div className="basis-full md:basis-7/12 pr-0 md:pr-12 border-b-3 md:border-b-0 md:border-r-3 border-black pb-8 md:pb-0">
              {/* Kolom kiri */}
              <div className="flex-1 text-left">
                <h2 id="about-title" className="text-3.5xl md:text-4.5xl font-black text-white mb-6 flex flex-wrap items-center gap-3">
                  <span className="neo-badge bg-[#ff007f] text-white py-1 px-3 border-2 border-black rounded-sm shadow-[2.5px_2.5px_0px_#000] text-xs sm:text-sm">
                    WHO AM I?
                  </span>
                  About Me
                </h2>

                <BlurText
                  text="I am a seventh-semester undergraduate student majoring in Informatics Engineering, specializing in Software Engineering. I am proficient in PHP, JavaScript, Python, and frameworks such as Laravel, with hands-on experience from backend internships to production full-stack work. I believe in continuous learning and adapting to technological advancements — outside of coding, I enjoy activities that challenge creativity and logic, such as strategy games."
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="text-base md:text-lg leading-relaxed mb-6 text-zinc-300 font-medium"
                />

                <div className="mt-4 p-4 bg-zinc-900 border-2 border-black neo-shadow-cyan rounded-md inline-block">
                  <p className="text-xs sm:text-sm font-bold text-[#00e5ff] tracking-wider uppercase font-mono">
                    ✦ Working with heart, creating with mind. ✦
                  </p>
                </div>
              </div>
            </div>

            {/* Kolom kanan */}
            <div className="basis-full md:basis-5/12 pl-0 md:pl-8 overflow-hidden max-w-full flex justify-center ">
              <Lanyard position={LANYARD_POSITION} gravity={LANYARD_GRAVITY} />
            </div>
          </div>

        </section>
        <section className="tools mt-32" aria-labelledby="tools-title">
          <h2 id="tools-title" className="text-4xl sm:text-5xl font-black mb-4 flex flex-wrap items-center gap-3" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true" >
            <span className="neo-badge bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 text-sm">
              SKILLS
            </span>
            <span>Tools & Technologies</span>
          </h2>
          <p className="text-zinc-400 font-bold max-w-lg leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300" data-aos-once="true">
            My Professional Stack & Skills
          </p>
          <div className="tools-box mt-14 flex flex-col gap-6">
            <ToolMarquee items={listTools.slice(0, 10)} duration="70s" />
            <ToolMarquee items={listTools.slice(10)} duration="85s" reverse />
          </div>
        </section>
        {/* tentang */}

        {/* Pengalaman kerja */}
        <section className="pengalaman mt-32" id="experience" aria-labelledby="experience-title">
          <div className="flex flex-col items-center text-center mb-14" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
            <span className="neo-badge bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] mb-4 text-sm">
              CAREER
            </span>
            <h2 id="experience-title" className="text-4xl sm:text-5xl font-black mb-4 text-white">Work Experience</h2>
            <p className="text-zinc-400 font-bold max-w-2xl leading-relaxed">
              Roles and responsibilities across companies, internships and full-time positions.
            </p>
          </div>
          <div className="max-w-3xl mx-auto w-full px-4">
            <Timeline items={listPengalaman} />
          </div>
        </section>

        {/* Pendidikan */}
        <section className="edukasi mt-32" id="education" aria-labelledby="education-title">
          <div className="flex flex-col items-center text-center mb-14" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
            <span className="neo-badge bg-[#00e5ff] text-black border-2 border-black shadow-[2px_2px_0px_#000] mb-4 text-sm">
              CAMPUS
            </span>
            <h2 id="education-title" className="text-4xl sm:text-5xl font-black mb-4 text-white">Education</h2>
            <p className="text-zinc-400 font-bold max-w-2xl leading-relaxed">
              Formal education from vocational school to university.
            </p>
          </div>
          <div className="max-w-4xl mx-auto w-full px-4">
            <Education items={listPendidikan} />
          </div>
        </section>

        {/* Sertifikat */}
        {listSertifikat.length > 0 && (
          <section className="sertifikat mt-32" id="certificates" aria-labelledby="certificates-title">
            <div className="flex flex-col items-center text-center mb-14" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
              <span className="neo-badge bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_#000] mb-4 text-sm">
                CREDENTIALS
              </span>
              <h2 id="certificates-title" className="text-4xl sm:text-5xl font-black mb-4 text-white">Certificates</h2>
              <p className="text-zinc-400 font-bold max-w-2xl leading-relaxed">
                Certifications and credentials earned along the way.
              </p>
            </div>
            <div className="max-w-5xl mx-auto w-full px-4">
              <Certificates items={listSertifikat} />
            </div>
          </section>
        )}

        {/* Proyek */}
        <ProjectsSection onProjectClick={handleProjectClick} />
        {/* Proyek */}


        {/* Kontak */}
        <section className="kontak mt-32 flex flex-col items-center" id="contact" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true" aria-labelledby="contact-title">
          <span className="neo-badge bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 mb-4 text-sm">
            TALK TO ME
          </span>
          <h2 id="contact-title" className="text-4xl sm:text-5xl font-black mb-4 text-white text-center">Contact & Chat</h2>
          <p className="text-zinc-400 font-bold text-center max-w-lg leading-relaxed mb-10">
            Get in touch with me or chat in real-time with other visitors!
          </p>

          <div className="w-full max-w-4xl grid sm:grid-cols-3 gap-4 mb-10">
            <div className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all">
              <FiMail size={20} className="text-[#00e5ff]" aria-hidden="true" />
              <a
                href="mailto:julianarwansahh@gmail.com"
                className="font-bold text-white text-sm break-all hover:text-[#ffe600] transition-colors"
              >
                julianarwansahh@gmail.com
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="text-[11px] font-mono uppercase border-2 border-black px-2 py-0.5 rounded-sm bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <a
              href="tel:+6289661770123"
              className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all"
            >
              <FiPhone size={20} className="text-[#00ff66]" aria-hidden="true" />
              <span className="font-bold text-white text-sm">+62 896-6177-0123</span>
            </a>
            <div className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-lg p-4 shadow-[4px_4px_0px_#000]">
              <FiMapPin size={20} className="text-[#ff007f]" aria-hidden="true" />
              <span className="font-bold text-white text-sm">Cikupa, Kabupaten Tangerang, Indonesia</span>
            </div>
          </div>

          {/* Chat Room */}
          <div
            ref={chatHostRef}
            className="w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden bg-zinc-950 p-2"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="400"
            data-aos-once="true"
          >
            {chatNear ? <Suspense fallback={CHAT_PLACEHOLDER}><ChatRoom /></Suspense> : CHAT_PLACEHOLDER}
          </div>
        </section>
      </main >
      <Footer />
      </div>
    </>
  )
}

export default App
