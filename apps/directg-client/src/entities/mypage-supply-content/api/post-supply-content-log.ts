import { apiClient } from "@shared/api/client";

/**
 * 제공콘텐츠 다운로드 로그 (client, fire-and-forget). `POST /api/mypage/supply-content/log`
 * — legacy `mypage_supply_content_log.php`. 응답은 사용하지 않는다.
 */
export async function postSupplyContentLog(payload: {
  file_url: string;
  ordno: string;
  patch_name: string;
}): Promise<void> {
  await apiClient.post("mypage/supply-content/log", payload);
}
