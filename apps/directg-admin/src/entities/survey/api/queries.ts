import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSurveyList,
  fetchSurveyDetail,
  createSurvey,
  updateSurvey,
  fetchSurveyResult,
  fetchEtcAnswerList,
  fetchSurveyUserResult,
} from "./fetcher";
import type { SurveyListSearch, SurveySaveRequest, SurveyUserResultSearch } from "../model/types";

const SURVEY_KEY = ["admin", "board", "survey"] as const;

export const surveyListQueryKey = (query: SurveyListSearch) => [...SURVEY_KEY, query] as const;

// legacy board/survey_list.php — 설문조사 목록.
export const useSurveyList = (query: SurveyListSearch) =>
  useQuery({
    queryKey: surveyListQueryKey(query),
    queryFn: () => fetchSurveyList(query),
  });

export const surveyDetailQueryKey = (idx: number) => [...SURVEY_KEY, "detail", idx] as const;

// legacy survey_register.php(modify 로드) — 상세.
export const useSurveyDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: surveyDetailQueryKey(idx),
    queryFn: () => fetchSurveyDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy survey_ps.php mode=register → survey_list 리다이렉트 = 목록 invalidate.
export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: SurveySaveRequest) => createSurvey(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SURVEY_KEY }),
  });
};

// legacy survey_ps.php mode=update → survey_list 리다이렉트 = invalidate.
export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: SurveySaveRequest }) =>
      updateSurvey(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SURVEY_KEY }),
  });
};

export const surveyResultQueryKey = (idx: number) => [...SURVEY_KEY, "result", idx] as const;

// legacy survey_result.php — 결과보기.
export const useSurveyResult = (idx: number) =>
  useQuery({
    queryKey: surveyResultQueryKey(idx),
    queryFn: () => fetchSurveyResult(idx),
  });

export const etcAnswerListQueryKey = (qidx: number, page: number) =>
  [...SURVEY_KEY, "etc", qidx, page] as const;

// legacy survey_result_etc.php — 문항별 기타/주관식 답변.
export const useEtcAnswerList = (qidx: number, page: number) =>
  useQuery({
    queryKey: etcAnswerListQueryKey(qidx, page),
    queryFn: () => fetchEtcAnswerList(qidx, page),
  });

export const surveyUserResultQueryKey = (query: SurveyUserResultSearch) =>
  [...SURVEY_KEY, "user-result", query] as const;

// legacy survey_result_user.php — 사용자별 결과 매트릭스.
export const useSurveyUserResult = (query: SurveyUserResultSearch) =>
  useQuery({
    queryKey: surveyUserResultQueryKey(query),
    queryFn: () => fetchSurveyUserResult(query),
  });
