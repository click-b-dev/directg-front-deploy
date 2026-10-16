import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useSurveyDetail,
  useCreateSurvey,
  useUpdateSurvey,
  type SurveyDetail,
  type SurveySaveRequest,
} from "@entities/survey";

export type SurveyRegisterSearch = {
  mode: string;
  idx: number;
  search_type: string;
  search_value: string;
  page: number;
};

type QItem = { key: string; value: string };
type Question = {
  key: string;
  kind: "obj" | "sub";
  responseType: "radio" | "checkbox" | "descript";
  question: string;
  required: boolean;
  items: QItem[];
  etc: boolean;
};

let keySeq = 0;
const newKey = () => `q_${(keySeq += 1)}`;

const detailToQuestions = (detail: SurveyDetail): Question[] =>
  detail.questions.map((q) => ({
    key: newKey(),
    kind: q.type === "descript" ? "sub" : "obj",
    responseType: q.type,
    question: q.question,
    required: q.required === "Y",
    items: (q.items.length ? q.items : ["", ""]).map((v) => ({ key: newKey(), value: v })),
    // legacy modify: 기타의견(etc)은 복원하지 않음 → false 고정
    etc: false,
  }));

// legacy board/survey_register.php — 설문조사 등록/수정(대형 동적 폼).
export const SurveyRegisterScreen = (search: SurveyRegisterSearch) => {
  const isModify = search.mode === "update" && search.idx > 0;
  const { data } = useSurveyDetail(search.idx, { enabled: isModify });

  const action = isModify ? "수정" : "등록";
  useEffect(() => {
    document.title = `설문조사 ${action}`;
  }, [action]);

  if (isModify && !data) {
    return null;
  }

  return <SurveyForm isModify={isModify} detail={isModify ? data : undefined} search={search} />;
};

