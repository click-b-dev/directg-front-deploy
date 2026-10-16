import {
  usePointNexusPromos,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnAsArray,
  pnFmtDate,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_promo";

// legacy: 캠페인 상태 색상 맵.
const STATE_COLORS: Record<string, string> = {
  running: "success",
  scheduled: "info",
  ended: "secondary",
  paused: "warning",
};

const UUID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};

// legacy pointnexus_promo.php — PointNexus 프로모션 캠페인 목록.
export const PointNexusPromoScreen = ({ mode }: { mode: PnMode }) => {
  const { data: result } = usePointNexusPromos(mode);
  if (!result) {
    return null;
  }

  const error = result.success ? "" : pnExtractError(result);
  const campaigns = result.success ? pnAsArray(result.data) : [];
  const total = result.count ?? campaigns.length;

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
                <li className="breadcrumb-item active">PointNexus 프로모션 캠페인 목록</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 프로모션 캠페인 목록 <small className="text-muted">GET /promo</small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row g-0">
        <div className="card">
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <PnModeSelect mode={mode} />
                    </div>
                  </div>
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
            <div className="col-12 text-muted">
              전체 <strong className="text-dark">{total.toLocaleString()}</strong>개 캠페인
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
                        <th>캠페인명</th>
                        <th>발행자 (issuer)</th>
                        <th className="text-center" style={{ width: "90px" }}>
                          상태
                        </th>
                        <th className="text-center" style={{ width: "80px" }}>
                          상품 수
                        </th>
                        <th className="text-center" style={{ width: "140px" }}>
                          시작일
                        </th>
                        <th className="text-center" style={{ width: "140px" }}>
                          종료일
                        </th>
                        <th className="text-center" style={{ width: "200px" }}>
                          캠페인 ID
                        </th>
                        <th className="text-center" style={{ width: "60px" }} />
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center text-muted py-4">
                            진행 중인 캠페인이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((c, i) => {
                          const cid = c.id ?? "";
                          const state = c.state ?? "";
                          const stateColor = STATE_COLORS[state] ?? "info";
                          const productIDs = Array.isArray(c.productIDs) ? c.productIDs : [];
                          return (
                            <tr key={i}>
                              <td className="text-center text-muted">{i + 1}</td>
                              <td className="fw-semibold">{c.name ?? "—"}</td>
                              <td>{c.issuer?.name ?? "—"}</td>
                              <td className="text-center">
                                {state ? (
                                  <span className={`badge bg-${stateColor}`}>{state}</span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-center">{productIDs.length}개</td>
                              <td className="text-center">{pnFmtDate(c.startDate, 16)}</td>
                              <td className="text-center">{pnFmtDate(c.endDate, 16)}</td>
                              <td className="text-center" style={UUID_STYLE}>
                                {cid}
                              </td>
                              <td className="text-center">
                                <a
                                  href={`/goods/pointnexus/pointnexus_promo_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(cid)}`}
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

          <PnJsonBox data={result} />
        </>
      )}
    </>
  );
};
