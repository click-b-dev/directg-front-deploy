"use server";

import { getMypagePoints, type MypagePointRow } from "@entities/mypage-point";

/**
 * "더보기" 증분 로드 — legacy `mobile/mypage/ajax_point.php`(page N 조회 + 행 append) 대응.
 * 호출부가 nextPage(=data-page+1)를 직접 전달한다(notice-list 파일럿과 동일 패턴).
 */
export async function loadMorePoints(nextPage: number): Promise<MypagePointRow[]> {
  const { list } = await getMypagePoints(nextPage);
  return list;
}
