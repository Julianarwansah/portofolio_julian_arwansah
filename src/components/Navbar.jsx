import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { scrollToId } from "../lib/scroll";

const LINKS = [
  { id: "home", label: "Home", hover: "hover:bg-[#ffe600]" },
  { id: "about", label: "About", hover: "hover:bg-[#ff007f]" },
  { id: "experience", label: "Experience", hover: "hover:bg-[#00e5ff]" },
  { id: "project", label: "Project", hover: "hover:bg-[#00ff66]" },
  { id: "contact", label: "Contact", hover: "hover:bg-[#00e5ff]" },
];

const Navbar = ({ theme = "dark", onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <nav className="navbar relative z-50 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-12 border-b-3 border-black bg-[#0d0d11]/80 backdrop-blur-sm">
      <div className="logo flex items-center gap-2 select-none">
        <p className="text-3xl font-black text-white tracking-tighter m-0">
          JULIAN<span className="text-[#ffe600]">.</span>
        </p>
        <span className="neo-badge text-xs px-2 py-0.5 rounded-none font-bold bg-[#00e5ff] text-black border border-black shadow-[2px_2px_0px_#000]">
          DEV
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTheme}
          className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#ff007f] hover:text-white transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center z-50"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-pressed={theme === "light"}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden text-black bg-[#00e5ff] border-2 border-black p-2 rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center z-50"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>

        <ul
          id="primary-nav"
          className={`flex items-center sm:gap-6 gap-2
            md:static md:visible md:opacity-100 md:pointer-events-auto md:translate-x-0 md:top-auto
            fixed left-1/2 -translate-x-1/2
            bg-zinc-950 border-3 border-black shadow-[4px_4px_0px_#00e5ff]
            p-2 px-4 rounded-md z-50
            transition-all md:transition-none
            ${menuOpen
              ? "top-4 opacity-100 visible pointer-events-auto"
              : "-top-20 opacity-0 invisible pointer-events-none"}`}
        >
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(e) => go(e, link.id)}
                className={`block px-3 py-1.5 sm:text-base text-sm font-bold text-zinc-300 hover:text-black ${link.hover} border-2 border-transparent hover:border-black rounded-sm transition-all`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
