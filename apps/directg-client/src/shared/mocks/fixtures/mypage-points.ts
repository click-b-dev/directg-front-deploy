import type { MypagePointRow } from "@entities/mypage-point";

/** 포인트 내역 mock 행 (regdt DESC). */
export const mypagePointRowsFixture: MypagePointRow[] = [
  { regdt: "2026-08-30 14:20:12", emoney_type: "+", memo: "구매 적립", amt_delta: 490 },
  { regdt: "2026-08-28 18:41:02", emoney_type: "-", memo: "주문 사용", amt_delta: 1000 },
  { regdt: "2026-08-20 11:10:33", emoney_type: "+", memo: "이벤트 적립", amt_delta: 500 },
  { regdt: "2026-08-10 09:05:20", emoney_type: "-", memo: "주문 사용", amt_delta: 300 },
];

/** 보유 포인트 mock. */
export const mypageEmoneyFixture = 12500;
