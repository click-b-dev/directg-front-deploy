import type { SurveyResponse } from "@entities/survey";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileSurveyAccessGuard } from "./mobile-survey-access-guard";
import { MobileSurveyForm } from "./mobile-survey-form";

interface MobileSurveyScreenProps {
  data: SurveyResponse;
}

/** legacy mobile survey.html page-specific `<style>`. */
const MOBILE_SURVEY_STYLE = `
#survey-form {
    background-color: #111923;
    color: #ffffff;
    font-family: 'Noto Sans KR', sans-serif;
    padding: 20px 16px;
    box-sizing: border-box;
}
.section_item {
    background-color: #172230;
    border-radius: 6px;
    padding: 20px 16px;
    margin-bottom: 16px;
    border-top: 2px solid #1c62b9;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.section_item h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #ffffff;
    line-height: 1.5;
}
.section_item hr {
    border: none;
    border-top: 1px solid #24354b;
    margin: 0 0 16px 0;
}
.option_wrapper {
    margin-bottom: 10px;
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
    transition: color 0.2s ease, background-color 0.2s;
    width: 100%;
    padding: 10px 8px;
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
}
.option_label:active {
    background-color: rgba(28, 98, 185, 0.1);
}
.option_label input[type="radio"],
.option_label input[type="checkbox"] {
    margin: 0 12px 0 0;
    accent-color: #1c62b9;
    cursor: pointer;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 1 !important;
}
.option_label input[type="radio"]:checked:disabled,
.option_label input[type="checkbox"]:checked:disabled {
    filter: brightness(1.3) contrast(1.2);
    accent-color: #3b82f6;
}
.option_label:has(input:checked:disabled) {
    color: #ffffff !important;
    background-color: rgba(28, 98, 185, 0.15) !important;
    border: 1px solid rgba(28, 98, 185, 0.3);
}
.option_label:has(input:not(:checked):disabled) {
    color: #64748b !important;
    background-color: rgba(0, 0, 0, 0.1) !important;
}
.section_item .etc_text:disabled {
    background-color: #111923;
    color: #e2e8f0 !important;
    border: 1px solid #2d3d52;
    opacity: 1 !important;
}
.section_item .etc_text {
    width: 100%;
    height: 100px;
    background-color: #111923;
    border: 1px solid #24354b;
    border-radius: 4px;
    padding: 12px;
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
    margin-top: 30px;
    padding: 0 4px;
}
.submit_btn {
    background-color: #1c62b9;
    color: #ffffff;
    border: none;
    width: 100%;
    padding: 14px 0;
    font-size: 1.05rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    box-shadow: 0 4px 10px rgba(28, 98, 185, 0.3);
}
`;

/** 모바일 설문조사 (legacy `mobile/event/survey.html`). */
export function MobileSurveyScreen({ data }: MobileSurveyScreenProps) {
  const { survey, userAnswer, accessError } = data;

  if (accessError === "closed" || accessError === "full") {
    return <MobileSurveyAccessGuard accessError={accessError} />;
  }

  if (accessError === "invalid" || !survey) {
    return <>잘못된 접근</>;
  }

  return (
    <>
      <style>{MOBILE_SURVEY_STYLE}</style>
      <MobileSubHeader pageTitle="설문조사" />
      <div id="appCapsuleSub">
        <div className="section full mt-2">
          <MobileSurveyForm survey={survey} userAnswer={userAnswer} />
        </div>
      </div>
    </>
  );
}
