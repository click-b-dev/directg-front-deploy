// 계정 통합 상세 모달(Figma 30121:9329)이 보여 주는 데이터 계약.
// 현재 회원 상세 응답(`MemberViewResponse`)에는 통합 정보가 없어 API가 추가되어야 한다.
// (docs/renewal/AD-Member-Detail-Modals.md 참조)
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
