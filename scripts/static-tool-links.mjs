import { readFile } from "node:fs/promises";

// Link synchronizers own supplemental navigation. Keep their additions when a
// tool template is regenerated, while letting the template update its own links.
export function preserveSupplementalToolLinks(generated, existing) {
  const navPattern = /<nav class="landing-links"[^>]*>[\s\S]*?<\/nav>/;
  const previousNav = existing.match(navPattern)?.[0];
  const nextNav = generated.match(navPattern)?.[0];
  if (previousNav && nextNav) {
    let navigation = nextNav;
    const append = (content) => {
      navigation = navigation.replace(/\s*<\/nav>$/, `\n          ${content}\n        </nav>`);
    };
    const markerPattern = /<!-- ([\w-]+):start -->[\s\S]*?<!-- \1:end -->/g;
    const unmarked = previousNav.replace(markerPattern, (block) => {
      const hrefs = [...block.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
      if (hrefs.some((href) => !navigation.includes(`href="${href}"`))) {
        // Keep synchronized groups together. If the template now owns one
        // member, retain its updated label without duplicating that link.
        const merged = block.replace(/<a\b[^>]*\bhref="([^"]+)"[^>]*>[\s\S]*?<\/a>/g, (anchor, href) => {
          const current = [...navigation.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)].find((match) => match[1] === href);
          if (!current) return anchor;
          navigation = navigation.replace(current[0], "");
          return current[0];
        });
        append(merged);
      }
      return "";
    });
    for (const match of unmarked.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)) {
      if (navigation.includes(`href="${match[1]}"`)) continue;
      append(match[0]);
    }
    generated = generated.replace(navPattern, navigation);
  }
  const guidePattern = /<!-- blog-guide-links:start -->[\s\S]*?<!-- blog-guide-links:end -->/;
  const guide = existing.match(guidePattern)?.[0];
  if (guide && !guidePattern.test(generated)) generated = generated.replace(/^[ \t]*<\/main>/m, `      ${guide}\n    </main>`);
  return generated;
}

export async function preserveToolLinks(generated, destination) {
  try {
    return preserveSupplementalToolLinks(generated, await readFile(destination, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return generated;
  }
}
