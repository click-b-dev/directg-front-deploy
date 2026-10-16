/**
 * 설문조사 (legacy `pc/event/survey.html` + `survey_ps.php`, `Board::getSurveyInfo`/`getUserAnswerInfo`).
 * 계약: `GET /api/surveys/:idx`, `POST /api/surveys/:idx/answer`.
 * 문서: docs/migration/storefront/event/survey.md
 */

/** 설문 선택지(tbl_survey_question_item). */
export interface SurveyItem {
  item_idx: number;
  item: string;
  /** 선택지 번호(value). 기타는 100. */
  number: number;
  flag: string;
  nothing: number;
}

/** 설문 질문(tbl_survey_question). */
export interface SurveyQuestion {
  /** question_idx. */
  idx: number;
  survey_idx: number;
  number: number;
  question: string;
  /** radio/checkbox=객관식, descript=주관식. */
  type: "radio" | "checkbox" | "descript";
  required: "Y" | "N";
  /** 기타 옵션 노출 여부(truthy면 number=100 "기타" 추가). */
  etc: number;
  nothing: number;
  flag: string;
  item: SurveyItem[];
}

/** 설문 상세(tbl_survey + question + answer_cnt). */
export interface SurveyInfo {
  idx: number;
  flag: string;
  start_dt: string;
  end_dt: string;
  max_people: number;
  answer_cnt: number;
  /** 참여 포인트(>0이면 지급). */
  point: number;
  /** 배너 노출 여부 판단용(src는 legacy 하드코딩 URL, banner_image 값 무시 — verbatim). */
  banner_image: string;
  question: SurveyQuestion[];
}

/** 참여이력(tbl_survey_answer). */
export interface UserAnswer {
  question_idx: number;
  /** 선택 번호(객관식). 주관식이면 빈값. */
  answer: string;
  /** 기타/주관식 텍스트. */
  answer_text: string;
}

/** 설문 조회 응답. accessError로 조건 미충족 전달(legacy alert+back 재현). */
export interface SurveyResponse {
  survey: SurveyInfo | null;
  userAnswer: UserAnswer[];
  /** admin 미리보기(조건 스킵). 백엔드 세션 판단. */
  preview: boolean;
  /** closed=종료/기간밖, full=인원마감, invalid=잘못된 접근, login=로그인 필요, null=정상. */
  accessError: "closed" | "full" | "invalid" | "login" | null;
}

/** 제출 답변(질문별). */
export interface SurveyAnswerInput {
  question_idx: number;
  /** 객관식 선택 번호(radio 1개, checkbox 여러개). */
  answer?: number[];
  /** 기타(100) 텍스트. */
  answer_etc?: string;
  /** 주관식 텍스트. */
  answer_text?: string;
}

export interface SurveySubmitRequest {
  mode: "register";
  answers: SurveyAnswerInput[];
}

export interface SurveySubmitResponse {
  result: "success" | "fail";
  message: string;
}
