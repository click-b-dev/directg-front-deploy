import { useEventPointList, type EventPointSearch, type EventPointItem } from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_point_list";

// legacy date('Y-m-d H:i:s') — now를 문자열로(사전식=시간순 비교, PHP 문자열 비교와 동일).
const nowString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
};

// legacy 진행상태 컬럼 로직 그대로.
const progressLabel = (item: EventPointItem, now: string) => {
  if (item.end_dt >= now && item.start_dt <= now) {
    return "진행중";
  }
  if (item.end_dt < now) {
    return "종료";
  }
  return "진행예정";
};

// legacy 추가 포인트 정보: repay_type=="%"면 "주문금액의 {point} %", else "{number_format} {type}".
const repayInfo = (item: EventPointItem) =>
  item.repay_type === "%"
    ? `주문금액의 ${item.repay_point} %`
    : `${item.repay_point.toLocaleString()} ${item.repay_type}`;

// legacy event_point_list.php — 포인트 지급 이벤트.
export const EventPointListScreen = (search: EventPointSearch) => {
  const { data } = useEventPointList(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;
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
                    이벤트
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    추가 포인트 지급 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">포인트 지급 이벤트</li>
              </ol>
            </div>
            <h4 className="page-title">포인트 지급 이벤트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-lg-5 mb-2">
                  <div className="input-group row">
                    {/* legacy quirk: search_key는 선택 유지 안 됨(항상 첫 옵션 표시) */}
                    <select className="form-select col-sm-3" name="search_key" id="search_key">
                      <option value="search_name">옵션상품명</option>
                      <option value="search_product_code">옵션상품명코드</option>
                    </select>
                    <div className="col-sm-9">
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
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_flag"
                      className="col-sm-5 col-form-label-sm bg-light border font-14 px-1"
                    >
                      추가 포인트 지급여부
                    </label>
                    <div className="col-sm-7">
                      {[
                        { id: "search_flag_y", value: "Y", label: "예" },
                        { id: "search_flag_n", value: "N", label: "아니오" },
                      ].map((opt) => (
                        <div className="form-check form-check-inline mt-1" key={opt.id}>
                          <input
                            type="radio"
                            id={opt.id}
                            name="search_flag"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={search.search_flag === opt.value}
                          />
                          <label className="form-check-label font-14" htmlFor={opt.id}>
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_status"
                      className="col-sm-3 col-form-label-sm bg-light border font-14 px-1"
                    >
                      진행상태
                    </label>
                    <div className="col-sm-9">
                      {[
                        { id: "search_status_1", value: "upcoming", label: "진행예정" },
                        { id: "search_status_2", value: "ing", label: "진행중" },
                        { id: "search_status_3", value: "end", label: "종료" },
                      ].map((opt) => (
                        <div className="form-check form-check-inline mt-1" key={opt.id}>
                          <input
                            type="radio"
                            id={opt.id}
                            name="search_status"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={search.search_status === opt.value}
                          />
                          <label className="form-check-label font-14" htmlFor={opt.id}>
                            {opt.label}
                          </label>
                        </div>
                      ))}
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

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{total_results.toLocaleString()} 개</div>
          </div>

          <div className="table-responsive">
            <table className="table table-centered w-100 nowrap table-sm bg-white table-bordered">
              <colgroup>
                <col width="3%" />
                <col width="*" />
                <col width="10%" />
                <col width="20%" />
                <col width="10%" />
                <col width="10%" />
              </colgroup>
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">옵션상품정보</th>
                  <th className="text-center">추가 포인트 지급여부</th>
                  <th className="text-center">추가 포인트 지급기간</th>
                  <th className="text-center">추가 포인트 정보</th>
                  <th className="text-center">진행상태</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {data.items.map((item) => (
                  <PointRow key={item.idx} item={item} now={now} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={current_page}
              totalPages={total_pages}
              baseUrl={BASE_URL}
              params={{
                search_flag: search.search_flag,
                search_status: search.search_status,
                search_key: search.search_key,
                search_value: search.search_value,
              }}
            />
          </div>
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const PointRow = ({ item, now }: { item: EventPointItem; now: string }) => (
  <tr>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-start px-1">
      [{item.product_code}] {item.product_name}
    </td>
    <td className="text-center px-1">{item.repay_flag}</td>
    <td className="text-center px-1">
      {item.start_dt} ~ {item.end_dt}
    </td>
    <td className="text-center px-1">{repayInfo(item)}</td>
    <td className="text-center px-1">{progressLabel(item, now)}</td>
  </tr>
);
