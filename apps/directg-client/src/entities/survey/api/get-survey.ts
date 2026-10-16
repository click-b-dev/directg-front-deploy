import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SurveyResponse } from "../model/types";

/**
 * 설문 상세 조회 (server-only, 세션 쿠키 전달). `GET /api/surveys/:idx` — legacy `Board::getSurveyInfo`
 * + `getUserAnswerInfo`. 조건 판정(종료/마감/로그인/미리보기)은 백엔드가 accessError/preview로 응답.
 */
export async function getSurvey(idx: string): Promise<SurveyResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SurveyResponse>(`surveys/${idx}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
