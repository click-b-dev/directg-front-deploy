import { apiClient } from "@shared/api/client";

/**
 * 답변 조회 로그 (client, fire-and-forget). `POST /api/mypage/qna/view` — legacy `mode=view`
 * → `UPDATE tbl_qna SET replyStatus=1`. 응답은 사용하지 않는다(legacy도 무시).
 */
export async function postMypageQnaView(idx: number): Promise<void> {
  await apiClient.post("mypage/qna/view", { idx });
}
