import { lazy, Suspense, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import BlurText from "./components/BlurText/BlurText";
import Lanyard from "./components/Lanyard/Lanyard";
import { listTools, listProyek, listPengalaman, listPendidikan, listSertifikat } from "./data";
import ChromaGrid from "./components/ChromaGrid/ChromaGrid";
import Timeline from "./components/Timeline/Timeline";
import Education from "./components/Education/Education";
import Certificates from "./components/Certificates/Certificates";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { usePageMeta } from "./lib/meta";

const ChatRoom = lazy(() => import("./components/ChatRoom"));

// Stable references so toggling the theme does not rebuild the physics scene.
const LANYARD_POSITION = [0, 0, 15];
const LANYARD_GRAVITY = [0, -40, 0];

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage is blocked in private browsing; the toggle still works for this session.
    }
  }, [theme]);

  const navigate = useNavigate();

  const handleProjectClick = (project) => navigate(`/projects/${project.slug}`);

  usePageMeta(
    "Julian Arwansah — Fullstack Developer",
    "Portfolio of Julian Arwansah, a fullstack developer proficient in PHP, JavaScript, Python and Laravel. Projects, experience and skills."
  );

  return (
    <>
      <div className="container mx-auto px-6">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="hero grid md:grid-cols-2 items-center pt-16 xl:gap-0 gap-8 grid-cols-1">
          <div className="animate-fade-in-up animate-delay-1s">
            <div className="flex items-center gap-3 mb-6 bg-zinc-950 w-fit p-4 border-3 border-black neo-shadow-yellow rounded-md">
              <img
                src={`${import.meta.env.BASE_URL}assets/cardjul.webp`}
                alt=""
                width={40}
                height={40}
                decoding="async"
                className="w-10 h-10 border-2 border-black rounded-sm"
              />
              <q className="font-bold text-zinc-100 text-sm sm:text-base">Building smarter solutions with IT and AI</q>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 text-white leading-none tracking-tight">
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
              className="mb-8 text-zinc-400 text-lg leading-relaxed font-medium block"
            />
            <div className="flex items-center sm:gap-6 gap-3 flex-wrap">
              <a
                href={`${import.meta.env.BASE_URL}assets/CV.pdf`}
                download="Julian_Arwansah_CV.pdf"
                className="neo-btn-cyan p-4 px-6 rounded-md text-base"
              >
                Download CV
              </a>

              <a 
                href="#project" 
                className="neo-btn-yellow p-4 px-6 rounded-md text-base"
              >
                Explore My Projects
              </a>
            </div>

          </div>
          <div className="md:ml-auto animate-fade-in-up animate-delay-2s">
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
            Tools & Technologies
          </h2>
          <p className="text-zinc-400 font-bold max-w-lg leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300" data-aos-once="true">
            My Professional Stack & Skills
          </p>
          <div className="tools-box mt-14 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">

            {listTools.map((tool) => (
              <div
                key={tool.id} data-aos="fade-up" data-aos-duration="1000" data-aos-delay={tool.dad} data-aos-once="true"
                className="flex items-center gap-4 p-4 border-3 border-black rounded-lg bg-zinc-950 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 group"
              >
                <img
                  src={tool.gambar}
                  alt={tool.nama}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 object-contain bg-zinc-900 border-2 border-black p-2 rounded-md group-hover:bg-zinc-800 transition-all duration-200"
                />
                <div className="flex flex-col overflow-hidden">
                  <div className="truncate">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ffe600] transition-colors truncate">
                      {tool.nama}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono tracking-tight uppercase mt-0.5 truncate">{tool.ket}</p>
                </div>
              </div>
            ))}
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
        <div className="proyek-box mt-14" >

          <div style={{ height: 'auto', position: 'relative' }} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400" data-aos-once="true" >
            <ChromaGrid
              items={listProyek}
              onItemClick={handleProjectClick} // Kirim fungsi untuk handle klik
              radius={500}
              damping={0.45}
              fadeOut={0.6}
              ease="power3.out"
            />
          </div>
        </div>
        </section>
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
            <a
              href="mailto:julianarwansahh@gmail.com"
              className="contact-card flex flex-col gap-2 items-center text-center bg-zinc-950 border-3 border-black rounded-lg p-4 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all"
            >
              <FiMail size={20} className="text-[#00e5ff]" aria-hidden="true" />
              <span className="font-bold text-white text-sm break-all">julianarwansahh@gmail.com</span>
            </a>
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
          <div className="w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden bg-zinc-950 p-2" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400" data-aos-once="true">
            <Suspense
              fallback={
                <div className="h-[28rem] flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-wider">
                  Loading chat…
                </div>
              }
            >
              <ChatRoom />
            </Suspense>
          </div>
        </section>
      </main >
      <Footer />
      </div>
    </>
  )
}

export default App
