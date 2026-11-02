"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/*
  One IntersectionObserver for the whole page instead of one animation runtime
  per revealed element.

  A listing page reveals dozens of elements — 24 product cards, article grids,
  topic cards. Driving each through framer-motion means dozens of observers and
  animation loops on the main thread for what is a two-property transition.
  Elements register here on mount; the observer swaps a class and forgets them.
*/
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-in");
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
  }
  return observer;
}

/*
  Extra props are forwarded to the rendered element.

  They used not to be, which meant `<Reveal as="section" aria-labelledby=…>`
  compiled, rendered, and silently produced a section with no accessible name.
  A wrapper that drops ARIA is worse than no wrapper.
*/
interface RevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Stagger position — each step adds 80ms, capped so long lists stay snappy. */
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "article";
}

/** Fade + slide-up on scroll into view. Reduced motion is handled in CSS. */
export function Reveal({ children, index = 0, className, as = "div", style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Server HTML is fully visible: no JS, slow JS and the first screen never wait on this.
    // Only what is still below the fold at hydration is hidden and then revealed on scroll.
    const io = getObserver();
    if (!io || node.getBoundingClientRect().top < window.innerHeight) return;
    node.classList.add("reveal");
    io.observe(node);
    return () => io.unobserve(node);
  }, []);

  const Component = as as ElementType;

  return (
    <Component
      ref={ref}
      className={className}
      style={{ ...style, "--reveal-delay": `${Math.min(index, 6) * 80}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Component>
  );
}
