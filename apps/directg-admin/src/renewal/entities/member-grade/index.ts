import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/api/client";

// 회원 등급 설정 (Figma 회원_회원등급설정). legacy에 없는 신규 API 계약이다
// — docs/renewal/AD-Member-Grade.md 참조.
export type GradeBenefitKind = "point" | "coupon" | "discount";

export type GradeBenefit = {
  kind: GradeBenefitKind;
  /** 태그 문구(예: 포인트 적립, 할인쿠폰 지급, 상시 할인) */
  label: string;
  /** 혜택 설명 */
  description: string;
  /** 보조 설명(예: 최소 주문 금액 | 최대 할인 금액) */
  detail?: string;
};

export type MemberGrade = {
  id: string;
  /** 등급 순위(No). 1이 최상위 등급이다 */
  rank: number;
  name: string;
  /** 구매 총액 하한(이상) */
  min_amount: number;
  /** 구매 총액 상한(미만). null이면 상한 없음 */
  max_amount: number | null;
  benefits: GradeBenefit[];
};

export type MemberGradeListResponse = {
  items: MemberGrade[];
  /** 다음 등급 산정일(YYYY-MM-DD) */
  next_calc_date: string;
};

const GRADE_KEY = ["admin", "member", "grades"] as const;

export const fetchMemberGrades = () =>
  apiClient.get<MemberGradeListResponse>("/admin/member/grades");

export const deleteMemberGrade = (id: string) =>
  apiClient.post<{ success: boolean }>("/admin/member/grades/delete", { id });

export const useMemberGrades = () => useQuery({ queryKey: GRADE_KEY, queryFn: fetchMemberGrades });

export const useDeleteMemberGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMemberGrade(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GRADE_KEY }),
  });
};
