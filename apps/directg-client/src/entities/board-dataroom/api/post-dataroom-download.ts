import { apiClient } from "@shared/api/client";
import type { DataroomDownloadResponse } from "../model/types";

/**
 * 자료실 다운로드 요청 (client, 브라우저 쿠키 자동 동봉). `POST /api/board/dataroom/download`.
 * legacy `dataroom_ps.php`: 비로그인 시 error_msg, 로그인 시 file_url + 다운로드 로그(setDataroomLog).
 */
export async function postDataroomDownload(payload: {
  idx: number;
  file_url: string;
}): Promise<DataroomDownloadResponse> {
  return apiClient.post<DataroomDownloadResponse>("board/dataroom/download", payload);
}
