import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/** Adds `is-visible` to any [data-reveal] element when it scrolls into view. */
export function useScrollReveal() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [path]);
}
