import type { Fm26Status } from "@entities/event";

/**
 * 개발용 fixture — 백엔드(`GET /api/events/fm26/status`) 준비 전 주입.
 * legacy chkEventOrderGoods_v2(38)/chkEventMemberLog(38) 반환. 기본: 대상자 달성·미참여(포인트 수령 버튼 노출).
 */
export const fm26StatusFixture: Fm26Status = {
  eventResult1: "1",
  chkEventMember1: "N",
};
