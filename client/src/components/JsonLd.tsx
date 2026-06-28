import { useEffect } from "react";

interface JsonLdProps {
  id: string;
  data: Record<string, unknown>;
}

/**
 * Injects a JSON-LD <script> tag into the document head.
 * The `id` prop ensures the tag is unique and can be updated/removed on route change.
 */
export default function JsonLd({ id, data }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = scriptId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      const toRemove = document.getElementById(scriptId);
      if (toRemove) toRemove.remove();
    };
  }, [id, data]);

  return null;
}
