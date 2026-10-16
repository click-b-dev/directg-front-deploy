import { useEffect } from "react";
import { useSurveyResult, type SurveyResultQuestion } from "@entities/survey";

export type SurveyResultSearch = { idx: number };

// legacy board/survey_result.php — 설문조사 결과보기(read-only).
export const SurveyResultScreen = ({ idx }: SurveyResultSearch) => {
  const { data } = useSurveyResult(idx);

  useEffect(() => {
    document.title = "설문조사 결과보기";
  }, []);

  if (!data) {
    return null;
  }

  return (
    <>
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
                <li className="breadcrumb-item active">설문조사 결과보기</li>
              </ol>
            </div>
            <h4 className="page-title">설문조사 결과보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <div className="card border border-1">
            <div className="card-header bg-secondary text-white fw-bold font-15">설문조사 요약</div>
            <div className="card-body">
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">설문 제목</label>
                <div className="col-sm-10 d-flex align-items-center">{data.subject}</div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">설문 기간</label>
                <div className="col-sm-10 d-flex align-items-center">
                  {data.start_dt} ~ {data.end_dt}
                </div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">참여제한</label>
                <div className="col-sm-10 d-flex align-items-center">
                  {data.max_people !== 0 ? `${data.max_people} 명` : "없음"}
                </div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">참여자현황</label>
                <div className="col-sm-10 d-flex align-items-center">
                  총 {data.survey_count} 명 (총 지급 포인트{" "}
                  {(data.survey_count * data.point).toLocaleString()})
                </div>
              </div>
            </div>

            <div className="card-header bg-secondary text-white fw-bold font-15">
              설문 상세결과
              <a
                href={`/board/survey_result_user?idx=${data.idx}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary shadow-none btn-sm font-12 ms-1"
              >
                계정별 결과
              </a>
            </div>
            <div className="card-body">
              {data.questions.map((q) => (
                <ResultQuestion key={q.idx} q={q} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ResultQuestion = ({ q }: { q: SurveyResultQuestion }) => (
  <div className="mb-2 row">
    <label className="col-sm-12 col-form-label bg-light">
      {q.number + 1}. {q.question}
    </label>
    <div className="m-1">
      {q.type === "descript" ? (
        <a
          href={`/board/survey_result_etc?idx=${q.idx}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-secondary btn-sm font-12"
        >
          답변 보기
        </a>
      ) : (
        <>
          {q.items.map((item) => (
            <span key={item.number}>
              {item.number}. {item.item} - {item.cnt} 명
              <br />
            </span>
          ))}
          {q.etc === 1 && (
            <>
              기타 - {q.etc_cnt} 명{" "}
              <a
                href={`/board/survey_result_etc?idx=${q.idx}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-sm font-12"
              >
                답변 보기
              </a>
            </>
          )}
        </>
      )}
    </div>
  </div>
);
