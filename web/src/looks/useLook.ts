/* The look the page is showing now, kept in step with <html data-look> (set by looks.ts), so a change anywhere
   re-renders whatever reads it. */
import { useEffect, useState } from "react";
import { currentLook, type LookId } from "./looks";

function read(): LookId {
  const l = typeof document !== "undefined" ? document.documentElement.dataset.look : undefined;
  return (l as LookId | undefined) ?? currentLook();
}

export function useLook(): LookId {
  const [look, setLook] = useState<LookId>(read);
  useEffect(() => {
    if (typeof MutationObserver !== "function") return;
    const mo = new MutationObserver(() => setLook(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-look"] });
    return () => mo.disconnect();
  }, []);
  return look;
}
