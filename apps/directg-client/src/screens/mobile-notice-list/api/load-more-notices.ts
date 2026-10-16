"use server";

import { getBoardNotices, type NoticeListRow } from "@entities/board-notice";

/**
 * "더보기" 증분 로드 — legacy `mobile/board/notice_ajax.php`(page N 조회 + 행 append) 대응.
 * 호출부가 nextPage(=data-page+1)를 직접 전달한다(game_thumb 파일럿과 동일 패턴).
 */
export async function loadMoreNotices(nextPage: number): Promise<NoticeListRow[]> {
  const { list } = await getBoardNotices(nextPage);
  return list;
}
