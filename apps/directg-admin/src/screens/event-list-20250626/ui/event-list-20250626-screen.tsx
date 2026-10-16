import {
  useEventCampaign20250626,
  type EventCampaign20250626Search,
  type EventCampaign20250626Item,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_list_20250626";

// legacy: 사용예산 계산 — idx==37이면 사은품수량 기준, 아니면 참여자수 기준.
const marketingCost = (item: EventCampaign20250626Item) =>
  item.idx === 37
    ? item.event_gift_count * item.event_per_price
    : item.event_member * item.event_per_price;

// legacy event_list_20250626.php — 2025 여름 프로모션 이벤트.
export const EventList20250626Screen = (search: EventCampaign20250626Search) => {
  const { data } = useEventCampaign20250626(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;
  // legacy: total_marketing_cost는 현재 페이지 행 합.
  const totalMarketingCost = data.items.reduce((sum, item) => sum + marketingCost(item), 0);

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
                    추첨 이벤트 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">2025 여름 프로모션 이벤트</li>
              </ol>
            </div>
            <h4 className="page-title">2025 여름 프로모션 이벤트</h4>
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
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center" style={{ width: "50px" }}>
                    번호
                  </th>
                  <th className="text-center">이벤트명</th>
                  <th className="text-center" style={{ width: "250px" }}>
                    이벤트 기간
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    사은품수량
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    참여자수
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    사용예산
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item) => (
                  <CampaignRow key={item.idx} item={item} />
                ))}
              </tbody>
              <tfoot className="table-light font-13">
                <tr>
                  <th colSpan={3} className="text-center">
                    합계
                  </th>
                  <th></th>
                  <th></th>
                  <th className="text-end">{totalMarketingCost.toLocaleString()}</th>
                </tr>
              </tfoot>
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

const CampaignRow = ({ item }: { item: EventCampaign20250626Item }) => (
  <tr>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-start px-1">
      {item.event_name}
      <br />
      <small style={{ fontSize: "11px" }}>=&gt; 사은품: {item.event_gift}</small>
    </td>
    <td className="text-center px-1">
      {item.event_start_dt} ~ {item.event_end_dt}
    </td>
    <td className="text-end px-1">{item.event_gift_count.toLocaleString()}</td>
    <td className="text-end px-1">{item.event_member.toLocaleString()}</td>
    <td className="text-end px-1">{marketingCost(item).toLocaleString()}</td>
  </tr>
);
