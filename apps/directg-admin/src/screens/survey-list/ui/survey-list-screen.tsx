import { useSurveyList, type SurveyListSearch, type SurveyListItem } from "@entities/survey";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/survey_list";

// legacy board/survey_list.php — 설문조사 목록.
export const SurveyListScreen = (search: SurveyListSearch) => {
  const { data } = useSurveyList(search);
  if (!data) {
    return null;
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const baseNum = data.pagination.total_results - (data.pagination.current_page - 1) * 20;

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
                <li className="breadcrumb-item active">설문조사 목록</li>
              </ol>
            </div>
            <h4 className="page-title">설문조사 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 start */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        검색어
                      </label>
                      <div className="col-sm-3">
                        <select
                          className="form-control"
                          name="search_type"
                          id="search_type"
                          defaultValue={search.search_type || "ts.subject"}
                        >
                          <option value="ts.subject">제목</option>
                        </select>
                      </div>
                      <div className="col-sm-6 ps-0">
                        <input
                          type="text"
                          className="form-control"
                          id="search_value"
                          name="search_value"
                          placeholder="검색어"
                          defaultValue={search.search_value}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* 검색필터 end */}

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
        <div className="float-end">
          <a href="/board/survey_register" className="btn btn-danger">
            설문조사 등록
          </a>
        </div>
      </div>

      {/* 테이블 start */}
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">이미지</th>
                <th className="text-center">설문제목</th>
                <th className="text-center">등록일</th>
                <th className="text-center">진행기간</th>
                <th className="text-center">참여대상</th>
                <th className="text-center">진행상태</th>
                <th className="text-center">미리보기</th>
                <th className="text-center">결과보기</th>
                <th className="text-center">수정</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item, i) => (
                <SurveyRow key={item.idx} item={item} num={baseNum - i} now={now} search={search} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{ search_type: search.search_type, search_value: search.search_value }}
            />
          </div>
        </div>
      </div>
      {/* 테이블 end */}
    </>
  );
};

const SurveyRow = ({
  item,
  num,
  now,
  search,
}: {
  item: SurveyListItem;
  num: number;
  now: string;
  search: SurveyListSearch;
}) => {
  // legacy: 미리보기 가능 시간(현재+1시간) + 시크릿키.
  const validUntil = Math.floor(Date.now() / 1000) + 3600;
  const secretKey = "admin-survey";
  const periodDanger = item.end_dt < now || item.start_dt > now;
  const editParams = new URLSearchParams({
    idx: String(item.idx),
    mode: "update",
    search_type: search.search_type,
    search_value: search.search_value,
    page: String(search.page),
  }).toString();

  return (
    <tr>
      <td className="text-center">{num}</td>
      <td className="text-center">
        {item.banner_image && (
          <img
            src={`https://directg.net${item.banner_image}`}
            alt="배너"
            style={{ maxWidth: "100px" }}
          />
        )}
      </td>
      <td className="text-center">{item.subject}</td>
      <td className="text-center">{item.reg_dt}</td>
      <td className={`text-center${periodDanger ? " text-danger" : ""}`}>
        {item.start_dt} ~ {item.end_dt}
      </td>
      <td className="text-center">
        {item.cnt} / {item.max_people === 0 ? "무제한" : item.max_people}
      </td>
      <td className="text-center">
        <b>{item.flag === "Y" ? "진행" : "종료"}</b>
      </td>
      <td className="text-center">
        <a
          href={`/event/survey.html?idx=${item.idx}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-secondary btn-sm font-12"
        >
          PC
        </a>{" "}
        <a
          href={`${window.location.protocol}//m.${window.location.host}/event/survey.html?idx=${item.idx}&expires=${validUntil}&key=${secretKey}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-secondary btn-sm font-12"
        >
          MOBILE
        </a>
      </td>
      <td className="text-center">
        <a
          href={`/board/survey_result?idx=${item.idx}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-secondary btn-sm font-12"
        >
          결과보기
        </a>
      </td>
      <td className="text-center">
        <a
          href={`/board/survey_register?${editParams}`}
          className="btn btn-outline-secondary btn-sm font-12"
        >
          수정
        </a>
      </td>
    </tr>
  );
};
