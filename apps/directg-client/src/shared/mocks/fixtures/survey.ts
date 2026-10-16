import type { SurveyResponse } from "@entities/survey";

/**
 * 개발용 fixture — 백엔드(`GET /api/surveys/:idx`, DGKR DB) 준비 전 주입.
 * legacy getSurveyInfo 결과 형태. 커버: 라디오(기타 포함) / 체크박스 / 주관식, required 혼합. 정상 접근·미참여.
 */
export const surveyFixture: SurveyResponse = {
  preview: false,
  accessError: null,
  userAnswer: [],
  survey: {
    idx: 1,
    flag: "Y",
    start_dt: "2026-09-01 00:00:00",
    end_dt: "2026-12-31 23:59:59",
    max_people: 1000,
    answer_cnt: 12,
    point: 500,
    banner_image: "Y",
    question: [
      {
        idx: 101,
        survey_idx: 1,
        number: 1,
        question: "가장 즐겨하는 게임 장르는 무엇인가요?",
        type: "radio",
        required: "Y",
        etc: 1,
        nothing: 0,
        flag: "Y",
        item: [
          { item_idx: 1, item: "RPG", number: 1, flag: "Y", nothing: 0 },
          { item_idx: 2, item: "FPS/슈팅", number: 2, flag: "Y", nothing: 0 },
          { item_idx: 3, item: "스포츠/레이싱", number: 3, flag: "Y", nothing: 0 },
        ],
      },
      {
        idx: 102,
        survey_idx: 1,
        number: 2,
        question: "구매 시 고려하는 요소를 모두 선택해주세요.",
        type: "checkbox",
        required: "Y",
        etc: 0,
        nothing: 0,
        flag: "Y",
        item: [
          { item_idx: 4, item: "가격/할인", number: 1, flag: "Y", nothing: 0 },
          { item_idx: 5, item: "한국어 지원", number: 2, flag: "Y", nothing: 0 },
          { item_idx: 6, item: "리뷰/평점", number: 3, flag: "Y", nothing: 0 },
        ],
      },
      {
        idx: 103,
        survey_idx: 1,
        number: 3,
        question: "서비스 개선을 위한 의견을 자유롭게 남겨주세요.",
        type: "descript",
        required: "N",
        etc: 0,
        nothing: 0,
        flag: "Y",
        item: [],
      },
    ],
  },
};
