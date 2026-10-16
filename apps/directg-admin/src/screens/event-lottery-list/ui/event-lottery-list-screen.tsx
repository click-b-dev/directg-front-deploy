import {
  useEventLotteryList,
  type EventLotterySearch,
  type EventLotteryItem,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_lottery_list";
// event_lottery_success.php(당첨자현황) → SPA 라우트로 이관됨(#144).
const SUCCESS_URL = "/event/event_lottery_success";
// event_lottery_fail.php(낙첨자현황) → legacy에 파일 부재 = 죽은 링크. legacy 경로 그대로 유지.
const FAIL_URL = "/event/event_lottery_fail";

// legacy event_lottery_list.php — 추첨 이벤트 현황.
export const EventLotteryListScreen = (search: EventLotterySearch) => {
  const { data } = useEventLotteryList(search);
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
                    추첨 이벤트 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">추첨 이벤트 현황</li>
              </ol>
            </div>
            <h4 className="page-title">추첨 이벤트 현황</h4>
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
                  <th className="text-center" style={{ width: "80px" }}>
                    진행수량
                  </th>
                  <th className="text-center" style={{ width: "250px" }}>
                    이벤트 기간
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    대상금액
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    대상자수
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    참여자수
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    참여횟수
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    당첨자수
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    참여율
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    당첨확률
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    당첨자현황
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    낙첨자현황
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item) => (
                  <LotteryRow
                    key={item.idx}
                    item={item}
                    successUrl={SUCCESS_URL}
                    failUrl={FAIL_URL}
                  />
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

const LotteryRow = ({
  item,
  successUrl,
  failUrl,
}: {
  item: EventLotteryItem;
  successUrl: string;
  failUrl: string;
}) => (
  <tr>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-start px-1">
      {item.event_name}
      <br />
      <small style={{ fontSize: "11px" }}>=&gt; 사은품: {item.event_gift}</small>
    </td>
    <td className="text-end px-1">{item.event_gift_count.toLocaleString()}</td>
    <td className="text-center px-1">
      {item.event_start_dt} ~ {item.event_end_dt}
    </td>
    <td className="text-end px-1">{item.total.toLocaleString()}</td>
    <td className="text-end px-1">{item.member_count.toLocaleString()}</td>
    <td className="text-end px-1">{item.event_member.toLocaleString()}</td>
    <td className="text-end px-1">{item.event_count.toLocaleString()}</td>
    <td className="text-end px-1">{item.won_count.toLocaleString()}</td>
    {/* legacy 주석처리 dead — 값 없이 % 만 렌더 */}
    <td className="text-end px-1">%</td>
    <td className="text-end px-1">%</td>
    <td className="text-center px-1">
      <a
        href={`${successUrl}?event_no=${item.idx}`}
        className="btn btn-outline-secondary btn-sm font-12"
      >
        당첨자현황
      </a>
    </td>
    <td className="text-center px-1">
      <a
        href={`${failUrl}?event_no=${item.idx}`}
        className="btn btn-outline-secondary btn-sm font-12"
      >
        낙첨자현황
      </a>
    </td>
  </tr>
);
