export function isExperimentPage(html) {
  return /<body\b[^>]*\bdata-experiment-page="[^"]+"/i.test(html);
}

export function experimentMetadataFindings(relativePath, html) {
  const findings = [];
  const expectedCanonical = `https://jianfan.app/${relativePath.replaceAll("\\", "/").replace(/index\.html$/, "")}`;
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i)?.[1] || "";
  if (canonical !== expectedCanonical) findings.push(`canonical must be ${expectedCanonical}`);
  if (!robots.toLowerCase().split(/[\s,]+/).includes("noindex")) findings.push("experiment must declare noindex");
  if (!/<title>[^<]+<\/title>/i.test(html)) findings.push("missing title");
  if (!/<meta\b[^>]*name="description"[^>]*content="[^"]+"/i.test(html)) findings.push("missing description");
  return findings;
}
