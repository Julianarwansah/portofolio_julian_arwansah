import Dock from "./Dock/Dock";
import { VscHome, VscArchive, VscAccount } from "react-icons/vsc";
import { RiGithubFill, RiInstagramFill } from "react-icons/ri";
import { FiMail, FiPhone } from "react-icons/fi";
import { scrollToId } from "../lib/scroll";

const Footer = () => {
  const items = [
    { icon: <VscHome size={18} />, label: "Home", onClick: () => scrollToId("home") },
    { icon: <VscAccount size={18} />, label: "About Me", onClick: () => scrollToId("about") },
    { icon: <VscArchive size={18} />, label: "Project", onClick: () => scrollToId("project") },
  ];

  return (
    <footer className="site-footer mt-32 pb-12 flex flex-col items-center relative z-10 border-t-3 border-black pt-12">
      {/* Flex container adaptif */}
      <div className="w-full flex flex-col md:flex-row items-center md:justify-between gap-6">
        
        {/* Judul - paling atas di mobile */}
        <p className="text-2.5xl font-black order-1 md:order-none text-white tracking-tighter m-0">
          JULIAN<span className="text-[#ffe600]">.</span>
        </p>

        {/* Ikon Sosmed - di tengah di mobile */}
        <div className="flex gap-4 order-2 md:order-none">
          <a 
            href="https://github.com/Julianarwansah"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile (opens in a new tab)"
            className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#00e5ff] transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center w-10 h-10"
          >
            <RiGithubFill size={20} aria-hidden="true" />
          </a>
          <a 
            href="https://www.instagram.com/iyan_juliann/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram profile (opens in a new tab)"
            className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#ff007f] hover:text-white transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center w-10 h-10"
          >
            <RiInstagramFill size={20} aria-hidden="true" />
          </a>
          <a
            href="mailto:julianarwansahh@gmail.com"
            aria-label="Email Julian Arwansah"
            className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#00e5ff] transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center w-10 h-10"
          >
            <FiMail size={20} aria-hidden="true" />
          </a>
          <a
            href="tel:+6289661770123"
            aria-label="Call Julian Arwansah"
            className="text-black bg-[#ffe600] border-2 border-black p-2 hover:bg-[#00ff66] transition-all rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] cursor-pointer flex items-center justify-center w-10 h-10"
          >
            <FiPhone size={20} aria-hidden="true" />
          </a>
        </div>

        {/* Dock - paling bawah di mobile */}
        <div className="order-3 md:order-none mt-4 md:mt-0 md:mb-0">
          <Dock 
            items={items}
            panelHeight={30}
            baseItemSize={60}
            magnification={100}
          />
        </div>

      </div>
    </footer>
  );
};

export default Footer;
