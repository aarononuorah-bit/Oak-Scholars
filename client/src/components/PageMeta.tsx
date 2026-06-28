import { useEffect } from "react";

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

const SITE_NAME = "Oak Scholars";
const DEFAULT_TITLE = "Oak Scholars — Expert Tutoring for 11+ to A-Level";
const DEFAULT_DESC =
  "Oak Scholars provides expert 1:1 tutoring for 11+, GCSE, A-Level and IB students. Tutors who recently aced the same exams. Book your first session at 50% off.";
const DEFAULT_IMAGE = "https://oakscholars.co.uk/manus-storage/oak-logo_feb9f1bb.webp";
const SITE_URL = "https://oakscholars.co.uk";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function PageMeta({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
}: PageMetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  useEffect(() => {
    document.title = fullTitle;

    // Standard meta
    setMeta("description", description);

    // Open Graph
    setMeta("og:type", type, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", image, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:site_name", SITE_NAME, "property");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [fullTitle, description, image, canonicalUrl, type]);

  return null;
}
