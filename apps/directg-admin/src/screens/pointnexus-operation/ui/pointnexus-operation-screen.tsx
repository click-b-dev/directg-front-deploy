import {
  usePointNexusOperation,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  pnFmtDate,
  pnCurrencyAmount,
  type PnMode,
  type PnOperation,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_operation";

const STATE_COLORS: Record<string, string> = {
  done: "success",
  pending: "warning",
  failed: "danger",
  cancelled: "secondary",
  cancelling: "secondary",
  error: "danger",
};
const TYPE_COLORS: Record<string, string> = {
  sale: "primary",
  book: "warning",
  reveal: "info",
  cancel: "danger",
  refund: "danger",
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
const KEY_DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "22px",
  fontWeight: 700,
  color: "#c47e0a",
  background: "#fff8e6",
  padding: "14px 20px",
  borderRadius: "8px",
  border: "1px solid #f3d27f",
  letterSpacing: "2px",
  userSelect: "all",
  display: "inline-block",
};
const OPID_DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#0a8a8a",
  background: "#e8fafa",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "1px solid #b6e6e6",
  userSelect: "all",
  display: "inline-block",
};

const nn = (v: unknown) => v !== null && v !== undefined;
const num = (v: unknown) => (v == null ? 0 : Math.trunc(Number(v)));

