import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const Navbar = ({ hidden = false, theme = "dark", onToggleTheme }) => {
  // ⛔ Saat hidden, jangan render apa pun
  if (hidden) return null;

  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => setActive(window.scrollY > 150);
    handleScroll(); // init posisi saat mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="navbar relative z-50 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-12 border-b-3 border-black bg-[#0d0d11]/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="logo flex items-center gap-2 select-none">
        <h1 className="text-3xl font-black text-white tracking-tighter">
          JULIAN<span className="text-[#ffe600]">.</span>
        </h1>
        <span className="neo-badge text-xs px-2 py-0.5 rounded-none font-bold bg-[#00e5ff] text-black border border-black shadow-[2px_2px_0px_#000]">
          DEV
        </span>
      </div>

      {/* Right Side Control Wrapper */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#ff007f] hover:text-white transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center z-50"
          aria-label="Toggle Theme"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        {/* Menu */}
        <ul
          className={`flex items-center sm:gap-6 gap-2 
            md:static fixed left-1/2 -translate-x-1/2 md:translate-x-0 
            bg-zinc-950 border-3 border-black shadow-[4px_4px_0px_#00e5ff]
            p-2 px-4 rounded-md z-50
            transition-all md:transition-none
            ${active ? "top-4 opacity-100" : "md:top-auto md:opacity-100 -top-20 opacity-0"}`}
        >
          <li>
            <a
              href="#home"
              className="block px-3 py-1.5 sm:text-base text-sm font-bold text-zinc-300 hover:text-black hover:bg-[#ffe600] border-2 border-transparent hover:border-black rounded-sm transition-all"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="block px-3 py-1.5 sm:text-base text-sm font-bold text-zinc-300 hover:text-black hover:bg-[#ff007f] border-2 border-transparent hover:border-black rounded-sm transition-all"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#project"
              className="block px-3 py-1.5 sm:text-base text-sm font-bold text-zinc-300 hover:text-black hover:bg-[#00ff66] border-2 border-transparent hover:border-black rounded-sm transition-all"
            >
              Project
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="block px-3 py-1.5 sm:text-base text-sm font-bold text-zinc-300 hover:text-black hover:bg-[#00e5ff] border-2 border-transparent hover:border-black rounded-sm transition-all"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

