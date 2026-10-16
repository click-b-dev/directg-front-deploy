import {
  useMemberPointList,
  MEMBER_LEVEL_LABEL,
  type MemberPointListSearch,
  type MemberPointLogItem,
} from "@entities/member";
import { ServerPagination } from "@shared/ui";
import "./member-point-list.css";

const BASE_URL = "/member/member_point_list";
const PER_PAGE = 50;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/member_point_list.php — 포인트 지급/차감 내역(검색 + 지급/차감 필터).
export const MemberPointListScreen = (search: MemberPointListSearch) => {
  const { data } = useMemberPointList(search);

  const paginationParams: Record<string, string> = {};
  if (search.search_type !== "") paginationParams.search_type = search.search_type;
  if (search.search_value !== "") paginationParams.search_value = search.search_value;
  if (search.emoney_type !== "" && search.emoney_type !== "all")
    paginationParams.emoney_type = search.emoney_type;

  if (!data) {
    return null;
  }

  const { items, pagination, total_all } = data;
  const emoneyValue = search.emoney_type || "all";

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
                    회원관리
                  </a>
                </li>
                <li className="breadcrumb-item active">포인트 지급/차감 내역</li>
              </ol>
            </div>
            <h4 className="page-title">포인트 지급/차감 내역</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
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
                        defaultValue={search.search_type || "tm.m_id"}
                      >
                        <option value="tm.m_id">아이디</option>
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
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">지급/차감구분</label>
                    <div className="col-sm-6 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="emoney_type1"
                          name="emoney_type"
                          className="form-check-input"
                          value="all"
                          defaultChecked={emoneyValue === "all"}
                        />
                        <label className="form-check-label" htmlFor="emoney_type1">
                          전체
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="emoney_type2"
                          name="emoney_type"
                          className="form-check-input"
                          value="+"
                          defaultChecked={emoneyValue === "+"}
                        />
                        <label className="form-check-label" htmlFor="emoney_type2">
                          지급
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="emoney_type3"
                          name="emoney_type"
                          className="form-check-input"
                          value="-"
                          defaultChecked={emoneyValue === "-"}
                        />
                        <label className="form-check-label" htmlFor="emoney_type3">
                          차감
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
                      회원 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">
          검색 : {nf(pagination.total_results)}건 / 전체 : {nf(total_all)} 건
        </div>
      </div>

      <div className="row member-point-table">
        <div className="col-12 table-responsive">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">아이디</th>
                <th className="text-center">회원등급</th>
                <th className="text-center">구분</th>
                <th className="text-center">지급/차감액</th>
                <th className="text-center">지급/차감일</th>
                <th className="text-center">처리자</th>
                <th className="text-center">사유</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {items.map((item, num) => (
                <MemberPointRow
                  key={item.sno}
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

const MemberPointRow = ({ item, rowNo }: { item: MemberPointLogItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">
      <a href={`/member/member_point_form?search_type=tm.m_id&search_value=${item.m_id}`}>
        {item.m_id}
      </a>
    </td>
    <td className="text-center">{MEMBER_LEVEL_LABEL[item.mem_level] ?? ""}</td>
    <td className="text-center">
      {item.emoney_type === "+" ? (
        <strong className="text-primary">지급</strong>
      ) : (
        <strong className="text-danger">차감</strong>
      )}
    </td>
    <td className="text-center">{nf(item.emoney)} 원</td>
    <td className="text-center">{item.regdt}</td>
    <td className="text-center">{item.admin_id}</td>
    <td className="text-center">{item.memo}</td>
  </tr>
);
