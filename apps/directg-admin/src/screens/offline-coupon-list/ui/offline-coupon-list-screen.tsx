import {
  useOfflineCouponList,
  type OfflineCouponListSearch,
  type OfflineCouponListItem,
} from "@entities/promotion";
import { ServerPagination } from "@shared/ui";
import { env } from "@shared/config/env";

const BASE_URL = "/promotion/offline_coupon_list";

// legacy code_type_arr / status_arr.
const CODE_TYPE_LABELS: Record<string, string> = {
  DOWNLOAD: "다운로드",
  STATIC: "지정코드",
  DYNAMIC: "난수코드",
};
const STATUS_LABELS: Record<number, string> = {
  0: "발급대기",
  1: "발급중",
  2: "일시정지",
  3: "발급종료",
};

// legacy date("Y-m-d H:i:s") — 만료 판정용.
const nowString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// legacy promotion/offline_coupon_list.php — 오프라인 쿠폰 리스트(읽기 목록 + 검색).
export const OfflineCouponListScreen = (search: OfflineCouponListSearch) => {
  const { data } = useOfflineCouponList(search);

  if (!data) {
    return null;
  }

  const { total_results: total, current_page: page } = data.pagination;
  const now = nowString();

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
                <li className="breadcrumb-item active">오프라인 쿠폰 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">오프라인 쿠폰 리스트</h4>
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
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        검색어
                      </label>
                      <div className="col-sm-3">
                        <select
                          className="form-control"
                          name="search_type"
                          id="search_type"
                          defaultValue={search.search_type}
                        >
                          <option value="toc.coupon_name">쿠폰명</option>
                          <option value="toc.partner">사용처</option>
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
        <div className="float-start">{total.toLocaleString()} 개</div>
      </div>

      {/* 테이블 */}
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">쿠폰명</th>
                <th className="text-center">등록일</th>
                <th className="text-center">사용처</th>
                <th className="text-center">사용기간</th>
                <th className="text-center">적립금</th>
                <th className="text-center">발급유형</th>
                <th className="text-center">발급수</th>
                <th className="text-center">사용수</th>
                <th className="text-center">발급상태</th>
                <th className="text-center">발급내역관리</th>
                <th className="text-center">코드</th>
                <th className="text-center">수정</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item, index) => (
                <OfflineCouponRow
                  key={item.sno}
                  item={item}
                  no={total - (index + (page - 1) * 20)}
                  expired={item.edate < now}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_type: search.search_type,
                search_value: search.search_value,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const OfflineCouponRow = ({
  item,
  no,
  expired,
}: {
  item: OfflineCouponListItem;
  no: number;
  expired: boolean;
}) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{item.coupon_name}</td>
    <td className="text-center">{item.regdt}</td>
    <td className="text-center">{item.partner}</td>
    <td className={`text-center${expired ? " text-danger" : ""}`}>
      {item.sdate} ~ {item.edate}
    </td>
    <td className="text-center">
      {item.coupon_price.toLocaleString()} {item.currency}
    </td>
    <td className="text-center">{CODE_TYPE_LABELS[item.code_type]}</td>
    <td className="text-end">{item.issue_limit_cnt.toLocaleString()}</td>
    <td className="text-end">{item.use_count.toLocaleString()}</td>
    <td className="text-center">{STATUS_LABELS[item.status]}</td>
    <td className="text-center">
      <a
        href={`/promotion/offline_coupon_view?sno=${item.sno}`}
        className="btn btn-outline-secondary btn-sm font-12"
      >
        사용현황
      </a>
    </td>
    <td className="text-center">
      <a
        href={`${env.apiBaseUrl}/admin/promotion/offline-coupons/${item.sno}/download`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline-secondary btn-sm font-12"
      >
        다운로드
      </a>
    </td>
    <td className="text-center">
      <a
        href={`/promotion/offline_coupon_register?sno=${item.sno}&mode=update`}
        className="btn btn-outline-secondary btn-sm font-12"
      >
        수정
      </a>
    </td>
  </tr>
);
