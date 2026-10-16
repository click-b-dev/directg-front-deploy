import {
  usePointNexusCapsule,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  pnFmtDate,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_capsule";

const STATUS_COLORS: Record<string, string> = {
  init: "secondary",
  running: "primary",
  success: "success",
  failed: "danger",
  cancelled: "warning",
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
const JSON_BOX_STYLE: React.CSSProperties = {
  background: "#f8f9fa",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  padding: "12px",
  fontFamily: "monospace",
  fontSize: "11px",
  maxHeight: "200px",
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

const BASE_KEYS = [
  "id",
  "status",
  "createdAt",
  "lastUpdatedAt",
  "flowID",
  "flowCodename",
  "flowVersion",
  "productID",
  "poolName",
  "metadata",
  "productVariant",
  "productSnapshot",
];

// legacy !empty((array)$v) — 객체/배열이 비어있지 않은지.
const isNonEmpty = (v: unknown): boolean => {
  if (v == null) {
    return false;
  }
  if (Array.isArray(v)) {
    return v.length > 0;
  }
  if (typeof v === "object") {
    return Object.keys(v).length > 0;
  }
  return !!v;
};

const str = (v: unknown): string => (v == null ? "" : String(v));

// legacy pointnexus_capsule.php — PointNexus 캡슐 조회.
export const PointNexusCapsuleScreen = ({ mode, id }: { mode: PnMode; id: string }) => {
  const { data: result } = usePointNexusCapsule(mode, id);

  const capsule =
    id && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = id && result && !capsule ? pnExtractError(result) : "";

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
                <li className="breadcrumb-item active">PointNexus 캡슐 조회</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 캡슐 조회 <small className="text-muted">GET /capsule/{"{id}"}</small>
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
                      캡슐 ID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="id"
                        name="id"
                        defaultValue={id}
                        placeholder="hex 문자열"
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
        <div className="alert alert-info">캡슐 ID(hex)를 입력하세요.</div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : capsule ? (
        <CapsuleDetail capsule={capsule} id={id} mode={mode} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const CapsuleDetail = ({
  capsule,
  id,
  mode,
  result,
}: {
  capsule: Record<string, unknown>;
  id: string;
  mode: PnMode;
  result: unknown;
}) => {
  const cId = str(capsule.id) || id;
  const status = str(capsule.status) || "—";
  const createdAt = str(capsule.createdAt);
  const lastUpdated = str(capsule.lastUpdatedAt);
  const flowCode = str(capsule.flowCodename);
  const flowVersion = capsule.flowVersion;
  const flowID = str(capsule.flowID);
  const productID = str(capsule.productID);
  const poolName = str(capsule.poolName);
  const statusColor = STATUS_COLORS[status] ?? "info";

  const arrayFields: { name: string; value: unknown }[] = [
    { name: "metadata", value: capsule.metadata },
    { name: "productVariant", value: capsule.productVariant },
    { name: "productSnapshot", value: capsule.productSnapshot },
  ];
  const nonEmpty = arrayFields.filter((f) => isNonEmpty(f.value));

  const extraKeys = Object.keys(capsule).filter((k) => !BASE_KEYS.includes(k));

  const productViewHref = `/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(productID)}`;

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>캡슐 정보</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>status</td>
                    <td>
                      <span className={`badge bg-${statusColor}`}>{status}</span>
                    </td>
                  </tr>
                  {poolName && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>poolName</td>
                      <td>
                        <span className="badge bg-light text-dark border">{poolName}</span>
                      </td>
                    </tr>
                  )}
                  {createdAt && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>createdAt</td>
                      <td>{pnFmtDate(createdAt)}</td>
                    </tr>
                  )}
                  {lastUpdated && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>lastUpdatedAt</td>
                      <td>{pnFmtDate(lastUpdated)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={LABEL_COL_STYLE}>id</td>
                    <td style={UUID_STYLE}>{cId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>플로우 (flow)</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {flowCode && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>flowCodename</td>
                      <td>{flowCode}</td>
                    </tr>
                  )}
                  {flowVersion !== "" && flowVersion != null && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>flowVersion</td>
                      <td>{str(flowVersion)}</td>
                    </tr>
                  )}
                  {flowID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>flowID</td>
                      <td style={UUID_STYLE}>{flowID}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>연관 상품</div>
              {productID ? (
                <>
                  <table className="table table-sm table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td style={LABEL_COL_STYLE}>productID</td>
                        <td style={UUID_STYLE}>
                          <a href={productViewHref} className="text-info text-decoration-none">
                            {productID} <i className="mdi mdi-open-in-new" />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <a href={productViewHref} className="btn btn-sm btn-outline-info mt-2">
                    <i className="mdi mdi-eye" /> 상품 상세 조회
                  </a>
                </>
              ) : (
                <p className="text-muted mb-0">연관 상품 정보 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {nonEmpty.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div style={SECTION_TITLE_STYLE}>상세 데이터</div>
            {nonEmpty.map((f) => (
              <div className="mb-3" key={f.name}>
                <div className="text-muted small mb-1">{f.name}</div>
                <pre className="mb-0" style={JSON_BOX_STYLE}>
                  {JSON.stringify(f.value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {extraKeys.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div style={SECTION_TITLE_STYLE}>추가 정보</div>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {extraKeys.map((k) => {
                  const v = capsule[k];
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
