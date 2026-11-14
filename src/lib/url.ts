/**
 * A page's public path. Prerendering with `build.format: "file"` gives pages
 * their output filename as `Astro.url.pathname` ("/cv.html", "/index.html"),
 * while the site serves and links them without the extension ("/cv", "/").
 * Everything that compares or publishes a page's path goes through here:
 * canonical URLs, preview images, structured data, the nav's active link.
 */
export const pagePath = (url: URL): string => url.pathname.replace(/(?:\/?index)?\.html$/, "") || "/";
