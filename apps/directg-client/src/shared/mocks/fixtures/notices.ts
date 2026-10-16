import type { Notice } from "@entities/notice";

/**
 * 개발용 fixture — 백엔드(`GET /api/main/notices`) 준비 전 SSR 주입.
 * legacy `getNoticeMain(5)` 응답 형태 재현.
 */
export const noticesFixture: Notice[] = [
  {
    idx: 501,
    subject: "추석 연휴 고객센터 운영 안내",
    notice_type: "일반",
    deploy_date: "2026-08-28 10:00:00",
  },
  {
    idx: 500,
    subject: "8월 결제 시스템 정기 점검 안내",
    notice_type: "일반",
    deploy_date: "2026-08-20 09:30:00",
  },
  {
    idx: 498,
    subject: "일부 타이틀 가격 조정 안내",
    notice_type: "일반",
    deploy_date: "2026-08-12 14:00:00",
  },
  {
    idx: 495,
    subject: "여름 프로모션 종료 안내",
    notice_type: "일반",
    deploy_date: "2026-08-01 11:00:00",
  },
  {
    idx: 492,
    subject: "개인정보처리방침 개정 안내",
    notice_type: "일반",
    deploy_date: "2026-07-25 17:00:00",
  },
];
