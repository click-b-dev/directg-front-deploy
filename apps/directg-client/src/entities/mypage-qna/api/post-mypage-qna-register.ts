import { apiClient } from "@shared/api/client";
import type { QnaRegisterResponse } from "../model/types";

/**
 * 문의 등록 (client, multipart/form-data). `POST /api/mypage/qna` — legacy `mode=register`
 * (setQna + 첨부 검증/저장 + gubun=5 알림메일). FormData(gubun/subject/contents/upload_file[])를 그대로 전송.
 */
export async function postMypageQnaRegister(formData: FormData): Promise<QnaRegisterResponse> {
  return apiClient.post<QnaRegisterResponse>("mypage/qna", undefined, { body: formData });
}
