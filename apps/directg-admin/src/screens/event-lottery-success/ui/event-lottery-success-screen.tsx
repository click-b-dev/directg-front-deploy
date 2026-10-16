import {
  useEventLotterySuccess,
  type EventLotterySuccessSearch,
  type EventLotterySuccessItem,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_lottery_success";
const PER_PAGE = 30;

// legacy event_lottery_success.php — 추첨 이벤트 당첨자현황.
export const EventLotterySuccessScreen = (search: EventLotterySuccessSearch) => {
  const { data } = useEventLotterySuccess(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;
  // legacy: $num = total_results; if page>1 → total_results - (page-1)*30; 이후 행마다 --.
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
                <li className="breadcrumb-item active">
                  추첨 이벤트 당첨자현황 ({data.event_name})
                </li>
              </ol>
            </div>
            <h4 className="page-title">추첨 이벤트 당첨자현황 ({data.event_name})</h4>
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
          <input type="hidden" name="event_no" value={search.event_no} />
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
            {data.event_start_dt} ~ {data.event_end_dt}
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
                <th className="text-center">사은품명</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">회원명</th>
                <th className="text-center">생년월일</th>
                <th className="text-center">휴대폰번호</th>
                <th className="text-center">당첨일자</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {data.items.map((item, index) => (
                <WinnerRow key={`${item.m_id}-${index}`} item={item} num={startNum - index} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-3">
          <ServerPagination
            page={current_page}
            totalPages={total_pages}
            baseUrl={BASE_URL}
            params={{ event_no: search.event_no, searchTitle: search.searchTitle }}
          />
        </div>
      </div>
    </>
  );
};

const WinnerRow = ({ item, num }: { item: EventLotterySuccessItem; num: number }) => (
  <tr>
    <td className="text-center px-1">{num}</td>
    <td className="text-center px-1">{item.item_name}</td>
    <td className="text-center px-1">{item.m_id}</td>
    <td className="text-center px-1">{item.name}</td>
    <td className="text-center px-1">{item.birth_day}</td>
    <td className="text-center px-1">{item.hp}</td>
    <td className="text-center px-1">{item.lottery_date}</td>
  </tr>
);
