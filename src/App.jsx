import { lazy, Suspense, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiSearch } from "react-icons/fi";
import { RiGithubFill, RiInstagramFill } from "react-icons/ri";
import AOS from "aos";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import BlurText from "./components/BlurText/BlurText";
import ScrambleText from "./components/ScrambleText";
import Lanyard from "./components/Lanyard/Lanyard";
import { listTools, listProyek, listPengalaman, listPendidikan, listSertifikat, listFakta } from "./data";
import Timeline from "./components/Timeline/Timeline";
import Education from "./components/Education/Education";
import Certificates from "./components/Certificates/Certificates";
import SectionHeading from "./components/SectionHeading";
import { usePageMeta } from "./lib/meta";
import { scrollToId } from "./lib/scroll";
import { filterProjects, projectCategories, toolFilterQuery, toolProjectCount } from "./lib/projects";
import {
  CV_FILENAME,
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  INSTAGRAM_URL,
  LOCATION,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "./lib/contact";

const ChatRoom = lazy(() => import("./components/ChatRoom"));

function ToolMarquee({ items, duration, reverse = false, onToolClick }) {
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
          const count = toolProjectCount(tool.nama);
          const clickable = count > 0;

          const content = (
            <>
              <img
                src={tool.gambar}
                alt={clone || !clickable ? "" : tool.nama}
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
            </>
          );

          const className = `tool-chip flex items-center gap-3 mr-6 p-3 border-3 border-black rounded-control bg-zinc-950 shadow-neo-sm hover:shadow-[6px_6px_0px_#ffe600] transition-shadow duration-200 shrink-0 ${
            clickable ? "cursor-pointer" : ""
          }`;

          // Only tools that actually appear in a project are interactive; the
          // rest would filter to zero results, which is a dead end dressed up
          // as a feature.
          if (!clickable) {
            return (
              <div key={`${tool.id}-${i}`} aria-hidden={clone || undefined} className={className}>
                {content}
              </div>
            );
          }

          // Clones stay out of the accessibility tree and unfocusable so the
          // marquee never exposes duplicate controls; they still answer the
          // pointer, and the same action exists on the original chip and on
          // every project card's stack tags.
          if (clone) {
            return (
              <div key={`${tool.id}-${i}`} aria-hidden="true" onClick={() => onToolClick(tool)} className={className}>
                {content}
              </div>
            );
          }

          return (
            <button
              key={`${tool.id}-${i}`}
              type="button"
              onClick={() => onToolClick(tool)}
              title={`${count} ${count === 1 ? "project uses" : "projects use"} ${tool.nama}`}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CATEGORY_CHIPS = ["all", ...projectCategories];

const CHAT_PLACEHOLDER = (
  <div className="h-[28rem] flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-wider">
    Loading chat…
  </div>
);

function ProjectsSection({ onProjectClick }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth, so a filtered view can be bookmarked or
  // sent to someone, survives a refresh, and can be set from outside this
  // section (the Skills marquee). replace:true keeps one history entry per
  // page rather than one per keystroke.
  const rawCategory = searchParams.get("cat");
  const category = CATEGORY_CHIPS.includes(rawCategory) ? rawCategory : "all";
  const query = searchParams.get("q") ?? "";

  const applyFilter = useCallback(
    (nextCategory, nextQuery) => {
      const params = {};
      if (nextCategory !== "all") params.cat = nextCategory;
      if (nextQuery.trim() !== "") params.q = nextQuery;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const visible = useMemo(() => filterProjects({ category, query }), [category, query]);
  const isFiltering = category !== "all" || query.trim() !== "";

  // Filtering swaps in DOM nodes AOS has never measured, and they would sit at
  // opacity 0 until the next scroll event.
  useEffect(() => {
    AOS.refreshHard();
  }, [visible]);

  const clearFilters = () => applyFilter("all", "");

  return (
    <section className="proyek mt-32" id="project" aria-labelledby="projects-title">
      <SectionHeading
        id="projects-title"
        badge="MY WORK"
        badgeClassName="bg-[#ffe600] text-black"
        title="Featured Projects"
        subtitle="Showcasing a selection of projects that reflect my skills, creativity, and passion for building meaningful digital experiences."
        className="mt-10"
      />

      <div className="mt-12 max-w-6xl mx-auto w-full" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200" data-aos-once="true">
        <div className="relative">
          <FiSearch size={18} className="proj-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => applyFilter(category, e.target.value)}
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
                onClick={() => applyFilter(chip, query)}
                aria-pressed={isActive}
                className={`proj-chip border-2 border-black rounded-chip px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "proj-chip-active bg-[#ffe600] text-black shadow-neo-sm"
                    : "bg-zinc-950 text-zinc-400 shadow-neo-xs hover:text-white hover:shadow-[4px_4px_0px_#00e5ff]"
                }`}
              >
                {chip === "all" ? "All" : chip}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <p className="proj-count text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Showing <ScrambleText text={String(visible.length)} duration={250} skipMount /> of{" "}
            {listProyek.length} projects
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
        <div className="proj-empty mt-14 max-w-6xl mx-auto w-full border-4 border-dashed border-black rounded-card bg-zinc-950 p-10 text-center">
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
              className="proj-card group relative flex flex-col border-4 border-black rounded-card overflow-hidden bg-zinc-950 shadow-neo-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-xl focus-visible:-translate-x-1 focus-visible:-translate-y-1 focus-visible:shadow-neo-xl focus-visible:outline-3 focus-visible:outline-[#00e5ff] focus-visible:outline-offset-4"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={(i % 3) * 100}
              data-aos-once="true"
            >
              <div className="relative overflow-hidden border-b-4 border-black">
                <img
                  src={project.image}
                  alt={`Screenshot of ${project.title}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="proj-cta" aria-hidden="true">
                  View case study →
                </span>
              </div>
              <div className="p-5 flex flex-col gap-1">
                <span className="proj-sub text-[11px] font-mono uppercase tracking-wider text-[#ffe600]">{project.subtitle}</span>
                <h3 className="proj-name text-xl font-black text-white leading-tight">{project.title}</h3>
              </div>
              <div className="mt-auto px-5 pb-5 flex flex-wrap items-center gap-2">
                <span className="proj-year text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-[#00e5ff] border-2 border-black rounded-chip px-1.5 py-0.5">
                  {project.year}
                </span>
                {(project.stack ?? []).slice(0, 3).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      applyFilter("all", tech);
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                    title={`Show projects using ${tech}`}
                    className="proj-tag text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 border-2 border-black rounded-chip px-1.5 py-0.5 cursor-pointer hover:text-white hover:shadow-[2px_2px_0px_#00e5ff] transition-all"
                  >
                    {tech}
                  </button>
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
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  // Navbar links clicked from a project page land here carrying a section to
  // reveal. Guarded per history key so it runs once — re-running it used to
  // fight useScrollReset and undo the scroll it had just made.
  const handledScrollKey = useRef(null);
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target || handledScrollKey.current === location.key) return;
    handledScrollKey.current = location.key;
    scrollToId(target);
  }, [location.key, location.state]);

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
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is blocked (permissions/private mode); the mailto link still works.
    }
  };

  const handleProjectClick = (project) => navigate(`/projects/${project.slug}`);

  // A marquee chip is a shortcut into the project filter, so it writes the same
  // ?q= param the search box uses and then reveals the section.
  const handleToolClick = (tool) => {
    setSearchParams({ q: toolFilterQuery(tool.nama) }, { replace: true });
    scrollToId("project");
  };

  usePageMeta(
    "Julian Arwansah — Fullstack Developer",
    "Portfolio of Julian Arwansah, a fullstack developer proficient in PHP, JavaScript, Python and Laravel. Projects, experience and skills."
  );

  return (
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
                className="w-10 h-10 border-2 border-black rounded-chip"
              />
              <q className="font-bold text-zinc-100 text-sm sm:text-base" aria-label="Building smarter solutions with IT and AI">
                <span aria-hidden="true">
                  <ScrambleText text="Building smarter solutions with IT and AI" />
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
                href={CV_PATH}
                download={CV_FILENAME}
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
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in a new tab)"
                data-magnetic
                className="neo-btn-magenta p-4 px-4 rounded-md"
              >
                <RiGithubFill size={20} aria-hidden="true" />
              </a>

              <a
                href={INSTAGRAM_URL}
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
                window.location.href = `mailto:${EMAIL}`;
              }}
            />
            </div>
          </div>
        </div>
        {/* tentang */}
        <section
          className="mt-24 mx-auto w-full max-w-[1600px] rounded-card border-4 border-black shadow-neo-lg bg-zinc-950 p-8"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-0 px-4 md:px-8" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
            <div className="basis-full md:basis-7/12 pr-0 md:pr-12 border-b-3 md:border-b-0 md:border-r-3 border-black pb-8 md:pb-0">
              {/* Kolom kiri */}
              <div className="flex-1 text-left">
                <h2 id="about-title" className="text-4xl sm:text-5xl font-black text-white mb-6 flex flex-wrap items-center gap-3">
                  <span className="neo-badge bg-[#ff007f] text-white text-xs sm:text-sm">
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
            <span className="neo-badge bg-[#00ff66] text-black text-sm">
              SKILLS
            </span>
            <span>Tools & Technologies</span>
          </h2>
          <p className="text-zinc-400 font-bold max-w-lg leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300" data-aos-once="true">
            My Professional Stack & Skills
          </p>
          <div className="tools-box mt-14 flex flex-col gap-6">
            <ToolMarquee items={listTools.slice(0, 10)} duration="70s" onToolClick={handleToolClick} />
            <ToolMarquee items={listTools.slice(10)} duration="85s" reverse onToolClick={handleToolClick} />
          </div>
        </section>
        {/* tentang */}

        {/* Pengalaman kerja */}
        <section className="pengalaman mt-32" id="experience" aria-labelledby="experience-title">
          <SectionHeading
            id="experience-title"
            badge="CAREER"
            badgeClassName="bg-[#ffe600] text-black"
            title="Work Experience"
            subtitle="Roles and responsibilities across companies, internships and full-time positions."
          />
          <div className="max-w-3xl mx-auto w-full px-4">
            <Timeline items={listPengalaman} />
          </div>
        </section>

        {/* Pendidikan */}
        <section className="edukasi mt-32" id="education" aria-labelledby="education-title">
          <SectionHeading
            id="education-title"
            badge="CAMPUS"
            badgeClassName="bg-[#00e5ff] text-black"
            title="Education"
            subtitle="Formal education from vocational school to university."
          />
          <div className="max-w-4xl mx-auto w-full px-4">
            <Education items={listPendidikan} />
          </div>
        </section>

        {/* Sertifikat */}
        {listSertifikat.length > 0 && (
          <section className="sertifikat mt-32" id="certificates" aria-labelledby="certificates-title">
            <SectionHeading
              id="certificates-title"
              badge="CREDENTIALS"
              badgeClassName="bg-[#ff007f] text-white"
              title="Certificates"
              subtitle="Certifications and credentials earned along the way."
            />
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
          <span className="neo-badge bg-[#ff007f] text-white mb-4 text-sm">
            TALK TO ME
          </span>
          <h2 id="contact-title" className="text-4xl sm:text-5xl font-black mb-4 text-white text-center">Contact & Chat</h2>
          <p className="text-zinc-400 font-bold text-center max-w-lg leading-relaxed mb-10">
            Get in touch with me or chat in real-time with other visitors!
          </p>

          <div className="w-full max-w-4xl grid sm:grid-cols-3 gap-4 mb-10">
            <div className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-card p-4 shadow-neo-sm hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all">
              <FiMail size={20} className="text-[#00e5ff]" aria-hidden="true" />
              <a
                href={`mailto:${EMAIL}`}
                className="font-bold text-white text-sm break-all hover:text-[#ffe600] transition-colors"
              >
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="text-[11px] font-mono uppercase border-2 border-black px-2 py-0.5 rounded-chip bg-[#ffe600] text-black shadow-neo-xs active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <a
              href={`tel:${PHONE_TEL}`}
              className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-card p-4 shadow-neo-sm hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all"
            >
              <FiPhone size={20} className="text-[#00ff66]" aria-hidden="true" />
              <span className="font-bold text-white text-sm">{PHONE_DISPLAY}</span>
            </a>
            <div className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-card p-4 shadow-neo-sm">
              <FiMapPin size={20} className="text-[#ff007f]" aria-hidden="true" />
              <span className="font-bold text-white text-sm">{LOCATION}</span>
            </div>
          </div>

          {/* Chat Room */}
          <div
            ref={chatHostRef}
            className="w-full max-w-4xl border-4 border-black shadow-neo-lg rounded-card overflow-hidden bg-zinc-950 p-2"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="400"
            data-aos-once="true"
          >
            {chatNear ? <Suspense fallback={CHAT_PLACEHOLDER}><ChatRoom /></Suspense> : CHAT_PLACEHOLDER}
          </div>
        </section>
    </main>
  )
}

export default App
