import { useEffect } from "react";
import { useEtcAnswerList, fetchEtcAnswersAll } from "@entities/survey";
import { ServerPagination } from "@shared/ui";

export type SurveyResultEtcSearch = { idx: number; page: number };

const BASE_URL = "/board/survey_result_etc";

// fputcsv 근사: 특수문자 포함 시 큰따옴표 감싸고 " → "" escape.
const csvField = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const yyyymmdd = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

// legacy board/survey_result_etc.php — 설문조사 '기타' 결과보기(+CSV).
export const SurveyResultEtcScreen = ({ idx, page }: SurveyResultEtcSearch) => {
  const { data } = useEtcAnswerList(idx, page);

  useEffect(() => {
    document.title = "설문조사 '기타' 결과보기";
  }, []);

  if (!data) {
    return null;
  }

  // legacy: answer_all_count 0이면 total_results로 대체
  const answerAllCount = data.answer_all_count === 0 ? data.total_results : data.answer_all_count;
  // legacy: 첫 행 answer === NULL(주관식)일 때만 CSV 버튼
  const showCsv = data.items.length > 0 && data.items[0].answer === null;
  const baseNum = data.total_results - (page - 1) * 50;

  const handleCsvDownload = async () => {
    // legacy: total_results>0면 다운로드, 아니면 alert
    if (data.total_results <= 0) {
      window.alert("검색결과가 있는 경우만 가능합니다.");
      return;
    }
    const all = await fetchEtcAnswersAll(idx);
    const bom = "﻿";
    const body = all.items
      .map((r) => `${csvField(r.answer_text)},${csvField(r.m_id)}`)
      .join("\r\n");
    const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `설문조사결과_${yyyymmdd()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
                <li className="breadcrumb-item active">설문조사 &apos;기타&apos; 결과보기</li>
              </ol>
            </div>
            <h4 className="page-title">설문조사 &apos;기타&apos; 결과보기</h4>
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
                <div className="col-sm-10 d-flex align-items-center">{data.question}</div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">내용 有 / 총 인원</label>
                <div className="col-sm-10 d-flex align-items-center">
                  {data.total_results} / {answerAllCount} 명
                </div>
              </div>
            </div>

            <div className="card-header bg-secondary text-white fw-bold font-15">설문 응답결과</div>
            <div className="card-body">
              {showCsv && (
                <div className="mb-2">
                  <button
                    type="button"
                    className="btn btn-light shadow-none border"
                    id="btn_excel_download"
                    onClick={handleCsvDownload}
                  >
                    <i className="mdi mdi-microsoft-excel font-16" /> CSV 다운로드
                  </button>
                </div>
              )}
              <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">번호</th>
                    <th className="text-center">답변내용</th>
                    <th className="text-center">답변회원ID</th>
                  </tr>
                </thead>
                <tbody className="font-12 bg-white">
                  {data.items.map((item, i) => (
                    <tr key={`${item.m_id}-${i}`}>
                      <td className="text-center">{baseNum - i}</td>
                      <td className="text-center">{item.answer_text}</td>
                      <td className="text-center">{item.m_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-center mt-3">
                <ServerPagination
                  page={data.pagination.current_page}
                  totalPages={data.pagination.total_pages}
                  baseUrl={BASE_URL}
                  params={{ idx }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
