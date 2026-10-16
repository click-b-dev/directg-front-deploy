"use server";

import { getMypageCoupons } from "@entities/mypage-coupon/api/get-mypage-coupons";
import type { MypageCouponRow } from "@entities/mypage-coupon";

/**
 * "더보기" 증분 로드 — legacy `mobile/mypage/ajax_coupon.php`(page N 조회 + 행 append) 대응.
 * 호출부가 nextPage(=data-page+1)를 직접 전달한다(point/notice 파일럿과 동일 패턴).
 */
export async function loadMoreCoupons(nextPage: number): Promise<MypageCouponRow[]> {
  const { list } = await getMypageCoupons(nextPage);
  return list;
}
