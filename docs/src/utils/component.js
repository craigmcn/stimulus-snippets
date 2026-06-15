export function parseComponent(entry) {
  const body = entry.body ?? "";
  const slug = entry.id.split("/")[0];
  const nameMatch = body.match(/^#\s+(.+)/m);
  const name = nameMatch ? nameMatch[1].trim() : slug;
  const description =
    body
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#")) ?? "";
  return { slug, name, description };
}
