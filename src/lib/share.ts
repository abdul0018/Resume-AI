export function absoluteUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

export const shareLinks = {
  telegram: (url: string, text: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  whatsapp: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
};

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for in-app browsers without clipboard permission
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/** Native share sheet (Instagram Direct, Telegram, etc.); false if unsupported. */
export async function nativeShare(url: string, title: string, text: string) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ url, title, text });
    return true;
  } catch {
    return true; // user cancelled — still handled
  }
}
