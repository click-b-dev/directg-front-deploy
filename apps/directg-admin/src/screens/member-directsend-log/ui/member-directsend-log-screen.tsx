import {
  useDirectSendMailLog,
  MAIL_GUBUN_LABEL,
  MAIL_STATE_LABEL,
  type DirectSendMailLogSearch,
  type DirectSendMailLogItem,
} from "@entities/member";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/member/directsend_mail_log";
const PER_PAGE = 50;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/directsend_mail_log.php — 자동메일발송 로그(발송구분/결과/대상 필터).
export const MemberDirectSendLogScreen = (search: DirectSendMailLogSearch) => {
  const { data } = useDirectSendMailLog(search);

  const paginationParams: Record<string, string> = {};
  if (search.gubun !== "" && search.gubun !== "all") paginationParams.gubun = search.gubun;
  if (search.failed !== "" && search.failed !== "all") paginationParams.failed = search.failed;
  if (search.search_type !== "") paginationParams.search_type = search.search_type;
  if (search.search_value !== "") paginationParams.search_value = search.search_value;

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

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
                    회원
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    자동메일 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자동메일발송 로그</li>
              </ol>
            </div>
            <h4 className="page-title">자동메일발송 로그</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                      <div className="col-sm-3">
                        <select
                          className="form-control"
                          name="search_type"
                          id="search_type"
                          defaultValue={search.search_type || "tea.email"}
                        >
                          <option value="tea.email">발송대상</option>
                        </select>
                      </div>
                      <div className="col-sm-6">
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

                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">발송구분</label>
                      <div className="col-sm-9 mt-1">
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="gubun1"
                            name="gubun"
                            className="form-check-input"
                            value=""
                            defaultChecked={search.gubun === "" || search.gubun === "all"}
                          />
                          <label className="form-check-label" htmlFor="gubun1">
                            전체
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="gubun2"
                            name="gubun"
                            className="form-check-input"
                            value="join"
                            defaultChecked={search.gubun === "join"}
                          />
                          <label className="form-check-label" htmlFor="gubun2">
                            가입인증
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="gubun3"
                            name="gubun"
                            className="form-check-input"
                            value="password"
                            defaultChecked={search.gubun === "password"}
                          />
                          <label className="form-check-label" htmlFor="gubun3">
                            비밀번호찾기
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="gubun4"
                            name="gubun"
                            className="form-check-input"
                            value="qna"
                            defaultChecked={search.gubun === "qna"}
                          />
                          <label className="form-check-label" htmlFor="gubun4">
                            문의답변
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">발송결과</label>
                      <div className="col-sm-9 mt-1">
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="failed1"
                            name="failed"
                            className="form-check-input"
                            value=""
                            defaultChecked={search.failed === "" || search.failed === "all"}
                          />
                          <label className="form-check-label" htmlFor="failed1">
                            전체
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="failed2"
                            name="failed"
                            className="form-check-input"
                            value="0"
                            defaultChecked={search.failed === "0"}
                          />
                          <label className="form-check-label" htmlFor="failed2">
                            성공
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="failed3"
                            name="failed"
                            className="form-check-input"
                            value="1"
                            defaultChecked={search.failed === "1"}
                          />
                          <label className="form-check-label" htmlFor="failed3">
                            실패
                          </label>
                        </div>
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

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
      </div>

      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">발송유형</th>
                <th className="text-center">발송구분</th>
                <th className="text-center">발송대상</th>
                <th className="text-center">발송일시</th>
                <th className="text-center">발송결과</th>
                <th className="text-center">발송실패</th>
                <th className="text-center">상태</th>
                <th className="text-center" style={{ width: "150px" }}>
                  오류내용
                </th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {items.map((item, num) => (
                <MailLogRow
                  key={`${item.email}-${item.reg_date}-${num}`}
                  item={item}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                  }
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const MailLogRow = ({ item, rowNo }: { item: DirectSendMailLogItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">DirectSend API</td>
    <td className="text-center">{MAIL_GUBUN_LABEL[item.gubun] ?? ""}</td>
    <td className="text-center">{item.email}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">{item.result}</td>
    <td className="text-center">{item.failed !== 0 ? "실패" : ""}</td>
    <td className="text-center">{MAIL_STATE_LABEL[item.state] ?? ""}</td>
    <td className="text-center">{item.smtp_msg}</td>
  </tr>
);
