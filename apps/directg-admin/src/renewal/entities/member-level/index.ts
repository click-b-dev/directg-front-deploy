// 리뉴얼 화면의 회원 등급 표기. Figma 디자인은 "일반회원 / 정회원 / VIP"를 쓴다
// (기존 legacy 라벨은 "일반 / 정회원 / VIP"). 등급 값(mem_level)은 기존 API 그대로 1/2/3이다.
//
// 기획상 등급 목록은 "회원 등급 설정(AD-Membership-01)"에서 운영자가 정의한 값을 API로 받아야 한다.
// 그 API가 생기기 전까지 이 상수를 임시로 쓴다 — docs/renewal/AD-Member-List-01.md 참조.
export const MEMBER_LEVEL_LABELS: Record<number, string> = {
  1: "일반회원",
  2: "정회원",
  3: "VIP",
};

export const MEMBER_LEVEL_OPTIONS = Object.entries(MEMBER_LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}));
