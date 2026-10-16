import { useEffect } from "react";
import { useSurveyUserResult, type SurveyUserResultSearch } from "@entities/survey";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/survey_result_user";

// legacy board/survey_result_user.php — 설문조사 '사용자별' 결과보기(read-only 매트릭스).
export const SurveyResultUserScreen = (search: SurveyUserResultSearch) => {
  const { data } = useSurveyUserResult(search);

  useEffect(() => {
    document.title = "설문조사 '사용자별' 결과보기";
  }, []);

  if (!data) {
    return null;
  }

  const baseNum = data.pagination.total_results - (search.page - 1) * 50;

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
                <li className="breadcrumb-item active">설문조사 &apos;사용자별&apos; 결과보기</li>
              </ol>
            </div>
            <h4 className="page-title">설문조사 &apos;사용자별&apos; 결과보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
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

            <div className="card-header bg-secondary text-white fw-bold font-15">설문 응답결과</div>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <input type="hidden" name="idx" value={search.idx} />
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label
                        htmlFor="search_value"
                        className="col-sm-2 col-form-label bg-light border"
                      >
                        검색어
                      </label>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          className="form-control"
                          id="search_value"
                          name="search_value"
                          placeholder="회원ID"
                          defaultValue={search.search_value}
                        />
                      </div>
                      <div className="col-sm-2 ps-0">
                        <button type="submit" className="btn btn-primary shadow-none">
                          검색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="table-container" style={{ width: "100%", overflowX: "auto" }}>
                <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">회원ID</th>
                      {data.columns.map((col) => (
                        <th className="text-center" key={col.id}>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm font-12"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            data-bs-custom-class="custom-tooltip"
                            data-bs-title={col.tooltip}
                            title={col.tooltip}
                          >
                            {col.label}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-12 bg-white">
                    {data.rows.map((row, i) => (
                      <tr key={`${row.m_id}-${i}`}>
                        <td className="text-center">{baseNum - i}</td>
                        <td className="text-center">{row.m_id}</td>
                        {row.values.map((value, ci) => (
                          <td className="text-center" key={data.columns[ci]?.id ?? ci}>
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-3">
                <ServerPagination
                  page={data.pagination.current_page}
                  totalPages={data.pagination.total_pages}
                  baseUrl={BASE_URL}
                  params={{ idx: search.idx, search_value: search.search_value }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
