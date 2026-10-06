import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArrowRight,
  FiCopy,
  FiDownload,
  FiFileText,
  FiGithub,
  FiInstagram,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { useTheme } from "../../lib/theme";
import { scrollToId } from "../../lib/scroll";
import { SECTIONS } from "../../lib/sections";
import { filterProjects } from "../../lib/projects";
import { listProyek, listSertifikat } from "../../data";
import { CV_FILENAME, CV_PATH, EMAIL, GITHUB_URL, INSTAGRAM_URL } from "../../lib/contact";
import { onOpenCommandPalette } from "../../lib/palette";
import "./CommandPalette.css";

// Every section is reachable from any route: on the home page it is a plain
// scroll, elsewhere the palette navigates home first and lets App reveal it.
// The DOM is deliberately not consulted — on a project page no section exists
// yet all of them are one command away. #certificates is the only conditional
// one, and data.js is the source of truth for whether it will render.
const AVAILABLE_SECTIONS = SECTIONS.filter(
  (section) => section.id !== "certificates" || listSertifikat.length > 0
);

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const restoreRef = useRef(null);
  const flashTimer = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  const notify = useCallback((message) => {
    setFlash(message);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(""), 1600);
  }, []);

  const goSection = useCallback(
    (id) => {
      close();
      if (pathname === "/") scrollToId(id);
      else navigate("/", { state: { scrollTo: id } });
    },
    [close, navigate, pathname]
  );

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      notify("Email copied to clipboard");
    } catch {
      notify("Clipboard blocked — copy it manually");
    }
  }, [notify]);

  const downloadCV = useCallback(() => {
    const link = document.createElement("a");
    link.href = CV_PATH;
    link.download = CV_FILENAME;
    link.click();
    close();
  }, [close]);

  const commands = useMemo(() => {
    const sectionCommands = AVAILABLE_SECTIONS.map((section) => ({
      id: `section-${section.id}`,
      group: "Go to",
      label: section.label,
      icon: <FiArrowRight />,
      run: () => goSection(section.id),
    }));

    const openExternal = (url) => () => {
      window.open(url, "_blank", "noopener");
      close();
    };

    const actions = [
      {
        id: "action-theme",
        group: "Actions",
        label: theme === "light" ? "Switch to dark mode" : "Switch to light mode",
        icon: theme === "light" ? <FiMoon /> : <FiSun />,
        run: toggleTheme,
      },
      { id: "action-copy", group: "Actions", label: "Copy email address", icon: <FiCopy />, run: copyEmail },
      { id: "action-cv", group: "Actions", label: "Download CV", icon: <FiDownload />, run: downloadCV },
      { id: "action-github", group: "Actions", label: "Open GitHub", icon: <FiGithub />, run: openExternal(GITHUB_URL) },
      { id: "action-instagram", group: "Actions", label: "Open Instagram", icon: <FiInstagram />, run: openExternal(INSTAGRAM_URL) },
    ];

    return { sections: sectionCommands, actions };
  }, [theme, toggleTheme, copyEmail, downloadCV, goSection, close]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (label) => label.toLowerCase().includes(needle);

    const projects = (needle ? filterProjects({ query: needle }) : listProyek.slice(0, 4)).map(
      (project) => ({
        id: `project-${project.slug}`,
        group: "Projects",
        label: project.title,
        hint: project.category,
        icon: <FiFileText />,
        run: () => {
          close();
          navigate(`/projects/${project.slug}`);
        },
      })
    );

    return [
      ...commands.sections.filter((command) => matches(command.label)),
      ...projects,
      ...commands.actions.filter((command) => matches(command.label)),
    ];
  }, [query, commands, close, navigate]);

  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(results.length - 1, 0)));
  }, [results.length]);

  // Capture phase + stopImmediatePropagation: the Konami listener and the
  // Navbar's Escape listener sit on window too, and both would otherwise see
  // the palette's arrow and escape keys.
  useEffect(() => {
    const onKeyDown = (event) => {
      const isToggle = (event.metaKey || event.ctrlKey) && (event.code === "KeyK" || event.key.toLowerCase() === "k");
      if (isToggle) {
        if (event.repeat) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen((wasOpen) => !wasOpen);
        return;
      }
      if (!open) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          event.stopImmediatePropagation();
          close();
          break;
        case "ArrowDown":
          event.preventDefault();
          event.stopImmediatePropagation();
          setActive((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          event.stopImmediatePropagation();
          setActive((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          event.stopImmediatePropagation();
          results[active]?.run();
          break;
        case "Tab":
          // aria-activedescendant keeps focus in the input, so Tab must not
          // escape into the page behind the dialog.
          event.preventDefault();
          event.stopImmediatePropagation();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, results, active, close]);

  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement;
      setQuery("");
      setActive(0);
      setFlash("");
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
    const previous = restoreRef.current;
    restoreRef.current = null;
    // The opener may be gone by now: opening from a project card and choosing
    // "Go to Contact" unmounts that card before focus can return to it.
    if (previous && document.contains(previous)) previous.focus();
  }, [open]);

  useEffect(() => onOpenCommandPalette(() => setOpen(true)), []);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`cmdk-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="cmdk-backdrop" onClick={close}>
          <motion.div
            className="cmdk-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <input
              ref={inputRef}
              className="cmdk-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmdk-listbox"
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `cmdk-opt-${active}` : undefined}
              aria-label="Search sections, projects and actions"
              placeholder="Jump to a section, project or action…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ul id="cmdk-listbox" className="cmdk-list" role="listbox" aria-label="Commands">
              <AnimatePresence initial={false}>
                {results.map((result, index) => (
                  <motion.li
                    layout
                    key={result.id}
                    id={`cmdk-opt-${index}`}
                    role="option"
                    aria-selected={index === active}
                    className="cmdk-option"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => result.run()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <span className="cmdk-option-icon" aria-hidden="true">
                      {result.icon}
                    </span>
                    <span className="cmdk-option-label">{result.label}</span>
                    <span className="cmdk-option-group">{result.hint ?? result.group}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {results.length === 0 && (
                <li className="cmdk-empty" role="presentation">
                  Nothing matches “{query}”.
                </li>
              )}
            </ul>
            <p className="cmdk-hints" aria-hidden="true">
              {flash || "↑↓ navigate · ↵ open · esc close"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
