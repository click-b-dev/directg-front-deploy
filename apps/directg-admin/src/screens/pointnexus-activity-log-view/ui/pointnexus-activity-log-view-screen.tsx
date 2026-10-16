import {
  usePointNexusActivityLogRetrieve,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  pnFmtDate,
  type PnMode,
  type PnActivityLogDetail,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_activity_log_view";

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
const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#6c757d",
  borderBottom: "1px solid #e0e0e0",
  paddingBottom: "6px",
  marginBottom: "14px",
};
const LABEL_COL_STYLE: React.CSSProperties = {
  width: "130px",
  fontSize: "12px",
  color: "#6c757d",
  whiteSpace: "nowrap",
};

const BASE_KEYS = ["id", "type", "createdAt", "operationID", "fromOperationID", "product"];

const str = (v: unknown): string => (v == null ? "" : String(v));

// legacy pointnexus_activity_log_view.php — PointNexus 활동 로그 상세.
export const PointNexusActivityLogViewScreen = ({ mode, id }: { mode: PnMode; id: string }) => {
  const { data: result } = usePointNexusActivityLogRetrieve(mode, id);

  const log = id && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = id && result && !log ? pnExtractError(result) : "";

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
                <li className="breadcrumb-item active">PointNexus 활동 로그 상세</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 활동 로그 상세{" "}
              <small className="text-muted">GET /activitylog/{"{id}"}</small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row g-0">
        <div className="card">
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
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
                <div className="col-8">
                  <div className="row g-2">
                    <label
                      htmlFor="id"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      로그 UUID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="id"
                        name="id"
                        defaultValue={id}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none">
                    조회
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {!id ? (
        <div className="alert alert-info">로그 UUID를 입력하세요.</div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : log ? (
        <LogDetail log={log} id={id} mode={mode} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const LogDetail = ({
  log,
  id,
  mode,
  result,
}: {
  log: PnActivityLogDetail;
  id: string;
  mode: PnMode;
  result: unknown;
}) => {
  const lid = str(log.id) || id;
  const type = str(log.type);
  const createdAt = str(log.createdAt);
  const opID = str(log.operationID);
  const fromOpID = str(log.fromOperationID);
  const prod =
    log.product && typeof log.product === "object"
      ? (log.product as Record<string, unknown>)
      : null;
  const prodID = prod ? str(prod.id) : "";
  const tColor = TYPE_COLORS[type] ?? "secondary";

  const operationHref = (oid: string) =>
    `/goods/pointnexus/pointnexus_operation?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(oid)}`;
  const productHref = `/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(prodID)}`;

  const extraKeys = Object.keys(log).filter((k) => !BASE_KEYS.includes(k));

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>로그 정보</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>id</td>
                    <td style={UUID_STYLE}>{lid}</td>
                  </tr>
                  {type && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>type</td>
                      <td>
                        <span className={`badge bg-${tColor}`}>{type}</span>
                      </td>
                    </tr>
                  )}
                  {createdAt && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>createdAt</td>
                      <td>{pnFmtDate(createdAt)}</td>
                    </tr>
                  )}
                  {opID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>operationID</td>
                      <td style={UUID_STYLE}>
                        <a href={operationHref(opID)} className="text-info text-decoration-none">
                          {opID} <i className="mdi mdi-open-in-new" />
                        </a>
                      </td>
                    </tr>
                  )}
                  {fromOpID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>fromOperationID</td>
                      <td style={UUID_STYLE}>
                        <a
                          href={operationHref(fromOpID)}
                          className="text-info text-decoration-none"
                        >
                          {fromOpID} <i className="mdi mdi-open-in-new" />
                        </a>
                        <small className="text-muted d-block mt-1">
                          원본 오퍼레이션 (예: 취소의 원래 판매)
                        </small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>상품 (product)</div>
              {prod ? (
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {Object.entries(prod).map(([k, v]) => {
                      const display =
                        v !== null && typeof v === "object" ? JSON.stringify(v) : str(v);
                      return (
                        <tr key={k}>
                          <td style={LABEL_COL_STYLE}>{k}</td>
                          <td style={k === "id" ? UUID_STYLE : undefined}>
                            {k === "id" && prodID ? (
                              <a href={productHref} className="text-info text-decoration-none">
                                {display} <i className="mdi mdi-open-in-new" />
                              </a>
                            ) : (
                              display
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mb-0">상품 정보 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {extraKeys.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div style={SECTION_TITLE_STYLE}>추가 정보</div>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {extraKeys.map((k) => {
                  const v = log[k];
                  const display =
                    v == null || typeof v === "object" ? JSON.stringify(v) : String(v);
                  return (
                    <tr key={k}>
                      <td style={LABEL_COL_STYLE}>{k}</td>
                      <td>{display}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PnJsonBox data={result} />
    </>
  );
};
