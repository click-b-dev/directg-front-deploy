import {
  usePointNexusActivityLogs,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnAsArray,
  pnFmtDate,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_activity_log";

const SORT_LIST = ["createdAt", "productID", "type"];

const TYPE_COLORS: Record<string, string> = {
  sale: "success",
  cancel: "danger",
  refund: "warning",
  revenue: "info",
  reveal: "primary",
};

const UUID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#6c757d",
  wordBreak: "break-all",
};

type Props = {
  mode: PnMode;
  offset: number;
  limit: number;
  sort: string;
  sortDirection: string;
  filters: string;
};

// legacy pointnexus_activity_log.php — PointNexus 활동 로그 목록.
export const PointNexusActivityLogScreen = ({
  mode,
  offset,
  limit,
  sort,
  sortDirection,
  filters,
}: Props) => {
  const { data: result } = usePointNexusActivityLogs(
    mode,
    offset,
    limit,
    sort,
    sortDirection,
    filters,
  );
  if (!result) {
    return null;
  }

  const error = result.success ? "" : pnExtractError(result);
  const logs = result.success ? pnAsArray(result.data) : [];
  const total = result.count ?? logs.length;
  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  const pageHref = (o: number) => {
    const params = new URLSearchParams({
      mode,
      limit: String(limit),
      sort,
      sortDirection,
      offset: String(o),
    });
    if (filters) {
      params.set("filters", filters);
    }
    return `${BASE_URL}?${params.toString()}`;
  };

  const pager = (
    <div className="d-flex gap-2">
      {offset > 0 && (
        <a href={pageHref(prevOffset)} className="btn btn-sm btn-light">
          ‹ 이전
        </a>
      )}
      {nextOffset < total && (
        <a href={pageHref(nextOffset)} className="btn btn-sm btn-light">
          다음 ›
        </a>
      )}
    </div>
  );

  return (
    <>
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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    PointNexus 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">PointNexus 활동 로그 목록</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 활동 로그 목록 <small className="text-muted">GET /activitylog</small>
            </h4>
          </div>
        </div>
      </div>

      {/* 검색필터 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2 mb-2">
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <PnModeSelect mode={mode} autoSubmit={false} />
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="limit"
                      className="col-4 col-form-label col-form-label-sm bg-light border"
                    >
                      limit
                    </label>
                    <div className="col-8">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        id="limit"
                        name="limit"
                        min={10}
                        max={100}
                        defaultValue={limit}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="sort"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      sort
                    </label>
                    <div className="col-9">
                      <select
                        className="form-control form-control-sm"
                        id="sort"
                        name="sort"
                        defaultValue={sort}
                      >
                        {SORT_LIST.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="sortDirection"
                      className="col-4 col-form-label col-form-label-sm bg-light border"
                    >
                      dir
                    </label>
                    <div className="col-8">
                      <select
                        className="form-control form-control-sm"
                        id="sortDirection"
                        name="sortDirection"
                        defaultValue={sortDirection}
                      >
                        <option value="DESC">DESC</option>
                        <option value="ASC">ASC</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="row g-2">
                    <label
                      htmlFor="filters"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      filters
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="filters"
                        name="filters"
                        placeholder='[{"field":"type","op":"=","value":"sale"}]'
                        defaultValue={filters}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* 검색 시 offset 리셋 */}
              <input type="hidden" name="offset" value="0" />
              <div className="row g-0 mt-1">
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none">
                    검색
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : (
        <>
          <div className="row mb-2">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="text-muted">
                전체 <strong className="text-dark">{total.toLocaleString()}</strong>개
                {total > 0 && (
                  <>
                    {" "}
                    &middot; {(offset + 1).toLocaleString()}–
                    {Math.min(offset + limit, total).toLocaleString()} 표시
                  </>
                )}
              </div>
              {pager}
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-sm mb-0">
                    <thead className="table-light font-13">
                      <tr>
                        <th className="text-center" style={{ width: "40px" }}>
                          #
                        </th>
                        <th className="text-center" style={{ width: "90px" }}>
                          type
                        </th>
                        <th className="text-center" style={{ width: "150px" }}>
                          createdAt
                        </th>
                        <th>상품</th>
                        <th className="text-center" style={{ width: "200px" }}>
                          operationID
                        </th>
                        <th className="text-center" style={{ width: "200px" }}>
                          로그 ID
                        </th>
                        <th className="text-center" style={{ width: "60px" }} />
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            활동 로그가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log, i) => {
                          const type = log.type ?? "";
                          const tColor = TYPE_COLORS[type] ?? "secondary";
                          const prodID = log.product?.id ?? "";
                          const prodName = log.product?.genericName ?? "";
                          const opID = log.operationID ?? "";
                          const lid = log.id ?? "";
                          return (
                            <tr key={lid || i}>
                              <td className="text-center text-muted">{offset + i + 1}</td>
                              <td className="text-center">
                                <span className={`badge bg-${tColor}`}>{type ? type : "—"}</span>
                              </td>
                              <td className="text-center small">{pnFmtDate(log.createdAt)}</td>
                              <td>
                                {prodName && <div className="fw-semibold">{prodName}</div>}
                                {prodID ? (
                                  <div style={UUID_STYLE}>
                                    <a
                                      href={`/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(prodID)}`}
                                      className="text-info text-decoration-none"
                                    >
                                      {prodID}
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-center" style={UUID_STYLE}>
                                {opID ? (
                                  <a
                                    href={`/goods/pointnexus/pointnexus_operation?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(opID)}`}
                                    className="text-info text-decoration-none"
                                  >
                                    {opID}
                                  </a>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-center" style={UUID_STYLE}>
                                {lid}
                              </td>
                              <td className="text-center">
                                <a
                                  href={`/goods/pointnexus/pointnexus_activity_log_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(lid)}`}
                                  className="btn btn-sm btn-outline-info"
                                >
                                  <i className="mdi mdi-eye" />
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-2 mb-2">{pager}</div>

          <PnJsonBox data={result} />
        </>
      )}
    </>
  );
};
