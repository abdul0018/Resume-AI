import { useCallback, useEffect, useRef, useState } from "react";
import { BUILTIN_MUSIC } from "@shared/constants";

/** Adds `.is-visible` to `.reveal` descendants as they scroll into view. */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export function musicSrc(music: string) {
  if (!music || music === "none") return null;
  // Self-contained builds (the showcase) embed the tracks and register them here.
  const embedded = (window as { __VISOL_MUSIC__?: Record<string, string> }).__VISOL_MUSIC__?.[music];
  if (embedded) return embedded;
  if (music in BUILTIN_MUSIC) return `/music/${music}.mp3`;
  return music.startsWith("/uploads/") ? music : null;
}

/** Background music that starts inside the opening tap (required by iOS autoplay rules). */
export function useMusic(music: string) {
  const src = musicSrc(music);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!src) return;
    const a = new Audio();
    a.src = src;
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    audioRef.current = a;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    const onHide = () => document.hidden && a.pause();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      a.pause();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onHide);
      audioRef.current = null;
      setPlaying(false);
    };
  }, [src]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play()
      .then(() => {
        // gentle fade-in
        let v = 0;
        const id = window.setInterval(() => {
          v = Math.min(0.55, v + 0.04);
          a.volume = v;
          if (v >= 0.55) window.clearInterval(id);
        }, 120);
      })
      .catch(() => setPlaying(false));
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.volume = 0.55;
      void a.play().catch(() => undefined);
    } else a.pause();
  }, []);

  return { available: !!src, playing, play, toggle };
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    fn().then(
      (data) => setState({ data, loading: false }),
      (error: Error) => setState({ error, loading: false }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload]);
  return { ...state, reload, setData: (data: T) => setState({ data, loading: false }) };
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? ({ ...initial, ...JSON.parse(raw) } as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable (private mode) */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [key, value]);
  return [value, setValue] as const;
}
