/**
 * 기획배너 고정형 노출 구간 (legacy 하드코딩: 2026-06-25 16:00 ~ 2026-07-09 16:00).
 * 서버 컴포넌트(screen)에서 게이트 판정에 호출하므로 "use client" 경계 밖(순수 모듈)에 둔다.
 */
export const isPlanningBannerOpen = (now: Date) =>
  now >= new Date("2026-06-25T16:00:00") && now < new Date("2026-07-09T16:00:00");
