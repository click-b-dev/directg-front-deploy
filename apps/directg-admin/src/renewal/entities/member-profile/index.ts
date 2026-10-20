import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";

// 회원 상세 > 계정 정보 중 현재 회원 상세 응답(member_view)에 없는 항목 (성별, 소셜 연동, Steam 연동,
// 계정 통합, 정책 동의). legacy에 없는 신규 API 계약이다 — docs/renewal/AD-Member-Detail-Profile.md 참조.
// 값이 없으면 null/빈 배열이며 화면에서는 "-"로 표시한다.

/** 계정 통합 상세 모달이 보여 주는 합쳐진 원본 계정 1건 */
export type MergedAccount = {
  email: string;
  phone: string;
  name: string;
  birthDay: string;
  point: number;
  coupons: number;
  purchases: number;
  level: string;
  social: string;
  joinedAt: string;
};

export type AccountMergeDetail = {
  /** 통합 결과 */
  result: {
    name: string;
    phone: string;
    birthDay: string;
    joinedAt: string;
    coupons: number;
    purchases: number;
    level: string;
    social: string;
    email: string;
    point: number;
    mergedAt: string;
    agreedAt: string;
  };
  /** 통합 상세 — 합쳐진 원본 계정들 */
  sources: MergedAccount[];
};

export type MemberProfile = {
  gender: "남성" | "여성" | null;
  /** 연동된 소셜 계정 이름들(예: ["네이버", "카카오"]) */
  socials: string[];
  /** Steam 연동 여부. null이면 정보 없음 */
  steam_linked: boolean | null;
  /** 계정 통합 이력. 통합하지 않은 회원은 null */
  merge: { merged_at: string; detail: AccountMergeDetail } | null;
  /** 정책 동의 여부. 정보가 없으면 null */
  policies: { terms: boolean; privacy: boolean; marketing: boolean } | null;
};

export const fetchMemberProfile = (m_no: string) =>
  apiClient.get<MemberProfile>("/admin/member/profile", { searchParams: { m_no } });

export const useMemberProfile = (m_no: string) =>
  useQuery({
    queryKey: ["admin", "member", "profile", m_no] as const,
    queryFn: () => fetchMemberProfile(m_no),
    enabled: m_no !== "",
  });
