import { createFileRoute } from "@tanstack/react-router";
import { MemberSnsScreen } from "@screens/member-sns";
import type { MemberSnsListSearch } from "@entities/member";

// legacy pc/_Admin_/member/member_payco_list.php → /member/member_payco_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberPaycoRoute = () => {
  const search = Route.useSearch();
  return <MemberSnsScreen provider="PAYCO" {...search} />;
};

export const Route = createFileRoute("/member/member_payco_list")({
  validateSearch: (search: Record<string, unknown>): MemberSnsListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
    sns_flag: str(search.sns_flag),
  }),
  component: MemberPaycoRoute,
});
