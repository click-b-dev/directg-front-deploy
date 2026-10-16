import {
  useEventGiftMember,
  EVENT_GIFT_STATUS,
  type EventGiftMemberSearch,
  type EventGiftMemberItem,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";
import { openDeliveryTracking } from "@shared/lib/delivery-tracking";

const BASE_URL = "/event/event_gift_member";
const PER_PAGE = 30;

// legacy event_gift_member.php — 사은품 이벤트 당첨자현황.
export const EventGiftMemberScreen = (search: EventGiftMemberSearch) => {
  const { data } = useEventGiftMember(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;
  const isDelivery = data.is_delivery === "Y";
  // legacy: $num = total_results; page>1 → total_results-(page-1)*30; 이후 행마다 --.
  const startNum = total_results - (current_page - 1) * PER_PAGE;

  return (
    <>
      <style>{`.table-centered tr:hover { background-color: #FFF0F0; }`}</style>
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
                <li className="breadcrumb-item active">사은품 이벤트 당첨자현황 ({data.title})</li>
              </ol>
            </div>
            <h4 className="page-title">사은품 이벤트 당첨자현황 ({data.title})</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row" style={{ margin: "10px 0 10px 0" }}>
        <form
          method="get"
          action={BASE_URL}
          style={{ paddingLeft: "0px", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <input type="hidden" name="idx" value={search.idx} />
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

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{total_results.toLocaleString()} 개</div>
        <div className="float-end">
          <strong className="text-danger">
            {data.start_dt} ~ {data.end_dt}
          </strong>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table
            className="table table-centered w-100 nowrap table-sm table-bordered border-light"
            cellPadding={0}
          >
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                {isDelivery ? (
                  <>
                    {/* 배송 O */}
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
                  </>
                ) : (
                  <>
                    {/* 배송 X */}
                    <th className="text-center">Asset ID</th>
                    <th className="text-center">사은품명</th>
                    <th className="text-center">회원아이디</th>
                    <th className="text-center">회원명</th>
                    <th className="text-center">생년월일</th>
                    <th className="text-center">휴대폰번호</th>
                    <th className="text-center">수령시간</th>
                    <th className="text-center">상태</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {data.items.map((item, index) => (
                <MemberRow
                  key={`${item.m_id}-${index}`}
                  item={item}
                  num={startNum - index}
                  isDelivery={isDelivery}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-3">
          <ServerPagination
            page={current_page}
            totalPages={total_pages}
            baseUrl={BASE_URL}
            params={{ idx: search.idx, searchTitle: search.searchTitle }}
          />
        </div>
      </div>
    </>
  );
};

const MemberRow = ({
  item,
  num,
  isDelivery,
}: {
  item: EventGiftMemberItem;
  num: number;
  isDelivery: boolean;
}) => (
  <tr>
    <td className="text-center px-1">{num}</td>
    {isDelivery ? (
      <>
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
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary shadow-none font-12"
              onClick={() =>
                openDeliveryTracking(item.tracking_no.replace(/-/g, ""), item.delivery_code)
              }
            >
              배송조회
            </button>
          ) : null}
        </td>
      </>
    ) : (
      <>
        <td className="text-center px-1">{item.asset_id}</td>
        <td className="text-center px-1">{item.gift_nm}</td>
        <td className="text-center px-1">{item.m_id}</td>
        <td className="text-center px-1">{item.name}</td>
        <td className="text-center px-1">{item.birth_day}</td>
        <td className="text-center px-1">{item.hp}</td>
        <td className="text-center px-1">{item.status === 3 ? item.reg_date : ""}</td>
        <td className="text-center px-1">{EVENT_GIFT_STATUS[item.status]}</td>
      </>
    )}
  </tr>
);
