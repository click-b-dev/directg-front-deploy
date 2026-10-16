import { apiClient } from "@shared/api/client";
import type {
  SurveyListSearch,
  SurveyListResponse,
  SurveyDetail,
  SurveySaveRequest,
  SurveyActionResult,
  SurveyResult,
  EtcAnswerListResponse,
  SurveyUserResultSearch,
  SurveyUserResult,
} from "../model/types";

// legacy board/survey_list.php — 설문조사 목록(ts.idx DESC, 20/page).
export const fetchSurveyList = (query: SurveyListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_type !== "") {
    searchParams.search_type = query.search_type;
  }
  if (query.search_value !== "") {
    searchParams.search_value = query.search_value;
  }
  return apiClient.get<SurveyListResponse>("/admin/board/surveys", { searchParams });
};

// legacy survey_register.php(modify 로드) — 상세.
export const fetchSurveyDetail = (idx: number) =>
  apiClient.get<SurveyDetail>(`/admin/board/surveys/${idx}`);

// legacy survey_ps.php mode=register — 등록.
export const createSurvey = (payload: SurveySaveRequest) =>
  apiClient.post<SurveyActionResult>("/admin/board/surveys", payload);

// legacy survey_ps.php mode=update — 수정.
export const updateSurvey = (idx: number, payload: SurveySaveRequest) =>
  apiClient.put<SurveyActionResult>(`/admin/board/surveys/${idx}`, payload);

// legacy survey_result.php — 결과보기.
export const fetchSurveyResult = (idx: number) =>
  apiClient.get<SurveyResult>(`/admin/board/surveys/${idx}/result`);

// legacy survey_result_etc.php — 문항별 기타/주관식 답변(페이징).
export const fetchEtcAnswerList = (qidx: number, page: number) =>
  apiClient.get<EtcAnswerListResponse>(`/admin/board/survey-etc-answers/${qidx}`, {
    searchParams: { page: String(page) },
  });

// legacy survey_result_etc_excel.php — CSV용 전체 답변.
export const fetchEtcAnswersAll = (qidx: number) =>
  apiClient.get<EtcAnswerListResponse>(`/admin/board/survey-etc-answers/${qidx}`, {
    searchParams: { all: "1" },
  });

// legacy survey_result_user.php — 사용자별 결과 매트릭스.
export const fetchSurveyUserResult = (query: SurveyUserResultSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_value = query.search_value;
  }
  return apiClient.get<SurveyUserResult>(`/admin/board/surveys/${query.idx}/user-results`, {
    searchParams,
  });
};
