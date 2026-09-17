import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiExternalLink, FiGithub } from "react-icons/fi";
import { getProjectBySlug } from "../lib/projects";
import { listProyek } from "../data";
import { usePageMeta } from "../lib/meta";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  usePageMeta(
    project ? `${project.title} — Julian Arwansah` : "Project not found — Julian Arwansah",
    project?.fullDescription
  );

  if (!project) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black text-white mb-8">Project not found</h1>
        <Link to="/" className="neo-btn-yellow p-4 px-6 rounded-md text-base inline-flex">
          Back to home
        </Link>
      </main>
    );
  }

  const related = listProyek.filter((p) => p.slug !== project.slug).slice(0, 3);
  const isRepo = (project.url || "").includes("github.com");

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-bold text-[#00e5ff] hover:text-white transition-colors mb-10"
      >
        <FiArrowLeft aria-hidden="true" /> Back to home
      </Link>

      <article className="project-detail border-4 border-black rounded-xl overflow-hidden bg-zinc-950 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <div className="detail-hero border-b-4 border-black" style={{ background: project.gradient }}>
          <img src={project.image} alt={`Screenshot of ${project.title}`} decoding="async" />
        </div>

        <div className="p-8 md:p-12">
          <span className="neo-badge bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] py-1 px-3 text-sm mb-4">
            {project.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">{project.title}</h1>
          <p className="text-zinc-300 text-lg leading-relaxed mb-8">{project.fullDescription}</p>

          {project.stack && (
            <div className="mb-8">
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#00e5ff] mb-3">Tech stack</h2>
              <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="bg-zinc-900 border-2 border-black px-3 py-1 rounded-md text-sm font-bold text-white shadow-[2px_2px_0px_#000]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
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

      <section className="mt-20" aria-labelledby="related-title">
        <h2 id="related-title" className="text-2xl font-black text-white mb-6">More projects</h2>
        <ul className="grid sm:grid-cols-3 gap-6 list-none p-0 m-0">
          {related.map((p) => (
            <li key={p.slug}>
              <Link
                to={`/projects/${p.slug}`}
                className="block border-3 border-black rounded-lg overflow-hidden bg-zinc-950 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#ffe600] hover:-translate-y-1 transition-all"
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
                <span className="block p-4 font-bold text-white">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
