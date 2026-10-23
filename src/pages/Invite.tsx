import { useEffect } from "react";
import { EVENT_TYPES } from "@shared/constants";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";
import { ErrorState, PageLoader, useConfig } from "@/components/ui/Site";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";

export default function Invite({ slug }: { slug: string }) {
  const config = useConfig();
  const { data, error, loading } = useAsync(() => api.invite(slug), [slug]);
  const invite = data?.invite;

  useEffect(() => {
    if (invite) document.title = `${invite.data.groom} & ${invite.data.bride} — ${EVENT_TYPES[invite.data.eventType]}`;
  }, [invite]);

  if (loading && !invite) return <PageLoader />;
  if (error || !invite)
    return <ErrorState title="Taklifnoma topilmadi" text="Havola noto‘g‘ri yoki taklifnoma o‘chirilgan bo‘lishi mumkin." />;

  return (
    <InvitationExperience
      template={invite.template}
      data={invite.data}
      pkg={invite.package}
      slug={invite.slug}
      status={invite.status}
      mode="live"
      brandName={config?.brandName}
    />
  );
}