// legacy pointnexus_operation.php — PointNexus 오퍼레이션 조회.
export const PointNexusOperationScreen = ({ mode, id }: { mode: PnMode; id: string }) => {
  const { data: result } = usePointNexusOperation(mode, id);

  const op = id && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = id && result && !op ? pnExtractError(result) : "";

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
                <li className="breadcrumb-item active">PointNexus 오퍼레이션 조회</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 오퍼레이션 조회{" "}
              <small className="text-muted">GET /operation/{"{id}"}</small>
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
                      operation UUID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="id"
                        name="id"
                        defaultValue={id}
                        placeholder="예: dd2d9ecb-118f-4e07-9f7a-1a1e68ce00f3"
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
        <div className="alert alert-info">
          operationID 를 입력하세요. (sell / book 응답에 포함된 ID)
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : op ? (
        <OperationDetail op={op} id={id} mode={mode} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const OperationDetail = ({
  op,
  id,
  mode,
  result,
}: {
  op: PnOperation;
  id: string;
  mode: PnMode;
  result: unknown;
}) => {
  const state = op.state ?? "";
  const type = op.type ?? "";
  const stateColor = STATE_COLORS[state] ?? "info";
  const typeColor = TYPE_COLORS[type] ?? "secondary";

  const key = op.capsule?.item?.key ?? "";
  const platform = op.capsule?.item?.platform ?? "";
  const buildID = op.buildID ?? "";
  const countryCodes = op.productVariant?.countryCodes ?? "";
  const capsuleID = op.capsule?.id ?? "";
  const details = op.details;

  const capsuleHref = `/goods/pointnexus/pointnexus_capsule?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(capsuleID)}`;
  const buildHref = `/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(buildID)}`;

  const convCurr = details?.convertedCurrencyCode ?? "";

  return (
    <>
      {/* 상태/타입 헤더 */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <div>
              <div className="text-muted small">상태 (state)</div>
              <span
                className={`badge bg-${stateColor}`}
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {state ? state : "—"}
              </span>
            </div>
            <div>
              <div className="text-muted small">타입 (type)</div>
              <span
                className={`badge bg-${typeColor}`}
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {type ? type : "—"}
              </span>
            </div>
            <div className="ms-auto text-end">
              <div className="text-muted small">operationID</div>
              <span style={OPID_DISPLAY_STYLE}>{id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 라이선스 키 */}
      {key && (
        <div className="card mb-3">
          <div className="card-body text-center py-4">
            <div style={SECTION_TITLE_STYLE}>라이선스 키</div>
            <span style={KEY_DISPLAY_STYLE}>{key}</span>
            <div className="mt-3 text-muted small">
              <i className="mdi mdi-cube-outline" /> 플랫폼: <strong>{platform}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>처리량 (Quantity)</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {nn(op.qtyToProcess) && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>qtyToProcess</td>
                      <td>{String(op.qtyToProcess)}</td>
                    </tr>
                  )}
                  {nn(op.qtyProcessed) && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>qtyProcessed</td>
                      <td>
                        <span className="badge bg-success">{num(op.qtyProcessed)}</span>
                      </td>
                    </tr>
                  )}
                  {nn(op.qtyInError) && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>qtyInError</td>
                      <td>
                        {num(op.qtyInError) > 0 ? (
                          <span className="badge bg-danger">{num(op.qtyInError)}</span>
                        ) : (
                          <span className="badge bg-secondary">0</span>
                        )}
                      </td>
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
              <div style={SECTION_TITLE_STYLE}>시각</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>createdAt</td>
                    <td>{pnFmtDate(op.createdAt)}</td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>lastUpdatedAt</td>
                    <td>{pnFmtDate(op.lastUpdatedAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>상품 / 빌드</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {buildID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>buildID</td>
                      <td style={UUID_STYLE}>
                        <a href={buildHref} className="text-info text-decoration-none">
                          {buildID} <i className="mdi mdi-open-in-new" />
                        </a>
                      </td>
                    </tr>
                  )}
                  {countryCodes && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>countryCodes</td>
                      <td>{countryCodes}</td>
                    </tr>
                  )}
                  {capsuleID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>capsule</td>
                      <td style={UUID_STYLE}>
                        <a href={capsuleHref} className="text-info text-decoration-none">
                          {capsuleID.slice(0, 16)}… <i className="mdi mdi-open-in-new" />
                        </a>
                      </td>
                    </tr>
                  )}
                  {!buildID && !countryCodes && !capsuleID && (
                    <tr>
                      <td colSpan={2} className="text-muted text-center">
                        아직 처리 정보 없음
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 결제·수익 배분 */}
      {details && (
        <div className="row g-3 mb-3">
          <div className="col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <div style={SECTION_TITLE_STYLE}>판매 가격</div>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {nn(details.sellPrice) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>sellPrice</td>
                        <td className="fw-semibold">
                          {pnCurrencyAmount(details.sellPrice, details.sellCurrencyCode ?? "")}
                        </td>
                      </tr>
                    )}
                    {nn(details.VAT) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>VAT (세율)</td>
                        <td>
                          {(Number(details.VAT) / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          %
                        </td>
                      </tr>
                    )}
                    {nn(details.sellPriceConverted) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>환산 가격</td>
                        <td>{pnCurrencyAmount(details.sellPriceConverted, convCurr)}</td>
                      </tr>
                    )}
                    {details.conversionRate ? (
                      <tr>
                        <td style={LABEL_COL_STYLE}>환율</td>
                        <td>{String(details.conversionRate)}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <div style={SECTION_TITLE_STYLE}>정가 / 프로모션</div>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {nn(details.SRPBeforePromo) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>SRP (할인 전)</td>
                        <td>{pnCurrencyAmount(details.SRPBeforePromo, convCurr)}</td>
                      </tr>
                    )}
                    {nn(details.SRP) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>SRP</td>
                        <td className="fw-semibold">{pnCurrencyAmount(details.SRP, convCurr)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={LABEL_COL_STYLE}>프로모션</td>
                      <td>
                        {details.promoName ? (
                          <>
                            <span className="badge bg-warning text-dark">{details.promoName}</span>
                            <small className="ms-2 text-warning">
                              {Number(details.promoDiscountPct ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })}
                              % 할인
                            </small>
                          </>
                        ) : (
                          <span className="text-muted">없음</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <div style={SECTION_TITLE_STYLE}>수익 배분</div>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {nn(details.revSharePct) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>revSharePct</td>
                        <td>
                          <span className="badge bg-info">{String(details.revSharePct)}%</span>
                        </td>
                      </tr>
                    )}
                    {nn(details.publisherShareAmount) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>퍼블리셔</td>
                        <td className="fw-semibold text-success">
                          {pnCurrencyAmount(
                            details.publisherShareAmount,
                            details.publisherCurrencyCode ?? "",
                          )}
                        </td>
                      </tr>
                    )}
                    {nn(details.sellerShareAmount) && (
                      <tr>
                        <td style={LABEL_COL_STYLE}>셀러</td>
                        <td className="fw-semibold text-info">
                          {pnCurrencyAmount(
                            details.sellerShareAmount,
                            details.sellerCurrencyCode ?? "",
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {capsuleID && (
        <div className="card mb-3">
          <div className="card-body">
            <div style={SECTION_TITLE_STYLE}>관련 페이지</div>
            <div className="d-flex gap-2 flex-wrap">
              <a href={capsuleHref} className="btn btn-sm btn-outline-info">
                <i className="mdi mdi-cube-outline" /> 캡슐 상세
              </a>
            </div>
          </div>
        </div>
      )}

      <PnJsonBox data={result} />
    </>
  );
};
