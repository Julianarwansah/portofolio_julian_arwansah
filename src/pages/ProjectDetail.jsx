import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiExternalLink, FiGithub } from "react-icons/fi";
import { getAdjacentProjects, getProjectBySlug, getRelatedProjects } from "../lib/projects";
import { usePageMeta } from "../lib/meta";
import { useTheme } from "../lib/theme";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollProgress from "../components/ScrollProgress";
import CreativeCursor from "../components/CreativeCursor";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const project = getProjectBySlug(slug);
  const related = project ? getRelatedProjects(project) : [];
  const { prev, next } = getAdjacentProjects(slug);
  const isRepo = (project?.url || "").includes("github.com");

  usePageMeta(
    project ? `${project.title} — Julian Arwansah` : "Project not found — Julian Arwansah",
    project?.fullDescription
  );

  return (
    <>
      <ScrollProgress />
      <CreativeCursor />
      <div className="container mx-auto px-4 sm:px-6">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!project ? (
            <div className="text-center py-20">
              <h1 className="notfound-title text-4xl font-black text-white mb-8">Project not found</h1>
              <Link to="/" className="neo-btn-yellow p-4 px-6 rounded-md text-base inline-flex">
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <article className="project-detail border-4 border-black rounded-xl overflow-hidden bg-zinc-950 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <div className="detail-hero border-b-4 border-black" style={{ background: project.gradient }}>
                  <img src={project.image} alt={`Screenshot of ${project.title}`} decoding="async" />
                </div>

                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {project.year && <span className="detail-meta detail-meta-year">{project.year}</span>}
                    {project.role && <span className="detail-meta detail-meta-role">{project.role}</span>}
                    {project.category && <span className="detail-meta detail-meta-category">{project.category}</span>}
                  </div>

                  <h1 className="detail-title text-4xl md:text-5xl font-black text-white mb-3">{project.title}</h1>
                  <p className="detail-sub text-sm font-mono uppercase tracking-wider text-[#ffe600] mb-6">
                    {project.subtitle}
                  </p>
                  <p className="detail-desc text-zinc-300 text-lg leading-relaxed mb-8">{project.fullDescription}</p>

                  {project.highlights?.length > 0 && (
                    <section className="mb-8" aria-labelledby="highlights-title">
                      <h2 id="highlights-title" className="detail-heading text-sm font-mono uppercase tracking-wider text-[#00e5ff] mb-3">
                        What it does
                      </h2>
                      <ul className="proj-highlights grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                        {project.highlights.map((item) => (
                          <li
                            key={item}
                            className="proj-highlight flex items-start gap-3 bg-zinc-900 border-2 border-black rounded-md p-3 shadow-[2px_2px_0px_#000]"
                          >
                            <FiCheck size={16} className="text-[#00ff66] shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="proj-highlight-text text-sm font-bold text-zinc-200">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {project.stack && (
                    <section className="mb-8" aria-labelledby="stack-title">
                      <h2 id="stack-title" className="detail-heading text-sm font-mono uppercase tracking-wider text-[#00e5ff] mb-3">
                        Tech stack
                      </h2>
                      <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                        {project.stack.map((tech) => (
                          <li key={tech} className="detail-stack-item bg-zinc-900 border-2 border-black px-3 py-1 rounded-md text-sm font-bold text-white shadow-[2px_2px_0px_#000]">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn-cyan p-4 px-6 rounded-md text-base inline-flex items-center gap-2"
                    >
                      {isRepo ? <FiGithub aria-hidden="true" /> : <FiExternalLink aria-hidden="true" />}
                      {isRepo ? "View Source" : "Visit Website"}
                    </a>
                  )}
                </div>
              </article>

              <nav className="proj-pager mt-10 grid gap-4 sm:grid-cols-2" aria-label="Browse other projects">
                {prev ? (
                  <Link to={`/projects/${prev.slug}`} className="proj-pager-link">
                    <span className="proj-pager-dir">
                      <FiArrowLeft aria-hidden="true" /> Newer
                    </span>
                    <span className="proj-pager-name">{prev.title}</span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
                {next ? (
                  <Link to={`/projects/${next.slug}`} className="proj-pager-link proj-pager-next">
                    <span className="proj-pager-dir">
                      Older <FiArrowRight aria-hidden="true" />
                    </span>
                    <span className="proj-pager-name">{next.title}</span>
                  </Link>
                ) : (
                  <span aria-hidden="true" />
                )}
              </nav>

              <section className="mt-20" aria-labelledby="related-title">
                <h2 id="related-title" className="related-title text-2xl font-black text-white mb-6">
                  Similar work
                </h2>
                <ul className="grid sm:grid-cols-3 gap-6 list-none p-0 m-0">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to={`/projects/${p.slug}`}
                        className="related-card block border-3 border-black rounded-lg overflow-hidden bg-zinc-950 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all"
                      >
                        <img
                          src={p.image}
                          alt=""
                          width={320}
                          height={180}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-[180px] object-cover border-b-3 border-black"
                        />
                        <span className="related-card-title block p-4 font-bold text-white">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
