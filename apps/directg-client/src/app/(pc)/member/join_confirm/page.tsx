import { redirect } from "next/navigation";

import { postMemberJoinConfirm } from "@entities/member-auth";

// legacy join_confirm.php는 HTML 문서가 아님(bare text + redirect) — metadata/viewport 없음.

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

/**
 * 이메일 인증 랜딩 (legacy `pc/member/join_confirm.php`).
 * 검증·승인은 백엔드. 성공 → `/member/login.html` redirect(legacy header intent), 실패 → bare text.
 */
export default async function MemberJoinConfirmPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  let approved = false;
  try {
    const data = await postMemberJoinConfirm({
      m_no: first(sp.m_no),
      auth_key: first(sp.auth_key),
      m_id: first(sp.m_id),
    });
    approved = data.error_code === "0";
  } catch {
    approved = false;
  }

  if (approved) {
    redirect("/member/login");
  }

  return <>잘못된 페이지 접근입니다.</>;
}
