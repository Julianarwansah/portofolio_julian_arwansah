import { listProyek } from "../data";

if (import.meta.env.DEV) {
  const slugs = listProyek.map((project) => project.slug);
  const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate project slugs in data.js: ${duplicates.join(", ")}`);
  }
}

export function getProjectBySlug(slug) {
  return listProyek.find((project) => project.slug === slug);
}

// data.js is ordered newest first, and that order doubles as the display order.
const CATEGORY_ORDER = ["Web App", "Company Profile", "E-Commerce", "Dashboard", "Mobile App", "Marketplace"];
const categoriesInUse = [...new Set(listProyek.map((project) => project.category).filter(Boolean))];

export const projectCategories = [
  ...CATEGORY_ORDER.filter((category) => categoriesInUse.includes(category)),
  ...categoriesInUse.filter((category) => !CATEGORY_ORDER.includes(category)),
];

export function filterProjects({ category = "all", query = "" } = {}) {
  const needle = query.trim().toLowerCase();

  return listProyek.filter((project) => {
    if (category !== "all" && project.category !== category) return false;
    if (!needle) return true;

    return [
      project.title,
      project.subtitle,
      project.category,
      project.role,
      project.fullDescription,
      ...(project.stack ?? []),
      ...(project.highlights ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export function getRelatedProjects(project, limit = 3) {
  const stack = project.stack ?? [];

  return listProyek
    .filter((candidate) => candidate.slug !== project.slug)
    .map((candidate) => ({
      project: candidate,
      score:
        stack.filter((tech) => (candidate.stack ?? []).includes(tech)).length * 2 +
        (candidate.category === project.category ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.project);
}

export function getAdjacentProjects(slug) {
  const index = listProyek.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return { prev: listProyek[index - 1] ?? null, next: listProyek[index + 1] ?? null };
}
