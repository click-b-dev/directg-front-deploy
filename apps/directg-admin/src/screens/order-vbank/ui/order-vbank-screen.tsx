import {
  useOrderVbank,
  resolveOrderVbankSearch,
  getCheckoutStatusLabel,
  type OrderVbankSearch,
  type OrderVbankItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_vbank";

const nf = (n: number) => n.toLocaleString("en-US");
const pad = (n: number) => String(n).padStart(2, "0");
const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const nowYmdHis = () => {
  const d = new Date();
  return `${todayYmd()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// legacy: payco면 va_date(Y-m-d)를 오늘 날짜와, 그 외(kcp)면 va_date(Y-m-d H:i:s)를 현재 시각과 비교.
// zero-padded 문자열 사전순 비교 = 시간 비교와 동치.
const isVbankExpired = (item: OrderVbankItem) =>
  item.pg_provider === "payco" ? item.va_date < todayYmd() : item.va_date < nowYmdHis();

// legacy pc/_Admin_/order/order_vbank.php — 가상계좌 리스트(결제 관리 v2, tbl_order⋈kcp_log⋈payco_log step='1').
export const OrderVbankScreen = (search: OrderVbankSearch) => {
  // order_vbank.php: 날짜 기본 시작 -1개월 + settle_no/m_id 우선 기간무시.
  const resolved = resolveOrderVbankSearch(search);
  const { data } = useOrderVbank(resolved);

  // 페이지네이션은 raw 검색값 유지. legacy $param(=$_GET, page 제외).
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_settle_no", search.search_settle_no);
  addP("search_m_id", search.search_m_id);
  addP("search_start_date", search.search_start_date);
  addP("search_end_date", search.search_end_date);
  addP("date_label", search.date_label);

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
                    주문
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">가상계좌 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">가상계좌 리스트</h4>
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
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_settle_no"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      결제번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_settle_no"
                        name="search_settle_no"
                        placeholder="결제번호"
                        defaultValue={search.search_settle_no}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_m_id"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      회원아이디
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_m_id"
                        name="search_m_id"
                        placeholder="회원아이디(이메일)"
                        defaultValue={search.search_m_id}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label className="col-sm-1 col-form-label bg-light border">기간검색</label>
                    <DateRangePicker
                      startName="search_start_date"
                      endName="search_end_date"
                      labelName="date_label"
                      initialStart={resolved.search_start_date}
                      initialEnd={resolved.search_end_date}
                      initialLabel={resolved.date_label}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      결제내역 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end"></div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light">
              <tr>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문자</th>
                <th className="text-center">주문IP</th>
                <th className="text-center">결제금액</th>
                <th className="text-center">결제상태</th>
                <th className="text-center">마감시각</th>
                <th className="text-center">결제플랫폼</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item) => (
                <OrderVbankRow key={item.settle_no} item={item} />
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

const OrderVbankRow = ({ item }: { item: OrderVbankItem }) => (
  <tr>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">
      {/* legacy order_view.php?settle_no= — 미이관 링크 */}
      <a href={`order_view.php?settle_no=${item.settle_no}`}>{item.settle_no}</a>
    </td>
    <td>{item.m_id}</td>
    <td className="text-center">{item.ip}</td>
    <td className="text-end">{nf(item.total_price)}</td>
    <td className="text-center">
      {item.step === "8" ? "취소요청" : getCheckoutStatusLabel(item.step)}
    </td>
    <td className={`text-center${isVbankExpired(item) ? " text-danger" : ""}`}>{item.va_date}</td>
    <td className="text-center">{item.is_mobile === "Y" ? "모바일" : "PC"}</td>
  </tr>
);
