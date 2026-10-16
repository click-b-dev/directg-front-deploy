import type { GiftItem } from "@entities/mypage-gift";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/gift`) 준비 전 주입.
 * legacy `getGiftList`(tbl_event_gift ⋈ _member) 행 형태. 버튼 분기 커버:
 * 배송+status0(배송주소입력) / 키+status0(키수령) / 키+status3(키확인) / 배송+status2+tracking(배송조회).
 */
export const mypageGiftFixture: GiftItem[] = [
  {
    idx: 9001,
    title: "여름 프로모션 응모 이벤트",
    gift_nm: "다이렉트 게임즈 굿즈 세트",
    is_delivery: "Y",
    parent_idx: 501,
    reserve_id: "",
    tracking_no: "",
    status: "0",
    ordno: "",
    delivery_code: "",
    address_enddt: "2026-09-20",
  },
  {
    idx: 9002,
    title: "신규 회원 웰컴 이벤트",
    gift_nm: "DIRECTG 포인트 5,000P",
    is_delivery: "N",
    parent_idx: 502,
    reserve_id: "",
    tracking_no: "",
    status: "0",
    ordno: "",
    delivery_code: "",
    address_enddt: "2026-09-15",
  },
  {
    idx: 9003,
    title: "출석 체크 리워드",
    gift_nm: "인디게임 제품 코드",
    is_delivery: "N",
    parent_idx: 503,
    reserve_id: "RSV-20260810-003",
    tracking_no: "",
    status: "3",
    ordno: "GIFT-9003-1001",
    delivery_code: "",
    address_enddt: "",
  },
  {
    idx: 9004,
    title: "여름 프로모션 응모 이벤트",
    gift_nm: "한정판 피규어",
    is_delivery: "Y",
    parent_idx: 501,
    reserve_id: "",
    tracking_no: "1234567890123",
    status: "2",
    ordno: "",
    delivery_code: "001",
    address_enddt: "",
  },
];
