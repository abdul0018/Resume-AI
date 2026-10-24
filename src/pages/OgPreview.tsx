import { TEMPLATE_IDS, type TemplateId } from "@shared/constants";
import { Artwork } from "@/components/invitation/Artwork";
import { Gatefold } from "@/components/invitation/Gatefold";
import { getTheme, themeVars } from "@/lib/themes";
import "@/components/invitation/gatefold.css";

/** Development-only canvas (1200×630) used to render social preview images into public/og. */
export default function OgPreview({ id }: { id: string }) {
  const template = ((TEMPLATE_IDS as readonly string[]).includes(id) ? id : "rishton") as TemplateId;
  const home = id === "home";
  const theme = getTheme(template);
  const data = { groom: "", bride: "", date: "", time: "", venue: "", eventType: "nikoh" as const, bismillah: false };
  const bg = home ? "#f4efe6" : theme.page.bg;
  return (
    <div
      id="og"
      style={{
        ...themeVars(theme),
        width: 1200,
        height: 630,
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(70% 90% at 62% 45%, ${theme.dark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.85)"}, transparent 70%), ${bg}`,
        display: "flex",
        alignItems: "center",
      }}
    >
      {home && (
        <div style={{ position: "absolute", left: 90, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", width: 520 }}>
          <div className="eyebrow" style={{ fontSize: 15 }}>Raqamli to‘y taklifnomalari</div>
          <div className="font-serif" style={{ fontSize: 78, lineHeight: 1.02, marginTop: 22, fontWeight: 500 }}>
            Qo‘lda <em style={{ color: "#b08d45" }}>ochiladigan</em> taklifnoma
          </div>
          <div className="font-serif" style={{ fontSize: 34, marginTop: 28, fontStyle: "italic", color: "#3b3a37" }}>Visol</div>
        </div>
      )}
      <div style={{ position: "absolute", left: home ? 640 : 330, top: 52, transform: "rotate(-5deg)" }}>
        <Gatefold template={template} data={data} width={330} state="closed" interactive={false} frontTitle="Taklifnoma" />
      </div>
      {!home && (
        <div
          style={{
            position: "absolute",
            left: 630,
            top: 86,
            width: 300,
            height: 450,
            transform: "rotate(6deg)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,.4)",
            background: "var(--in-bg)",
            overflow: "hidden",
          }}
        >
          <Artwork template={template} className="absolute inset-0 h-full w-full" />
          <div
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--in-ink)" }}
          >
            <div style={{ fontFamily: "Manrope", fontSize: 11, letterSpacing: "0.34em", color: "var(--in-accent)", fontWeight: 600 }}>SIZNI TAKLIF ETAMIZ</div>
            <div className="font-script" style={{ fontSize: 46, marginTop: 10 }}>
              To‘yimizga
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
