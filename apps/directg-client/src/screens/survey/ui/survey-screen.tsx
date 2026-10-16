import type { SurveyResponse } from "@entities/survey";

import { SurveyAccessGuard } from "./survey-access-guard";
import { SurveyForm } from "./survey-form";

interface SurveyScreenProps {
  data: SurveyResponse;
}

/** legacy survey.html page-specific `<style>` (다크 커스텀 폼). */
const SURVEY_STYLE = `
.section_item {
  background-color: #172230;
  border-radius: 6px;
  padding: 25px 30px;
  margin-bottom: 25px;
  border-top: 2px solid #1c62b9;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.section_item h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #ffffff;
  line-height: 1.5;
}
.section_item hr {
  border: none;
  border-top: 1px solid #24354b;
  margin: 0 0 20px 0;
}
.option_wrapper {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.option_wrapper:last-child {
  margin-bottom: 0;
}
.option_label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #b0c4de;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  width: 100%;
}
.option_label:hover {
  color: #ffffff;
}
.option_label input[type="radio"] {
  margin: 0 12px 0 0;
  accent-color: #1c62b9;
  cursor: pointer;
  width: 16px;
  height: 16px;
}
.option_label input[type="checkbox"] {
  margin: 0 12px 0 0;
  accent-color: #1c62b9;
  cursor: pointer;
  width: 16px;
  height: 16px;
}
.section_item .etc_text {
  width: 100%;
  height: 120px;
  background-color: #111923;
  border: 1px solid #24354b;
  border-radius: 4px;
  padding: 15px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.section_item .etc_text:focus {
  outline: none;
  border-color: #1c62b9;
  box-shadow: 0 0 8px rgba(28, 98, 185, 0.4);
}
.submit_btn_container {
  text-align: center;
  margin-top: 40px;
}
.submit_btn {
  background-color: #1c62b9;
  color: #ffffff;
  border: none;
  padding: 14px 80px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 4px 10px rgba(28, 98, 185, 0.3);
}
.submit_btn:hover {
  background-color: #2476dd;
}
.submit_btn:active {
  transform: scale(0.98);
}
`;

/**
 * 설문조사 (legacy `pc/event/survey.html`). 공개 진입(?idx=), 조건분기(종료/마감→alert+back).
 * 미리보기/로그인은 route에서 판단, 폼 본체는 client(SurveyForm).
 */
export function SurveyScreen({ data }: SurveyScreenProps) {
  const { survey, userAnswer, accessError } = data;

  // 종료/인원마감 → alert + history.back (legacy)
  if (accessError === "closed" || accessError === "full") {
    return <SurveyAccessGuard accessError={accessError} />;
  }

  // 잘못된 접근 → 텍스트 출력 (legacy "잘못된 접근")
  if (accessError === "invalid" || !survey) {
    return <>잘못된 접근</>;
  }

  return (
    <>
      <style>{SURVEY_STYLE}</style>
      <div className="container my-3 pb-5">
        <main>
          <SurveyForm survey={survey} userAnswer={userAnswer} />
        </main>
      </div>
    </>
  );
}
