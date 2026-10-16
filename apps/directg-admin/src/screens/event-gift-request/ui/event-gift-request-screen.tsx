import {
  useEventGiftRequest,
  EVENT_GIFT_STATUS,
  type EventGiftRequestSearch,
  type EventGiftRequestItem,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";
import { openDeliveryTracking } from "@shared/lib/delivery-tracking";

const BASE_URL = "/event/event_gift_request";
const PER_PAGE = 30;

// legacy event_gift_request.php — 사은품 발송 현황.
export const EventGiftRequestScreen = (search: EventGiftRequestSearch) => {
  const { data } = useEventGiftRequest(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;
  // legacy: total_results-(page-1)*30-num (num 0부터 증가) → 내림차순.
  const startNum = total_results - (current_page - 1) * PER_PAGE;

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
                    사은품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">사은품 발송 현황</li>
              </ol>
            </div>
            <h4 className="page-title">사은품 발송 현황</h4>
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
                      <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                      <div className="col-sm-3">
                        <select
                          className="form-control"
                          name="search_type"
                          id="search_type"
                          defaultValue={search.search_type || "tegm.m_id"}
                        >
                          <option value="tegm.m_id">회원아이디</option>
                          <option value="tegm.tracking_no">송장번호</option>
                          <option value="tegm.receiver">수신인</option>
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
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">상태</label>
                      <div className="col-sm-6 mt-1">
                        {[
                          { id: "status1", value: "all", label: "전체" },
                          { id: "status2", value: "1", label: "배송지입력" },
                          { id: "status3", value: "2", label: "발송완료" },
                        ].map((opt) => (
                          <div className="form-check form-check-inline" key={opt.id}>
                            <input
                              type="radio"
                              id={opt.id}
                              name="status"
                              className="form-check-input"
                              value={opt.value}
                              defaultChecked={(search.status || "all") === opt.value}
                            />
                            <label className="form-check-label" htmlFor={opt.id}>
                              {opt.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label
                        htmlFor="event_gift_idx"
                        className="col-sm-3 col-form-label bg-light border"
                      >
                        이벤트/사은품 명
                      </label>
                      <div className="col-sm-9">
                        <select
                          id="event_gift_idx"
                          name="event_gift_idx"
                          className="form-select select2"
                          data-toggle="select2"
                          defaultValue={search.event_gift_idx}
                        >
                          <option value="">:::선택:::</option>
                          {data.event_gift_options.map((opt) => (
                            <option value={opt.idx} key={opt.idx}>
                              {opt.title} / {opt.gift_nm}
                            </option>
                          ))}
                        </select>
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

      <div className="d-flex flex-row justify-content-between mb-2 align-items-center">
        <div className="float-start text-center">{total_results.toLocaleString()} 개</div>
      </div>

      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <colgroup>
              <col style={{ width: "3%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">이벤트명</th>
                <th className="text-center">사은품명</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">회원명</th>
                <th className="text-center">생년월일</th>
                <th className="text-center">휴대폰번호</th>
                <th className="text-center">수신인</th>
                <th className="text-center">주소</th>
                <th className="text-center">배송지입력일자</th>
                <th className="text-center">상태</th>
                <th className="text-center">송장번호</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item, index) => (
                <RequestRow key={`${item.m_id}-${index}`} item={item} num={startNum - index} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={current_page}
              totalPages={total_pages}
              baseUrl={BASE_URL}
              params={{
                search_type: search.search_type,
                search_value: search.search_value,
                status: search.status,
                event_gift_idx: search.event_gift_idx,
              }}
            />
          </div>
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const RequestRow = ({ item, num }: { item: EventGiftRequestItem; num: number }) => (
  <tr>
    <td className="text-center">{num}</td>
    <td className="text-center px-1">{item.title}</td>
    <td className="text-center px-1">{item.gift_nm}</td>
    <td className="text-center px-1">{item.m_id}</td>
    <td className="text-center px-1">{item.name}</td>
    <td className="text-center px-1">{item.birth_day}</td>
    <td className="text-center px-1">{item.tel}</td>
    <td className="text-center px-1">{item.receiver}</td>
    <td className="text-center px-1">
      ({item.zipcode}) {item.address} {item.address_detail}
    </td>
    <td className="text-center px-1">{item.reg_date}</td>
    <td className="text-center px-1">{EVENT_GIFT_STATUS[item.status]}</td>
    <td className="text-center">
      {item.tracking_no ? (
        <>
          <p className="mb-1">{item.tracking_no}</p>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary shadow-none font-12"
            onClick={() =>
              openDeliveryTracking(item.tracking_no.replace(/-/g, ""), item.delivery_code)
            }
          >
            배송조회
          </button>
        </>
      ) : null}
    </td>
  </tr>
);
