import type { NoticeListRow } from "@entities/board-notice";

/**
 * 개발용 fixture — 백엔드(`GET /api/board/notices`) 준비 전 주입.
 * legacy `tbl_notice`(is_view='Y') 행 형태 재현. 정렬(is_notice desc, deploy_date desc)·검색은 백엔드 책임.
 */
export const boardNoticesFixture: NoticeListRow[] = [
  {
    idx: 502,
    notice_type: "1",
    subject: "[공지] 추석 연휴 고객센터 운영 안내",
    deploy_date: "2026-08-28 10:00:00",
    hit: 1523,
  },
  {
    idx: 500,
    notice_type: "1",
    subject: "8월 결제 시스템 정기 점검 안내",
    deploy_date: "2026-08-20 09:30:00",
    hit: 842,
  },
  {
    idx: 498,
    notice_type: "3",
    subject: "일부 타이틀 가격 조정 안내",
    deploy_date: "2026-08-12 14:00:00",
    hit: 2104,
  },
  {
    idx: 495,
    notice_type: "2",
    subject: "여름 프로모션 종료 안내",
    deploy_date: "2026-08-01 11:00:00",
    hit: 3391,
  },
  {
    idx: 492,
    notice_type: "4",
    subject: "개인정보처리방침 개정 안내",
    deploy_date: "2026-07-25 17:00:00",
    hit: 671,
  },
  {
    idx: 488,
    notice_type: "1",
    subject: "네이버페이 결제 이벤트 안내",
    deploy_date: "2026-07-12 09:00:00",
    hit: 5820,
  },
];
