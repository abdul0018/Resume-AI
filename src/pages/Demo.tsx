import { useEffect } from "react";
import { TEMPLATE_IDS, type TemplateId } from "@shared/constants";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";
import { useConfig } from "@/components/ui/Site";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/Icons";
import { Link } from "@/lib/router";
import { SAMPLE_DATA } from "@/lib/invite";
import NotFound from "./NotFound";

/** Full-screen live sample of a template, with a floating "make mine" call to action. */
export default function Demo({ template }: { template: string }) {
  const config = useConfig();
  const valid = (TEMPLATE_IDS as readonly string[]).includes(template);
  const name = config?.templates.find((t) => t.id === template)?.name;

  useEffect(() => {
    if (valid) document.title = `${name ?? "Namuna"} — jonli namuna`;
  }, [valid, name]);

  if (!valid) return <NotFound />;
  return (
    <>
      <InvitationExperience
        key={template}
        template={template as TemplateId}
        data={{ ...SAMPLE_DATA, photos: [] }}
        mode="demo"
        brandName={config?.brandName}
        bottomInset={76}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Link
          href="/#shablonlar"
          className="btn btn-light btn-sm pointer-events-auto !min-h-[48px] !px-4 backdrop-blur"
          aria-label="Barcha shablonlar"
        >
          <IconArrowLeft size={18} />
        </Link>
        <Link href={`/yaratish?t=${template}`} className="btn btn-dark pointer-events-auto flex-1 sm:flex-none">
          Shu shablonda yaratish <IconArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
