import { apiClient } from "@shared/api/client";
import type { SurveySubmitRequest, SurveySubmitResponse } from "../model/types";

/**
 * 설문 답변 제출 (client). `POST /api/surveys/:idx/answer` — legacy `survey_ps.php`.
 * 로그인/조건/중복 확인, tbl_survey_answer insert, point>0면 포인트 지급(백엔드). 세션 필수(쿠키 자동).
 */
export async function postSurveyAnswer(
  idx: string,
  payload: SurveySubmitRequest,
): Promise<SurveySubmitResponse> {
  return apiClient.post<SurveySubmitResponse>(`surveys/${idx}/answer`, payload);
}
