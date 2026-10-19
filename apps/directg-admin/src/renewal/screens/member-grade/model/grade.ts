import type { GradeBenefitKind, MemberGrade } from "@/renewal/entities/member-grade";

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

// 구매 총액 범위 표기: "0원 이상 ~ 5,000원 미만" / "200,000원 이상 ~ 상한 없음"
export const formatAmountRange = (grade: MemberGrade) =>
  `${won(grade.min_amount)} 이상 ~ ${grade.max_amount === null ? "상한 없음" : `${won(grade.max_amount)} 미만`}`;

export const BENEFIT_TONE = {
  point: "success",
  coupon: "info",
  discount: "warning",
} as const satisfies Record<GradeBenefitKind, string>;

// 기획 공지(Figma notice): 첫 줄은 강조(빨강), 둘째 줄은 보조 색
export const NOTICES = [
  {
    text: "•  등급 추가, 등급 수정, 혜택 등 등급 관련 정보가 변경될 경우 다음 산정일부터 적용됩니다.",
    emphasis: true,
  },
  { text: "•  등급 산정일 기준 최근 6개월의 구매 총액으로 등급이 결정됩니다.", emphasis: false },
];
