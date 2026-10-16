import type { Metadata, Viewport } from "next";

import { MemberJoinStep3Screen } from "@screens/member-join-step3";

/** legacy `pc/member/join_step3.html` head. title="정보입력", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "정보입력",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy join_step3.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

export default async function MemberJoinStep3Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const isPrivate = first(sp.is_private);
  const isAgreement = first(sp.is_agreement);

  // legacy 직접접근 가드: 둘 다 Y가 아니면 "잘못된 접근입니다."만 출력.
  if (isPrivate !== "Y" && isAgreement !== "Y") {
    return <>잘못된 접근입니다.</>;
  }

  return <MemberJoinStep3Screen isMailling={first(sp.is_mailling)} isEvent={first(sp.is_event)} />;
}
