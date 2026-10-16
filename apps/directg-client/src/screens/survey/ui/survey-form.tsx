"use client";

import { useRef, useState } from "react";

import { postSurveyAnswer } from "@entities/survey";
import type { SurveyAnswerInput, SurveyInfo, SurveyQuestion, UserAnswer } from "@entities/survey";

interface SurveyFormProps {
  survey: SurveyInfo;
  userAnswer: UserAnswer[];
}

/** legacy 하드코딩 배너 URL (banner_image 값 무시 — verbatim 버그). */
const BANNER_SRC = "https://directg.diskn.com/i7EuDjvcPb?2";
/** 기타 선택지 번호. */
const ETC_NUMBER = 100;

interface AnswerState {
  /** 객관식 선택 번호(radio 1개, checkbox 여러개). */
  selected: number[];
  /** 기타(100) 텍스트. */
  etcText: string;
  /** 주관식 텍스트. */
  text: string;
}

/** userAnswer(참여이력)로 질문별 상태 초기 복원. */
function buildInitialState(
  questions: SurveyQuestion[],
  userAnswer: UserAnswer[],
): Record<number, AnswerState> {
  const state: Record<number, AnswerState> = {};
  for (const q of questions) {
    state[q.idx] = { selected: [], etcText: "", text: "" };
  }
  for (const ans of userAnswer) {
    const cur = state[ans.question_idx];
    if (!cur) continue;
    if (ans.answer !== "") {
      const num = Number(ans.answer);
      cur.selected.push(num);
      if (num === ETC_NUMBER) {
        cur.etcText = ans.answer_text;
      }
    } else {
      cur.text = ans.answer_text;
    }
  }
  return state;
}

/**
 * 설문 응답 폼 (legacy `pc/event/survey.html` 폼 + 인터랙션 재현).
 * 동적 질문(객관식 radio/checkbox+기타 / 주관식 textarea) + required 검증 + 제출. 참여이력 시 disabled.
 */
export function SurveyForm({ survey, userAnswer }: SurveyFormProps) {
  const hasAnswered = userAnswer.length > 0;
  const [answers, setAnswers] = useState<Record<number, AnswerState>>(() =>
    buildInitialState(survey.question, userAnswer),
  );
  const [submitting, setSubmitting] = useState(false);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const update = (qIdx: number, partial: Partial<AnswerState>) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: { ...prev[qIdx], ...partial } }));
  };

  const onRadioChange = (qIdx: number, value: number) => {
    update(qIdx, { selected: [value] });
  };

  const onCheckboxChange = (qIdx: number, value: number, checked: boolean) => {
    const cur = answers[qIdx]?.selected ?? [];
    update(qIdx, {
      selected: checked ? [...cur, value] : cur.filter((v) => v !== value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || submitting) return;

    // legacy: data-required section 검증 — 객관식 선택 / 주관식 입력 누락 시 alert + scroll
    for (const q of survey.question) {
      if (q.required !== "Y") continue;
      const state = answers[q.idx];
      const isObjective = q.type === "radio" || q.type === "checkbox";
      const missing = isObjective ? state.selected.length === 0 : state.text.trim() === "";
      if (missing) {
        alert(`[필수 입력 누락]\n${q.number}. ${q.question}`);
        sectionRefs.current[q.idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    // payload 조립 (legacy answer 구조 → 정규화)
    const payload: SurveyAnswerInput[] = survey.question.map((q) => {
      const state = answers[q.idx];
      if (q.type === "descript") {
        return { question_idx: q.idx, answer_text: state.text };
      }
      const input: SurveyAnswerInput = { question_idx: q.idx, answer: state.selected };
      if (state.selected.includes(ETC_NUMBER)) {
        input.answer_etc = state.etcText;
      }
      return input;
    });

    setSubmitting(true);
    try {
      const res = await postSurveyAnswer(String(survey.idx), {
        mode: "register",
        answers: payload,
      });
      alert(res.message);
      if (res.result === "success") {
        // legacy: location.href = './survey?idx={idx}'
        location.href = `/event/survey?idx=${survey.idx}`;
      }
    } catch (error) {
      alert(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="survey-form"
      method="POST"
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#111923",
        color: "#ffffff",
        fontFamily: "'Noto Sans KR', sans-serif",
        padding: "40px 20px",
        maxWidth: "900px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <input type="hidden" name="mode" value="register" />
      <input type="hidden" name="idx" value={survey.idx} />

      {survey.banner_image !== "" && (
        <div
          style={{
            margin: "0 0 40px 0",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          <img src={BANNER_SRC} style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {survey.question.map((q, index) => {
        const itemNum = index + 1;
        const state = answers[q.idx];
        const items =
          q.type === "descript"
            ? []
            : [
                ...q.item,
                ...(q.etc
                  ? [{ item_idx: -1, item: "기타", number: ETC_NUMBER, flag: "", nothing: 0 }]
                  : []),
              ];
        const showEtc = state.selected.includes(ETC_NUMBER);

        return (
          <div
            key={q.idx}
            className="section_item"
            data-required={q.required === "Y" ? "true" : "false"}
            ref={(el) => {
              sectionRefs.current[q.idx] = el;
            }}
          >
            <h4>
              {itemNum}. {q.question}
            </h4>
            <hr />

            {q.type === "descript" ? (
              <>
                <input type="hidden" name={`answer[${q.idx}]`} value="answer_text" />
                <textarea
                  name={`answer_text[${q.idx}]`}
                  className="etc_text"
                  disabled={hasAnswered}
                  value={state.text}
                  onChange={(e) => update(q.idx, { text: e.target.value })}
                />
              </>
            ) : (
              items.map((item) => (
                <div key={item.number}>
                  <div className="option_wrapper">
                    <label className="option_label">
                      <input
                        type={q.type}
                        name={`answer[${q.idx}]${q.type === "checkbox" ? "[]" : ""}`}
                        value={item.number}
                        checked={state.selected.includes(item.number)}
                        disabled={hasAnswered}
                        onChange={(e) =>
                          q.type === "checkbox"
                            ? onCheckboxChange(q.idx, item.number, e.target.checked)
                            : onRadioChange(q.idx, item.number)
                        }
                      />
                      {item.item}
                    </label>
                  </div>
                  {item.number === ETC_NUMBER && (
                    <div className={`option_wrapper ${showEtc ? "" : "d-none"}`}>
                      <label className="option_label">
                        <input
                          type="text"
                          name={`answer_etc[${q.idx}]`}
                          value={state.etcText}
                          className="etc_text"
                          disabled={hasAnswered}
                          required={showEtc}
                          style={{ height: "0px" }}
                          onChange={(e) => update(q.idx, { etcText: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}

      <div className="submit_btn_container">
        {hasAnswered ? (
          <button
            type="button"
            className="submit_btn"
            onClick={() => alert("이미 제출하였습니다.")}
          >
            제출
          </button>
        ) : (
          <button type="submit" className="submit_btn" disabled={submitting}>
            제출
          </button>
        )}
      </div>
    </form>
  );
}
