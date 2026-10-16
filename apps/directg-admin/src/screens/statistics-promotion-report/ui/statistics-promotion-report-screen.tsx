import {
  useStatPromotionReport,
  useStatPromotionReportSuppliers,
  useRunStatPromotionBatch,
  type StatPromotionReportSearch,
  type StatPromotionReportRow,
} from "@entities/statistics";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/statistics/promotion/promotion_report";

const nf = (n: number) => n.toLocaleString("en-US");
const round2 = (n: number) => String(Math.round(n * 100) / 100);
const round1 = (n: number) => String(Math.round(n * 10) / 10);

// "YYYY-MM-DD HH:MM:SS" → epoch ms (legacy strtotime, 로컬 시간 diff는 상쇄).
const parseTs = (s: string) => Date.parse(s.replace(" ", "T"));

// legacy 플랫폼 select(dead 필터) 옵션.
const PLATFORM_OPTIONS = [
  { value: "1", label: "Steam" },
  { value: "34", label: "Epic" },
  { value: "30", label: "Ubisoft Connect" },
  { value: "35", label: "Rockstar Games Launcher" },
  { value: "33", label: "Bethesda" },
  { value: "3", label: "Orgin" },
  { value: "32", label: "기타" },
];

const GAME_TYPE_OPTIONS = [
  { value: "game", label: "게임" },
  { value: "dlc", label: "DLC" },
  { value: "music", label: "사운드트랙" },
  { value: "bundle", label: "번들" },
];

