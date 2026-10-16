"use server";

import { getMypageQna } from "@entities/mypage-qna/api/get-mypage-qna";
import type { QnaRow } from "@entities/mypage-qna";

/**
 * "더보기" 증분 로드 — legacy `mobile/mypage/ajax_qna.php`(page N 조회 + accordion append) 대응.
 * legacy quirk: 증분 항목은 조회로그(btn-show-answer/data-idx) 없음 → 호출부에서 로그 미배선.
 */
export async function loadMoreQna(nextPage: number): Promise<QnaRow[]> {
  const { list } = await getMypageQna(nextPage);
  return list;
}
