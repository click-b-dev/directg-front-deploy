/**
 * 풋볼 매니저 26 예약구매 이벤트 (legacy `pc/event/event_fm26.html` + `event_fm26_ps.php`, `PurchaseEvent`).
 * 계약: `GET /api/events/fm26/status`, `POST /api/events/fm26/apply`.
 * 문서: docs/migration/storefront/event/event-fm26.md
 */

/** 초기 상태조회(로그인 시). legacy `chkEventOrderGoods_v2`/`chkEventMemberLog` 반환. */
export interface Fm26Status {
  /** 이벤트#01 대상자 여부 — "1"(달성)/"0"(미달). 하드코딩 m_no는 백엔드가 "1" verbatim. */
  eventResult1: "0" | "1";
  /** 이벤트#01 참여(수령) 여부 — "Y"(참여완료)/"N"(미참여). */
  chkEventMember1: "Y" | "N";
}

/** 응모 요청(POST). event_no 38=#01 포인트 수령, 39=#02 구글폼. */
export interface Fm26ApplyRequest {
  event_no: 38 | 39;
}

/** 응모 응답. legacy event_fm26_ps.php json 그대로. */
export interface Fm26ApplyResponse {
  /** success=포인트지급 완료, fail=미달/중복, request=구글폼(result_url). */
  result_code: "success" | "fail" | "request";
  /** success/fail 시 alert 메시지(legacy verbatim). */
  result_msg?: string;
  /** request 시 새 창으로 열 URL(구글폼). */
  result_url?: string;
}
