import { createFileRoute } from "@tanstack/react-router";
import { MemberDirectSendLogScreen } from "@screens/member-directsend-log";
import type { DirectSendMailLogSearch } from "@entities/member";

// legacy pc/_Admin_/member/directsend_mail_log.php → /member/directsend_mail_log
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberDirectSendLogRoute = () => {
  const search = Route.useSearch();
  return <MemberDirectSendLogScreen {...search} />;
};

export const Route = createFileRoute("/member/directsend_mail_log")({
  validateSearch: (search: Record<string, unknown>): DirectSendMailLogSearch => ({
    page: Number(search.page) || 1,
    gubun: str(search.gubun),
    failed: str(search.failed),
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: MemberDirectSendLogRoute,
});
