import { useEventGiftList, type EventGiftSearch, type EventGiftItem } from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_gift_list";
// event_gift_member.php(사은품 이벤트 당첨자현황) → SPA 라우트로 이관됨(#149).
const MEMBER_URL = "/event/event_gift_member";

// legacy event_gift_list.php — 사은품 이벤트 진행이력.
export const EventGiftListScreen = (search: EventGiftSearch) => {
  const { data } = useEventGiftList(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;

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
                <li className="breadcrumb-item active">사은품 이벤트 진행이력</li>
              </ol>
            </div>
            <h4 className="page-title">사은품 이벤트 진행이력</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

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
                <col width="20%" />
                <col width="5%" />
                <col width="17%" />
                <col width="5%" />
                <col width="5%" />
                <col width="5%" />
                <col width="7%" />
              </colgroup>
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">이벤트명</th>
                  <th className="text-center">사은품명</th>
                  <th className="text-center">사은품수량</th>
                  <th className="text-center">이벤트 기간</th>
                  <th className="text-center">당첨자발표</th>
                  <th className="text-center">사은품발송</th>
                  <th className="text-center">배송여부</th>
                  <th className="text-center">당첨자현황</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {data.items.map((item) => (
                  <GiftRow key={item.idx} item={item} memberUrl={MEMBER_URL} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination page={current_page} totalPages={total_pages} baseUrl={BASE_URL} />
          </div>
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const GiftRow = ({ item, memberUrl }: { item: EventGiftItem; memberUrl: string }) => (
  <tr>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-start px-1">{item.title}</td>
    <td className="text-start px-1">{item.gift_nm}</td>
    <td className="text-end px-1">{item.gift_count.toLocaleString()}</td>
    <td className="text-center px-1">
      {item.start_dt} ~ {item.end_dt}
    </td>
    <td className="text-center px-1">{item.event_m_date}</td>
    <td className="text-center px-1">{item.delivery_date}</td>
    <td className="text-center px-1">{item.is_delivery}</td>
    <td className="text-center px-1">
      <a href={`${memberUrl}?idx=${item.idx}`} className="btn btn-outline-secondary btn-sm font-12">
        당첨자현황
      </a>
    </td>
  </tr>
);
