import type { EventItem } from "@entities/event";

/**
 * 개발용 fixture — `GET /api/promotion/events`. legacy getPromotionEventList(show_promotion='Y') 형태.
 * event 목록과 동일 EventItem. contents_html은 Parsedown 렌더 HTML.
 */
export const promotionEventsFixture: EventItem[] = [
  {
    subject: "주말특가 한정 추가 할인 쿠폰",
    contents_html:
      "<p>주말 동안 <strong>10% 추가 할인 쿠폰</strong>을 드립니다.</p><ul><li>대상: 전 회원</li><li>기간: 금 16시 ~ 월 16시</li></ul>",
    event_banner: "https://placehold.co/600x400?text=Weekend+Event",
    event_link_url: "/event/event",
    event_link_target: "_self",
  },
  {
    subject: "신작 예약구매 사은품 증정",
    contents_html:
      "<p>이번 주 신작 예약구매 시 <strong>다이렉트 게임즈 포인트</strong>를 드립니다.</p>",
    event_banner: "https://placehold.co/600x400?text=Preorder+Gift",
    event_link_url: "/event/event_fm26",
    event_link_target: "_blank",
  },
];
