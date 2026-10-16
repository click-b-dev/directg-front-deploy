import { apiClient } from "@shared/api/client";
import type { Fm26ApplyRequest, Fm26ApplyResponse } from "../model/fm26-types";

/**
 * 풋볼 매니저 26 이벤트 응모 (client). `POST /api/events/fm26/apply` — legacy `event_fm26_ps.php`.
 * event_no 38=#01 포인트 수령(지급/미달/중복 분기), 39=#02 구글폼(result_url). 세션 필수(쿠키 자동).
 */
export async function postFm26Apply(payload: Fm26ApplyRequest): Promise<Fm26ApplyResponse> {
  return apiClient.post<Fm26ApplyResponse>("events/fm26/apply", payload);
}
