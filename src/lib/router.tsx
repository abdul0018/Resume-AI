import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

/** A tiny History-API router — enough for a handful of routes without a dependency. */

interface Location {
  path: string;
  search: URLSearchParams;
  hash: string;
}

const read = (): Location => ({
  path: window.location.pathname.replace(/\/+$/, "") || "/",
  search: new URLSearchParams(window.location.search),
  hash: window.location.hash,
});

const RouterContext = createContext<Location | null>(null);

export function navigate(to: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.href = to;
    return;
  }
  window.history[opts.replace ? "replaceState" : "pushState"]({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (opts.scroll !== false) {
    if (url.hash) {
      requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" }));
    } else {
      window.scrollTo({ top: 0 });
    }
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const onPop = () => setLoc(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return <RouterContext.Provider value={loc}>{children}</RouterContext.Provider>;
}

export function useLocation() {
  const loc = useContext(RouterContext);
  if (!loc) throw new Error("useLocation outside RouterProvider");
  return loc;
}

/** Matches "/i/:slug" style patterns; returns params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split("/").filter(Boolean);
  const s = path.split("/").filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || rest.target === "_blank") return;
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    const url = new URL(href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState({}, "", url);
      return;
    }
    navigate(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
