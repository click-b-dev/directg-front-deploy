import type { NoticeView } from "@entities/board-notice";

/**
 * 개발용 fixture — 백엔드(`GET /api/board/notices/:idx`) 준비 전 주입.
 * legacy `getNoticeView` 응답 형태. contents=html_print2 원문, contents_html=Parsedown+br 렌더 결과.
 * 백엔드 연동 시 idx별 실제 데이터·hit 증가로 대체.
 */
export function buildBoardNoticeViewFixture(idx: number): NoticeView {
  return {
    idx,
    subject: "추석 연휴 고객센터 운영 안내",
    deploy_date: "2026-08-28 10:00:00",
    notice_type: "1",
    hit: 1523,
    contents:
      "안녕하세요, 다이렉트 게임즈입니다. 추석 연휴 기간 고객센터 운영 일정을 안내드립니다.",
    contents_html:
      "<p>안녕하세요, 다이렉트 게임즈입니다.</p>\n<p>추석 연휴 기간 고객센터 운영 일정을 안내드립니다.</p>\n<ul>\n<li>휴무: 2026-09-14 ~ 2026-09-18</li>\n<li>정상 운영: 2026-09-19(금)부터</li>\n</ul>\n<p>제품 코드(키)는 마이페이지에서 상시 확인 가능합니다. 감사합니다.</p>",
  };
}
