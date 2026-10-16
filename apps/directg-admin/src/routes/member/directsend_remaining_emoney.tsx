import { createFileRoute } from "@tanstack/react-router";
import { MemberDirectSendRemainingScreen } from "@screens/member-directsend-remaining";

// legacy pc/_Admin_/member/directsend_remaining_emoney.php → /member/directsend_remaining_emoney
export const Route = createFileRoute("/member/directsend_remaining_emoney")({
  component: MemberDirectSendRemainingScreen,
});
