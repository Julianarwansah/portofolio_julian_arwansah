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
