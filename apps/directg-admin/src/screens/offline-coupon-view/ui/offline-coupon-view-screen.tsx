import { useNavigate } from "@tanstack/react-router";
import {
  useOfflineCouponUsed,
  type OfflineCouponViewSearch,
  type OfflineCouponUsedItem,
} from "@entities/promotion";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/promotion/offline_coupon_view";

// legacy promotion/offline_coupon_view.php — 오프라인 쿠폰 상세(기본정보 + 사용현황).
export const OfflineCouponViewScreen = (search: OfflineCouponViewSearch) => {
  const navigate = useNavigate();
  const { data } = useOfflineCouponUsed(search);

  if (!data) {
    return null;
  }

  const { info } = data;
  const { total_results: total, current_page: page } = data.pagination;

  const goList = () =>
    navigate({
      to: "/promotion/offline_coupon_list",
      search: { page: 1, search_type: "", search_value: "" },
    });

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
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    오프라인 쿠폰 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">오프라인 쿠폰 상세</li>
              </ol>
            </div>
            <h4 className="page-title">오프라인 쿠폰 상세</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 기본정보 (읽기전용) */}
      <div className="row">
        <div className="col-8">
          <div className="card border border-1">
            <div className="card-header bg-secondary text-white fw-bold font-15">
              오프라인 쿠폰 기본정보
            </div>
            <div className="card-body">
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">* 쿠폰명</label>
                <div className="col-sm-6 d-flex align-items-center">{info.coupon_name}</div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">* 쿠폰 사유</label>
                <div className="col-sm-6 d-flex align-items-center">{info.reason}</div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">* 쿠폰 발행 수량</label>
                <div className="col-sm-6 d-flex align-items-center">{info.issue_limit_cnt} 장</div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">* 쿠폰 사용기간</label>
                <div className="col-sm-6 d-flex align-items-center">
                  {info.sdate} ~ {info.edate}
                </div>
              </div>
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label bg-light">* 쿠폰 사용처</label>
                <div className="col-sm-6 d-flex align-items-center">{info.partner}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-title-box">
        <h4 className="page-title fs-5 lh-1">오프라인 쿠폰 사용현황</h4>
      </div>

      {/* 회원아이디 검색 */}
      <div className="row" style={{ margin: "10px 0 10px 0" }}>
        <form
          method="get"
          action={BASE_URL}
          style={{ paddingLeft: 0, display: "flex", alignItems: "center", gap: "5px" }}
        >
          <input type="hidden" name="sno" value={search.sno} />
          <input
            type="text"
            className="form-control"
            id="searchTitle"
            name="searchTitle"
            placeholder="회원아이디"
            defaultValue={search.searchTitle}
            style={{ width: "200px", display: "inline-block" }}
          />
          <button type="submit" className="btn btn-primary shadow-none">
            검색
          </button>
        </form>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{total.toLocaleString()} 건</div>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover table-centered w-100 dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">쿠폰번호</th>
                  <th className="text-center">아이디</th>
                  <th className="text-center">사용일자</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {data.items.map((item, index) => (
                  <UsedRow key={item.number} item={item} no={total - (index + (page - 1) * 20)} />
                ))}
              </tbody>
            </table>
            <div className="text-center mt-3">
              <ServerPagination
                page={page}
                totalPages={data.pagination.total_pages}
                baseUrl={BASE_URL}
                params={{ sno: search.sno, searchTitle: search.searchTitle }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="col-2 mx-auto mb-2">
        <button type="button" className="btn btn-secondary shadow-none" onClick={goList}>
          목록
        </button>
      </div>
    </>
  );
};

const UsedRow = ({ item, no }: { item: OfflineCouponUsedItem; no: number }) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{item.number}</td>
    <td className="text-center">{item.m_id}</td>
    <td className="text-center">{item.regdt}</td>
  </tr>
);
