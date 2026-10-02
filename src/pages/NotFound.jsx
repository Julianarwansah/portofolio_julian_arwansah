import { Link } from "react-router-dom";
import { FiHome, FiArrowRight } from "react-icons/fi";
import { usePageMeta } from "../lib/meta";
import { useTheme } from "../lib/theme";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollProgress from "../components/ScrollProgress";
import CreativeCursor from "../components/CreativeCursor";

export default function NotFound() {
  const { theme, toggleTheme } = useTheme();

  usePageMeta(
    "Page not found — Julian Arwansah",
    "The page you are looking for does not exist. Head back to the portfolio to see projects, experience and skills."
  );

  return (
    <>
      <ScrollProgress />
      <CreativeCursor />
      <div className="container mx-auto px-4 sm:px-6">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">
          <span className="neo-badge bg-[#ff007f] text-white border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 mb-8 text-sm">
            WRONG TURN
          </span>
          <p className="notfound-code text-[6.5rem] sm:text-[10rem] font-black leading-none text-[#ffe600] select-none" aria-hidden="true">
            404
          </p>
          <h1 className="notfound-title text-3xl sm:text-4xl font-black text-white mt-6 mb-4">
            This page does not exist.
          </h1>
          <p className="notfound-desc text-zinc-400 font-bold max-w-md leading-relaxed mb-10">
            The link may be broken, or the page may have moved. Everything still lives on the home page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="neo-btn-yellow p-4 px-6 rounded-md text-base inline-flex items-center gap-2">
              <FiHome aria-hidden="true" /> Back to home
            </Link>
            <Link
              to="/"
              state={{ scrollTo: "project" }}
              className="neo-btn-cyan p-4 px-6 rounded-md text-base inline-flex items-center gap-2"
            >
              Browse projects <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
