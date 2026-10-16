import {
  useEventBoardList,
  EVENT_GUBUN_TEXT,
  type EventBoardSearch,
  type EventBoardItem,
} from "@entities/event";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/event/event_board_list";
const REGISTER_URL = "/event/event_board_register";
const MODIFY_URL = "/event/event_board_modify";
// legacy 미이관: statistics/event/event_order_count.php (통계 영역 미착수) — legacy 경로로 링크 유지.
const STAT_URL = "/statistics/event/event_order_count";

// legacy date('Y-m-d H:i:s', $unix) — unix(초) → Y-m-d H:i:s (UTC 기준).
const fmtUnix = (unix: number) => {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

// legacy event_board_list.php — 이벤트게시판 목록.
export const EventBoardListScreen = (search: EventBoardSearch) => {
  const { data } = useEventBoardList(search);
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
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    이벤트게시판 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">이벤트게시판 목록</li>
              </ol>
            </div>
            <h4 className="page-title">이벤트게시판 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{total_results.toLocaleString()} 개</div>
        <div className="float-end">
          <a href={REGISTER_URL} className="btn btn-danger shadow-none">
            이벤트 게시판 등록
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-10">
          <div className="container">
            {data.items.map((item) => (
              <EventCard key={item.idx} item={item} />
            ))}
          </div>
          <div className="text-center mt-3">
            <ServerPagination
              page={current_page}
              totalPages={total_pages}
              baseUrl={BASE_URL}
              params={{ is_view: search.is_view }}
            />
          </div>
        </div>
        {/* end col */}

        <div className="col-2">
          <form id="search-form" className="form-horizontal" method="get" action={BASE_URL}>
            <span className="fw-bold d-block mb-1">이벤트 노출 여부</span>
            <select
              className="form-select"
              name="is_view"
              defaultValue={search.is_view}
              onChange={(e) => e.currentTarget.form?.submit()}
            >
              <option value="">전체</option>
              <option value="Y">노출함</option>
              <option value="N">노출안함</option>
            </select>
          </form>
        </div>
      </div>
    </>
  );
};

const EventCard = ({ item }: { item: EventBoardItem }) => (
  <div className="card mb-4">
    <div className="card-header p-2">
      <div className="float-start">
        <span>노출 기간</span>: {fmtUnix(item.start_date)} ~ {fmtUnix(item.end_date)}
        <span className="badge bg-secondary font-14">
          {item.is_view === "Y" ? "노출함" : "노출안함"}
        </span>
        <div className="d-block mt-1">
          <span className="fw-bold pe-1">프로모션 노출 여부</span>
          <span className="badge bg-secondary font-14">
            {item.show_promotion === "Y" ? "노출함" : "노출안함"}
          </span>
        </div>
      </div>
      <div className="float-end">
        {item.event_gubun !== "5" && (
          <a
            href={`${STAT_URL}?event_no=${item.idx}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-info shadow-none me-1"
          >
            이벤트 통계
          </a>
        )}

        <a
          href={`${MODIFY_URL}?idx=${item.idx}`}
          className="btn btn-sm btn-light shadow-none border"
        >
          {" "}
          <i className="mdi mdi-square-edit-outline font-14"></i> 이벤트 수정
        </a>
      </div>
    </div>
    <div className="card-body p-0">
      <div className="card mb-0 rounded-0">
        <div className="row g-0">
          <div className="col-md-5">
            <a href={item.event_link_url} target="_blank" rel="noreferrer">
              <img src={item.event_banner} className="img-fluid rounded-0 h-100" />
            </a>
          </div>
          <div className="col-md-7">
            <div className="card-body p-2">
              <span className="badge bg-secondary mb-2">{EVENT_GUBUN_TEXT[item.event_gubun]}</span>
              <h4 className="card-title mb-3">{item.subject}</h4>
              <div
                className="event_contents"
                dangerouslySetInnerHTML={{ __html: item.contents_html }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
