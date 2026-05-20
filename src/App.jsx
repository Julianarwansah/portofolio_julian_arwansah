import { useRef, useState, useEffect } from "react";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import ShinyText from "./components/ShinyText/ShinyText";
import BlurText from "./components/BlurText/BlurText";
import ScrambledText from "./components/ScrambledText/ScrambledText";
import SplitText from "./components/SplitText/SplitText";
import Lanyard from "./components/Lanyard/Lanyard";
import GlassIcons from "./components/GlassIcons/GlassIcons";
import { listTools, listProyek } from "./data";
import ChromaGrid from "./components/ChromaGrid/ChromaGrid";
import ProjectModal from "./components/ProjectModal/ProjectModal";
import Aurora from "./components/Aurora/Aurora";
import AOS from 'aos';
import ChatRoom from "./components/ChatRoom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PreLoader from "./components/PreLoader";
import 'aos/dist/aos.css'; 

AOS.init();

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const aboutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null); // null = modal tertutup

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };
  // -------------------------

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PreLoader />
      <div className="container mx-auto px-6">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="hero grid md:grid-cols-2 items-center pt-16 xl:gap-0 gap-8 grid-cols-1">
          <div className="animate__animated animate__fadeInUp animate__delay-1s">
            <div className="flex items-center gap-3 mb-6 bg-zinc-950 w-fit p-4 border-3 border-black neo-shadow-yellow rounded-md">
              <img src="./assets/cardjul.png" className="w-10 h-10 border-2 border-black rounded-sm" />
              <q className="font-bold text-zinc-100 text-sm sm:text-base">Building smarter solutions with IT and AI</q>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 text-white leading-none tracking-tight">
              Hi I'm <br className="sm:hidden" />
              <span className="bg-[#ffe600] text-black px-4 py-1 border-3 border-black inline-block transform -rotate-1 select-none my-2 neo-shadow-black">
                Julian Arwansah
              </span>
            </h1>
            <BlurText
              text="I’m a 5th-semester Informatics Engineering student specializing in Software Engineering, passionate about back-end development with PHP and Laravel, and aspiring to become a skilled Full-Stack Developer."
              delay={100}
              animateBy="words"
              direction="top"
              className="mb-8 text-zinc-400 text-lg leading-relaxed font-medium block"
            />
            <div className="flex items-center sm:gap-6 gap-3 flex-wrap">
              <a
                href="./assets/CV.pdf"
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
          <div className="md:ml-auto animate__animated animate__fadeInUp animate__delay-2s">
            <ProfileCard
              name="Julian"
              title="Software Developer"
              handle="iyan_julian"
              status="Online"
              contactText="Contact Me"
              avatarUrl="./assets/ftjul.png"
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => console.log('Contact clicked')}
            />
          </div>
        </div>
        {/* tentang */}
        <div className="mt-20 mx-auto w-full max-w-[1600px] rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-zinc-950 p-8" id="about">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-0 px-4 md:px-8" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
            <div className="basis-full md:basis-7/12 pr-0 md:pr-12 border-b-3 md:border-b-0 md:border-r-3 border-black pb-8 md:pb-0">
              {/* Kolom kiri */}
              <div className="flex-1 text-left">
                <h2 className="text-3.5xl md:text-4.5xl font-black text-white mb-6 flex flex-wrap items-center gap-3">
                  <span className="neo-badge bg-[#ff007f] text-white py-1 px-3 border-2 border-black rounded-sm shadow-[2.5px_2.5px_0px_#000] text-xs sm:text-sm">
                    WHO AM I?
                  </span>
                  About Me
                </h2>

                <BlurText
                  text="I’m a 5th-semester undergraduate student majoring in Informatics Engineering, specializing in Software Engineering. I am passionate about back-end development and currently focusing on building efficient, scalable, and secure server-side applications. With a strong foundation in PHP and Laravel, I’m on a journey to become a proficient Full-Stack Developer by continuously learning and exploring front-end technologies as well."
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
              <Lanyard position={[0, 0, 15]} gravity={[0, -40, 0]} />
            </div>
          </div>

        </div>
        <div className="tools mt-32">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 flex flex-wrap items-center gap-3" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true" >
            <span className="neo-badge bg-[#00ff66] text-black border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 text-sm">
              SKILLS
            </span>
            Tools & Technologies
          </h1>
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
                  alt="Tools Image"
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
        </div>
        {/* tentang */}

        {/* Proyek */}
        <div className="proyek mt-32" id="project"></div>
        <div className="flex flex-col items-center text-center mt-10" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
          <span className="neo-badge bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 mb-4 text-sm">
            MY WORK
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-white">Featured Projects</h1>
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
        {/* Proyek */}


        {/* Kontak */}
        <div className="kontak mt-32 flex flex-col items-center" id="contact" data-aos="fade-up" data-aos-duration="1000" data-aos-once="true">
          <span className="neo-badge bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 mb-4 text-sm">
            TALK TO ME
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-white text-center">Contact & Chat</h1>
          <p className="text-zinc-400 font-bold text-center max-w-lg leading-relaxed mb-10">
            Get in touch with me or chat in real-time with other visitors!
          </p>

          {/* Chat Room */}
          <div className="w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden bg-zinc-950 p-2" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400" data-aos-once="true">
            <ChatRoom />
          </div>
        </div>
      </main >
      <Footer />
      </div>

      <ProjectModal
        isOpen={!!selectedProject}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </>
  )
}

export default App
