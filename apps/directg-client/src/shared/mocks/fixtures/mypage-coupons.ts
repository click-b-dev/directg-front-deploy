import type { MypageCouponRow } from "@entities/mypage-coupon";

/** 쿠폰 내역 mock 행 (regdt DESC). */
export const mypageCouponRowsFixture: MypageCouponRow[] = [
  { regdt: "2026-08-29 10:15:00", coupon_name: "여름맞이 웰컴 쿠폰", coupon_price: 3000 },
  { regdt: "2026-08-15 16:40:22", coupon_name: "친구초대 쿠폰", coupon_price: 1000 },
];
