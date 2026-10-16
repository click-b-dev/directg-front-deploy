import type { EventItem } from "@entities/event";

/**
 * 개발용 fixture — 백엔드(`GET /api/events`, 리뉴얼 DB tbl_event) 준비 전 주입.
 * legacy getEvenBoardtList 결과 형태(진행중 이벤트, 마감임박순). contents_html은 Parsedown 렌더 HTML.
 * 배너 규격: legacy 실제 이벤트 배너는 1300x500(2.6:1 가로형) — mock도 동일 비율로 맞춤(directg.net 대조).
 */
export const eventsFixture: EventItem[] = [
  {
    subject: "신규 회원 가입 이벤트",
    contents_html:
      "<p>다이렉트 게임즈 신규 가입 시 <strong>3,000 포인트</strong>를 즉시 지급합니다.</p><ul><li>대상: 신규 가입 회원</li><li>기간: 2026-09-01 ~ 2026-09-30</li></ul>",
    event_banner: "https://placehold.co/1300x500?text=Event+1",
    event_link_url: "/member/join_step1",
    event_link_target: "_self",
  },
  {
    subject: "풋볼 매니저 26 예약구매 이벤트",
    contents_html:
      "<p>지금 예약구매하고 <strong>얼리 액세스</strong> 혜택을 받으세요.</p><ul><li>사전 예약 특전 제공</li><li>선착순 한정</li></ul>",
    event_banner: "https://placehold.co/1300x500?text=Event+2",
    event_link_url: "/event/event_fm26",
    event_link_target: "_blank",
  },
];