const SurveyForm = ({
  isModify,
  detail,
  search,
}: {
  isModify: boolean;
  detail?: SurveyDetail;
  search: SurveyRegisterSearch;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateSurvey();
  const updateMutation = useUpdateSurvey();
  const action = isModify ? "수정" : "등록";
  const isLocked = isModify && (detail?.survey_count ?? 0) > 0;

  const [subject, setSubject] = useState(detail?.subject ?? "");
  const [startDt, setStartDt] = useState(detail?.start_dt ?? "");
  const [endDt, setEndDt] = useState(detail?.end_dt ?? "");
  // 무제한="0" / 최대="" (legacy radio value)
  const [maxPeopleRadio, setMaxPeopleRadio] = useState(
    detail && detail.max_people !== 0 ? "" : "0",
  );
  const [maxPeopleVal, setMaxPeopleVal] = useState(
    detail?.max_people ? String(detail.max_people) : "",
  );
  const [viewResult, setViewResult] = useState(detail?.view_result ?? "N");
  const [point, setPoint] = useState(detail?.point ? String(detail.point) : "");
  const [flag, setFlag] = useState(detail?.flag ?? "Y");
  const [deleteCurrentImage, setDeleteCurrentImage] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<Question[]>(detail ? detailToQuestions(detail) : []);

  useEffect(() => {
    if (isLocked) {
      window.alert("참여 대상이 존재하여 기본 설정 이외의 항목은 수정할 수 없습니다.");
    }
  }, [isLocked]);

  const addQuestion = (kind: "obj" | "sub") => {
    setQuestions((prev) => [
      ...prev,
      kind === "obj"
        ? {
            key: newKey(),
            kind: "obj",
            responseType: "radio",
            question: "",
            required: false,
            items: [
              { key: newKey(), value: "" },
              { key: newKey(), value: "" },
            ],
            etc: false,
          }
        : {
            key: newKey(),
            kind: "sub",
            responseType: "descript",
            question: "",
            required: false,
            items: [],
            etc: false,
          },
    ]);
  };

  const updateQuestion = (key: string, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  };

  const deleteQuestion = (key: string) => {
    if (window.confirm("이 문항을 삭제하시겠습니까?")) {
      setQuestions((prev) => prev.filter((q) => q.key !== key));
    }
  };

  const moveQuestion = (key: string, dir: -1 | 1) => {
    setQuestions((prev) => {
      const i = prev.findIndex((q) => q.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const cloneQuestion = (key: string) => {
    setQuestions((prev) => {
      const i = prev.findIndex((q) => q.key === key);
      if (i < 0) {
        return prev;
      }
      const src = prev[i];
      const copy: Question = {
        ...src,
        key: newKey(),
        items: src.items.map((it) => ({ key: newKey(), value: it.value })),
      };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  };

  const addOption = (key: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key ? { ...q, items: [...q.items, { key: newKey(), value: "" }] } : q,
      ),
    );
  };

  const removeOption = (key: string, itemKey: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key ? { ...q, items: q.items.filter((it) => it.key !== itemKey) } : q,
      ),
    );
  };

  const setOptionValue = (key: string, itemKey: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key
          ? { ...q, items: q.items.map((it) => (it.key === itemKey ? { ...it, value } : it)) }
          : q,
      ),
    );
  };

  const addEtc = (key: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== key) {
          return q;
        }
        if (q.etc) {
          window.alert("기타의견은 하나만 추가할 수 있습니다.");
          return q;
        }
        return { ...q, etc: true };
      }),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: SurveySaveRequest = {
      subject,
      start_dt: startDt,
      end_dt: endDt,
      max_people: maxPeopleRadio,
      max_people_val: Number(maxPeopleVal) || 0,
      view_result: viewResult,
      point: Number(point) || 0,
      flag,
      banner_image: bannerRef.current?.files?.[0]?.name ?? "",
      delete_current_image: deleteCurrentImage ? "Y" : "",
      questions: questions.map((q, index) => ({
        number: index,
        question: q.question,
        type: q.responseType,
        required: q.required ? "Y" : "N",
        etc: q.etc ? 1 : 0,
        items: q.kind === "obj" ? q.items.map((it) => it.value) : [],
      })),
    };
    const onSuccess = () => {
      window.alert(`${action} 되었습니다.`);
      navigate({
        to: "/board/survey_list",
        search: { page: 1, search_type: "", search_value: "" },
      });
    };
    if (isModify) {
      updateMutation.mutate({ idx: search.idx, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const backLink = `/board/survey_list?${new URLSearchParams({
    page: String(search.page),
    search_type: search.search_type,
    search_value: search.search_value,
  }).toString()}`;

  return (
    <>
      <style>{`.req_mark { color: red; }`}</style>

      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    설문조사 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">설문조사 {action}</li>
              </ol>
            </div>
            <h4 className="page-title">설문조사 {action}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <form
        id="frm"
        name="frm"
        method="POST"
        className="form-horizontal"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="col-8">
            <div className="card border border-1">
              <div className="card-header bg-secondary text-white fw-bold font-15">기본설정</div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label
                    htmlFor="banner_image"
                    className="col-sm-2 col-form-label bg-light d-flex align-items-center"
                  >
                    설문 배너 이미지
                  </label>
                  <div className="col-sm-6">
                    {detail?.banner_image && (
                      <div className="mb-2 current-banner">
                        <img
                          src={`https://directg.net${detail.banner_image}`}
                          alt="배너"
                          style={{ maxWidth: "300px" }}
                          className="img-thumbnail d-block mb-1"
                        />
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="delImg"
                            checked={deleteCurrentImage}
                            onChange={(e) => setDeleteCurrentImage(e.target.checked)}
                          />
                          <label className="form-check-label small text-danger" htmlFor="delImg">
                            기존 이미지 삭제
                          </label>
                        </div>
                      </div>
                    )}
                    <input
                      ref={bannerRef}
                      type="file"
                      className="form-control"
                      id="banner_image"
                      name="banner_image"
                      accept="image/*"
                    />
                    <div className="form-text small text-muted">
                      추천 사이즈: 1200x400 (jpg, png, gif 형식만 가능)
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="subject" className="col-sm-2 col-form-label bg-light">
                    <span className="req_mark">*</span> 설문 제목
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="subject"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="start_dt" className="col-sm-2 col-form-label bg-light">
                    <span className="req_mark">*</span> 설문 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="datetime-local"
                        id="start_dt"
                        className="form-control"
                        value={startDt}
                        onChange={(e) => setStartDt(e.target.value)}
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="datetime-local"
                        id="end_dt"
                        className="form-control"
                        value={endDt}
                        onChange={(e) => setEndDt(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="bg-transparent border-0"
                        onClick={() => {
                          setStartDt("");
                          setEndDt("");
                        }}
                      >
                        <i className="mdi mdi-delete-outline fs-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="max_people1" className="col-sm-2 col-form-label bg-light">
                    <span className="req_mark">*</span> 참여 인원 제한
                  </label>
                  <div className="col-sm-6 mt-1 d-flex align-items-center">
                    <div className="form-check form-check-inline mb-0">
                      <input
                        type="radio"
                        id="max_people1"
                        name="max_people"
                        className="form-check-input limit-radio"
                        value="0"
                        checked={maxPeopleRadio === "0"}
                        onChange={() => setMaxPeopleRadio("0")}
                        required
                        disabled={isLocked}
                      />
                      <label className="form-check-label" htmlFor="max_people1">
                        무제한
                      </label>
                    </div>
                    <div className="form-check form-check-inline d-inline-flex align-items-center gap-2">
                      <input
                        type="radio"
                        id="max_people2"
                        name="max_people"
                        className="form-check-input limit-radio"
                        value=""
                        checked={maxPeopleRadio === ""}
                        onChange={() => setMaxPeopleRadio("")}
                        required
                        disabled={isLocked}
                      />
                      <label className="form-check-label mb-0" htmlFor="max_people2">
                        최대
                      </label>
                      <input
                        type="number"
                        id="max_people3"
                        className="form-control w-auto d-inline-block"
                        style={{ maxWidth: "80px" }}
                        value={maxPeopleVal}
                        onChange={(e) => setMaxPeopleVal(e.target.value)}
                        disabled={isLocked}
                      />
                      <span className="text-center">명</span>
                    </div>
                  </div>
                </div>

                {/* legacy: d-none(숨김) */}
                <div className="mb-2 row d-none">
                  <label htmlFor="view_result1" className="col-sm-2 col-form-label bg-light">
                    <span className="req_mark">*</span> 참여완료 시 결과보기
                  </label>
                  <div className="col-sm-6 mt-1">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="view_result1"
                        name="view_result"
                        className="form-check-input"
                        value="Y"
                        checked={viewResult === "Y"}
                        onChange={() => setViewResult("Y")}
                        disabled={isModify}
                      />
                      <label className="form-check-label" htmlFor="view_result1">
                        제공
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="view_result2"
                        name="view_result"
                        className="form-check-input"
                        value="N"
                        checked={viewResult === "N"}
                        onChange={() => setViewResult("N")}
                        disabled={isModify}
                      />
                      <label className="form-check-label" htmlFor="view_result2">
                        미제공
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="point" className="col-sm-2 col-form-label bg-light">
                    참여 포인트
                  </label>
                  <div className="col-sm-2">
                    <input
                      type="number"
                      id="point"
                      className="form-control"
                      value={point}
                      onChange={(e) => setPoint(e.target.value)}
                      disabled={isModify}
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-light">진행상태</label>
                  <div className="col-sm-2">
                    <select
                      name="flag"
                      className="form-select"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                    >
                      <option value="Y">진행</option>
                      <option value="N">종료</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-header bg-secondary text-white fw-bold font-15">내용 설정</div>
              <fieldset
                className={`card-body${isLocked ? " disabled-target" : ""}`}
                disabled={isLocked}
              >
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-light text-center fw-bold">
                    <span className="text-danger">*</span> 설문항목
                  </label>
                  <div className="col-sm-10">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => addQuestion("obj")}
                    >
                      객관식 추가
                    </button>{" "}
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => addQuestion("sub")}
                    >
                      주관식 추가
                    </button>
                  </div>
                </div>

                <div id="surveyQuestionContainer" className="mt-3">
                  {questions.map((q, index) => (
                    <QuestionCard
                      key={q.key}
                      q={q}
                      itemNum={index + 1}
                      onUpdate={updateQuestion}
                      onDelete={deleteQuestion}
                      onMove={moveQuestion}
                      onClone={cloneQuestion}
                      onAddOption={addOption}
                      onRemoveOption={removeOption}
                      onSetOption={setOptionValue}
                      onAddEtc={addEtc}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="col-2 mx-auto mb-2">
              <a href={backLink} className="btn btn-secondary shadow-none">
                목록
              </a>{" "}
              <button type="submit" className="btn btn-primary shadow-none">
                {action}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

const QuestionCard = ({
  q,
  itemNum,
  onUpdate,
  onDelete,
  onMove,
  onClone,
  onAddOption,
  onRemoveOption,
  onSetOption,
  onAddEtc,
}: {
  q: Question;
  itemNum: number;
  onUpdate: (key: string, patch: Partial<Question>) => void;
  onDelete: (key: string) => void;
  onMove: (key: string, dir: -1 | 1) => void;
  onClone: (key: string) => void;
  onAddOption: (key: string) => void;
  onRemoveOption: (key: string, itemKey: string) => void;
  onSetOption: (key: string, itemKey: string, value: string) => void;
  onAddEtc: (key: string) => void;
}) => (
  <div className="card mb-3 shadow-sm question">
    <div className="card-header d-flex justify-content-between align-items-center bg-white py-2">
      <div className="d-flex align-items-center gap-3">
        <span className="fw-bold text-secondary">
          <b>
            <span className="item-num question-idx">{itemNum}</span>번 :{" "}
            {q.kind === "obj" ? "객관식" : "주관식"} 문항
          </b>
        </span>
        <div className="form-check mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id={`surveyQuestionRequired_${q.key}`}
            checked={q.required}
            onChange={(e) => onUpdate(q.key, { required: e.target.checked })}
          />
          <label
            className="form-check-label text-muted small"
            htmlFor={`surveyQuestionRequired_${q.key}`}
          >
            필수응답
          </label>
        </div>
      </div>
      <div className="btn-group btn-group-sm">
        <button
          type="button"
          className="btn btn-light border btn-xs"
          onClick={() => onMove(q.key, -1)}
        >
          위
        </button>
        <button
          type="button"
          className="btn btn-light border btn-xs"
          onClick={() => onMove(q.key, 1)}
        >
          아래
        </button>
        <button
          type="button"
          className="btn btn-light border btn-xs text-danger"
          onClick={() => onDelete(q.key)}
        >
          문항삭제
        </button>
        <button
          type="button"
          className="btn btn-light border btn-xs"
          onClick={() => onClone(q.key)}
        >
          문항복사
        </button>
      </div>
    </div>
    <div className="card-body p-0">
      <div className="row g-0 border-bottom align-items-center">
        <div className="col-sm-2 bg-light p-2 text-center small border-end fw-bold">응답방식</div>
        {q.kind === "obj" ? (
          <div className="col-sm-10 p-2 d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={`type_${q.key}`}
                id={`single_${q.key}`}
                checked={q.responseType === "radio"}
                onChange={() => onUpdate(q.key, { responseType: "radio" })}
              />
              <label className="form-check-label small" htmlFor={`single_${q.key}`}>
                1개 선택
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={`type_${q.key}`}
                id={`multi_${q.key}`}
                checked={q.responseType === "checkbox"}
                onChange={() => onUpdate(q.key, { responseType: "checkbox" })}
              />
              <label className="form-check-label small" htmlFor={`multi_${q.key}`}>
                여러 개 선택
              </label>
            </div>
          </div>
        ) : (
          <div className="col-sm-10 p-2">
            <div className="form-check">
              <input className="form-check-input" type="radio" checked readOnly />
              <label className="form-check-label small fw-bold text-primary">주관식</label>
            </div>
          </div>
        )}
      </div>
      <div className="row g-0 align-items-top">
        <div
          className="col-sm-2 bg-light p-2 text-center small border-end fw-bold pt-3"
          style={{ minHeight: q.kind === "obj" ? "120px" : "60px" }}
        >
          내용
        </div>
        <div className="col-sm-10 p-3">
          <input
            type="text"
            value={q.question}
            onChange={(e) => onUpdate(q.key, { question: e.target.value })}
            className={`form-control form-control-sm ${q.kind === "obj" ? "mb-2 " : ""}w-100`}
            placeholder="질문을 입력하세요"
            maxLength={200}
          />
          {q.kind === "obj" && (
            <>
              <div className="option-list">
                {q.items.map((it) => (
                  <div className="d-flex align-items-center gap-2 mb-1" key={it.key}>
                    <input type="radio" disabled className="form-check-input" />
                    <input
                      type="text"
                      value={it.value}
                      onChange={(e) => onSetOption(q.key, it.key, e.target.value)}
                      className="form-control form-control-sm w-50"
                      placeholder="옵션 입력"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      style={{ fontSize: "10px" }}
                      onClick={() => onRemoveOption(q.key, it.key)}
                    />
                  </div>
                ))}
                {q.etc && (
                  <div className="d-flex align-items-center gap-2 mb-1 etc-option">
                    <input type="radio" disabled className="form-check-input" />
                    <input
                      type="text"
                      className="form-control form-control-sm w-50 bg-light"
                      value="기타의견 (직접 입력)"
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      style={{ fontSize: "10px" }}
                      onClick={() => onUpdate(q.key, { etc: false })}
                    />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-white btn-sm border"
                  onClick={() => onAddOption(q.key)}
                >
                  추가
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-white btn-sm border"
                  onClick={() => onAddEtc(q.key)}
                >
                  기타의견 추가
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);