// legacy statistics/promotion/promotion_report.php — 할인 프로모션 주문통계.
export const StatisticsPromotionReportScreen = (search: StatPromotionReportSearch) => {
  const resolved: StatPromotionReportSearch = { ...search, page: search.page || 1 };

  const { data } = useStatPromotionReport(resolved);
  const { data: supplierData } = useStatPromotionReportSuppliers();
  const batch = useRunStatPromotionBatch();

  const suppliers = supplierData?.suppliers ?? [];
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  // 페이지네이션 파라미터(page 제외 검색값 유지 — legacy $param). platform(dead)도 유지.
  const paginationParams: Record<string, string> = {};
  if (search.search_key !== "") paginationParams.search_key = search.search_key;
  if (search.search_value !== "") paginationParams.search_value = search.search_value;
  if (search.search_product_platform !== "")
    paginationParams.search_product_platform = search.search_product_platform;
  if (search.search_supplier_code !== "")
    paginationParams.search_supplier_code = search.search_supplier_code;
  if (search.search_start !== "") paginationParams.search_start = search.search_start;
  if (search.search_end !== "") paginationParams.search_end = search.search_end;
  if (search.search_game_type !== "") paginationParams.search_game_type = search.search_game_type;

  const handleBatch = (row: StatPromotionReportRow) => {
    batch.mutate({
      product_code: row.product_code,
      promotion_start: row.promotion_start,
      promotion_end: row.promotion_end,
      sale_price: row.sale_price,
    });
  };

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
                    통계
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    프로모션 분석
                  </a>
                </li>
                <li className="breadcrumb-item active">할인 프로모션 주문통계</li>
              </ol>
            </div>
            <h4 className="page-title">할인 프로모션 주문통계</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">할인 프로모션 검색필터</h5>
          <div className="card-body p-2">
            <form className="form-horizontal" method="GET" action={BASE_URL}>
              <div className="row g-2 mb-2">
                <div className="col-lg-5 mb-2">
                  <div className="input-group row g-2">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key}
                    >
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
                <div className="col-lg-3 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_product_platform"
                      className="col-sm-4 col-form-labe col-form-label-sm bg-light border"
                    >
                      플랫폼
                    </label>
                    <div className="col-sm-8">
                      <select
                        id="search_product_platform"
                        name="search_product_platform"
                        className="form-select"
                        defaultValue={search.search_product_platform}
                      >
                        <option value="">:::선택:::</option>
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_supplier_code"
                      className="col-sm-4 col-form-labe col-form-label-sm bg-light border"
                    >
                      공급처
                    </label>
                    <div className="col-sm-8">
                      <select
                        id="search_supplier_code"
                        name="search_supplier_code"
                        className="form-select select2"
                        data-toggle="select2"
                        defaultValue={search.search_supplier_code}
                      >
                        <option value="">:::선택:::</option>
                        {suppliers.map((s) => (
                          <option key={s.publisher_code} value={s.publisher_code}>
                            {s.publisher_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-0 mb-2">
                <div className="col-lg-7">
                  <div className="row">
                    <label
                      htmlFor="search_date"
                      className="col-sm-2 col-form-label col-form-label-sm bg-light border"
                    >
                      진행기간
                    </label>
                    <div className="col-sm-10 pt-1">
                      <div className="row">
                        <div className="col-sm-3">
                          <input
                            type="text"
                            className="form-control"
                            id="search_start"
                            name="search_start"
                            placeholder="시작일자"
                            defaultValue={search.search_start}
                          />
                        </div>
                        ~
                        <div className="col-sm-3">
                          <input
                            type="text"
                            className="form-control"
                            id="search_end"
                            name="search_end"
                            placeholder="종료일자"
                            defaultValue={search.search_end}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="row mb-2">
                    <label
                      htmlFor="search_game_type"
                      className="col-sm-2 col-form-label col-form-label-sm bg-light border"
                    >
                      옵션상품 구분
                    </label>
                    <div className="col-sm-10 pt-1">
                      {GAME_TYPE_OPTIONS.map((g) => (
                        <div className="form-check form-check-inline" key={g.value}>
                          <input
                            type="radio"
                            id={`search_game_type_${g.value}`}
                            name="search_game_type"
                            className="form-check-input"
                            value={g.value}
                            defaultChecked={search.search_game_type === g.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_game_type_${g.value}`}
                          >
                            {g.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      할인 프로모션 검색
                    </button>
                    <button type="reset" className="btn btn-secondary shadow-none">
                      필터 초기화
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-12">전체 : {nf(pagination?.total_results ?? 0)} 건</div>
      </div>

      <p className="text-danger mb-1">
        ※ 집계되지 않은 일평균 데이터는 우측 버튼 클릭하면 반영됩니다.
      </p>
      <p className="text-danger mb-1">※ 집계처리 후 주문취소 건은 반영되지 않은 데이터입니다.</p>

      <div className="table-responsive">
        <table className="table table-bordered table-centered w-100 nowrap table-sm">
          <colgroup>
            <col width="15%" />
            <col width="6%" />
            <col width="*" />
            <col width="17%" />
            <col width="6%" />
            <col width="6%" />
            <col width="6%" />
            <col width="6%" />
            <col width="5%" />
            <col width="5%" />
            <col width="5%" />
          </colgroup>
          <thead className="table-dark font-13">
            <tr>
              <th className="text-center">공급처</th>
              <th className="text-center">옵션상품코드</th>
              <th className="text-center">옵션상품명</th>
              <th className="text-center">할인프로모션 진행기간</th>
              <th className="text-center">
                할인프로모션 <br />
                진행일수
              </th>
              <th className="text-center">
                할인프로모션 <br />
                할인가
              </th>
              <th className="text-center">
                할인프로모션 <br />
                할인율
              </th>
              <th className="text-center">주문수량</th>
              <th className="text-center">주문금액</th>
              <th className="text-center">일평균</th>
              <th className="text-center">집계</th>
            </tr>
          </thead>
          <tbody className="font-12 bg-white">
            {items.map((row) => (
              <PromotionReportRow
                key={`${row.product_code}-${row.promotion_start}-${row.promotion_end}`}
                row={row}
                onBatch={handleBatch}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-3">
        {pagination && (
          <ServerPagination
            page={pagination.current_page}
            totalPages={pagination.total_pages}
            baseUrl={BASE_URL}
            params={paginationParams}
          />
        )}
      </div>
    </>
  );
};

const PromotionReportRow = ({
  row,
  onBatch,
}: {
  row: StatPromotionReportRow;
  onBatch: (row: StatPromotionReportRow) => void;
}) => {
  const nowMs = Date.now();
  const startMs = parseTs(row.promotion_start);
  const endMs = parseTs(row.promotion_end);

  // 진행예정(C)/진행중(I)/종료(E). base WHERE(promotion_end<now)로 데이터셋은 항상 E.
  let trClass = "";
  let status = "E";
  if (startMs > nowMs && endMs > nowMs) {
    trClass = "table-active";
    status = "C";
  } else if (startMs <= nowMs && endMs >= nowMs) {
    trClass = "table-active";
    status = "I";
  }

  const eventTerm = (endMs - startMs) / (60 * 60 * 1000) / 24;
  const orderCount = row.order_count;

  const periodHref = `${BASE_URL}?search_start=${encodeURIComponent(
    row.promotion_start,
  )}&search_end=${encodeURIComponent(row.promotion_end)}`;

  return (
    <tr className={`${trClass} `}>
      <td className="text-center">{row.publisher_name}</td>
      <td className="text-center">
        <span className="num">{row.product_code}</span>
      </td>
      <td className="">{row.product_name}</td>
      <td className="text-center p-0">
        <a href={periodHref}>
          <span className="num">
            {row.promotion_start} ~ {row.promotion_end}
          </span>
        </a>
      </td>
      <td className="text-end">{round2(eventTerm)} 일</td>
      <td className="text-end">
        <span className="num">{nf(row.sale_price)}</span>
      </td>
      <td className="text-end">
        <span className="text-danger mdi mdi-arrow-down-bold"></span>{" "}
        <span className="text-danger num">{row.discount_rate}%</span>
      </td>
      <td className="text-end">{orderCount ? nf(orderCount) : ""}</td>
      <td className="text-end">
        <span className="num">{nf(row.order_price)}</span>
      </td>
      <td className="text-end">
        {orderCount != null && orderCount > 0 ? round1(orderCount / eventTerm) : ""}
      </td>
      <td className="text-center">
        {status === "E" && orderCount === null && (
          <button
            type="button"
            className="btn btn-danger btn-sm shadow-none btn_promotion_count_all"
            onClick={() => onBatch(row)}
          >
            집계
          </button>
        )}
      </td>
    </tr>
  );
};
