// legacy board/survey_list.php — 설문조사 목록(getSurveyList, ts.idx DESC, 20/page).

export type SurveyListSearch = {
  page: number;
  search_type: string; // ts.subject
  search_value: string; // LIKE %v%
};

export type SurveyListItem = {
  idx: number;
  banner_image: string;
  subject: string;
  reg_dt: string;
  start_dt: string;
  end_dt: string;
  max_people: number; // 0=무제한
  cnt: number; // 응답수(getSurveyCount)
  flag: string; // Y=진행 / N=종료
};

export type SurveyPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type SurveyListResponse = {
  items: SurveyListItem[];
  pagination: SurveyPagination;
};

// legacy survey_register.php(modify 로드) — 문항.
export type SurveyQuestion = {
  number: number;
  question: string;
  type: "radio" | "checkbox" | "descript";
  required: string; // Y|N
  etc: number; // 0|1
  items: string[]; // 객관식 보기
};

// legacy getSurveyInfo — 상세(마스터 + 문항).
export type SurveyDetail = {
  idx: number;
  subject: string;
  start_dt: string;
  end_dt: string;
  max_people: number; // 0=무제한
  view_result: string; // Y|N
  point: number;
  flag: string; // Y|N
  banner_image: string;
  reg_dt: string;
  survey_count: number; // >0이면 잠금
  questions: SurveyQuestion[];
};

// legacy survey_ps.php register/update — 저장 요청.
export type SurveySaveQuestion = {
  number: number;
  question: string;
  type: "radio" | "checkbox" | "descript";
  required: string; // Y|N
  etc: number; // 0|1
  items: string[];
};

export type SurveySaveRequest = {
  subject: string;
  start_dt: string;
  end_dt: string;
  max_people: string; // radio: "0"(무제한) | ""(최대)
  max_people_val: number;
  view_result: string;
  point: number;
  flag: string;
  banner_image: string; // 선택 파일명(백엔드 실제 업로드)
  delete_current_image: string; // Y|""
  questions: SurveySaveQuestion[];
};

export type SurveyActionResult = { success: boolean };

// legacy survey_result.php — 결과보기(요약 + 문항별 집계).
export type SurveyResultItem = {
  number: number;
  item: string;
  cnt: number;
};

export type SurveyResultQuestion = {
  idx: number; // 문항 DB id(답변보기 링크용)
  number: number;
  question: string;
  type: "radio" | "checkbox" | "descript";
  etc: number;
  items: SurveyResultItem[];
  etc_cnt: number;
};

export type SurveyResult = {
  idx: number;
  subject: string;
  start_dt: string;
  end_dt: string;
  max_people: number;
  point: number;
  survey_count: number;
  questions: SurveyResultQuestion[];
};

// legacy survey_result_etc.php — 문항별 기타/주관식 답변.
export type EtcAnswerItem = {
  answer_text: string;
  m_id: string;
  answer: number | null; // 100=기타 / null=주관식
};

export type EtcAnswerListResponse = {
  question: string;
  total_results: number;
  answer_all_count: number;
  items: EtcAnswerItem[];
  pagination: SurveyPagination;
};

// legacy survey_result_user.php — 사용자별 결과 매트릭스.
export type SurveyUserResultSearch = {
  idx: number;
  page: number;
  search_value: string;
};

export type SurveyUserResultColumn = {
  id: string;
  label: string; // "1번 문항" / "1번 문항 '기타'"
  tooltip: string; // 문항 텍스트
};

export type SurveyUserResultRow = {
  m_id: string;
  values: string[]; // columns 순서 정렬
};

export type SurveyUserResult = {
  subject: string;
  start_dt: string;
  end_dt: string;
  max_people: number;
  point: number;
  survey_count: number;
  columns: SurveyUserResultColumn[];
  rows: SurveyUserResultRow[];
  pagination: SurveyPagination;
};
