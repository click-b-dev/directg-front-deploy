export type { MypageCouponRow, MypageCouponList, CouponRegisterResponse } from "./model/types";
export { postCouponRegister } from "./api/post-coupon-register";
// getMypageCoupons는 server-only(next/headers) — route에서 직접 import.
