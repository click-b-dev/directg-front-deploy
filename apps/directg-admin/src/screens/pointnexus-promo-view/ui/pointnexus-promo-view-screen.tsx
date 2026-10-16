import {
  usePointNexusPromoRetrieve,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  pnFmtDate,
  pnFmtPrice,
  pnIsRelevantCurrency,
  type PnMode,
  type PnCampaignDetail,
  type PnCampaignProduct,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_promo_view";

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
const PROMO_PRICE_STYLE: React.CSSProperties = { color: "#f59e0b", fontWeight: 700 };
const ORIGIN_PRICE_STYLE: React.CSSProperties = {
  textDecoration: "line-through",
  color: "#6c757d",
  fontSize: "11px",
};

// legacy pointnexus_promo_view.php — PointNexus 프로모션 캠페인 상세.
export const PointNexusPromoViewScreen = ({ mode, id }: { mode: PnMode; id: string }) => {
  const { data: result } = usePointNexusPromoRetrieve(mode, id);

  const campaign =
    id && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = id && result && !campaign ? pnExtractError(result) : "";

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
                <li className="breadcrumb-item active">PointNexus 프로모션 캠페인 상세</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 프로모션 캠페인 상세{" "}
              <small className="text-muted">GET /promo/{"{id}"}</small>
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
                      캠페인 UUID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="id"
                        name="id"
                        defaultValue={id}
                        placeholder="예: 164e6469-cccc-41ab-bd0b-9843e3c0ecfb"
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
        <div className="alert alert-info">캠페인 UUID를 입력하세요.</div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : campaign ? (
        <CampaignDetail campaign={campaign} id={id} mode={mode} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const CampaignDetail = ({
  campaign,
  id,
  mode,
  result,
}: {
  campaign: PnCampaignDetail;
  id: string;
  mode: PnMode;
  result: unknown;
}) => {
  const name = campaign.name || "—";
  const state = campaign.state || "";
  const stateColor = STATE_COLORS[state] ?? "info";
  const issuer = campaign.issuer;
  const productIDs = Array.isArray(campaign.productIDs) ? campaign.productIDs : [];
  const products = Array.isArray(campaign.products) ? campaign.products : [];
  const targetCount = products.length > 0 ? products.length : productIDs.length;
  const cId = campaign.id || id;

  const productHref = (pid: string) =>
    `/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(pid)}`;

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>캠페인 정보</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>이름</td>
                    <td className="fw-semibold">{name}</td>
                  </tr>
                  {state && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>상태 (state)</td>
                      <td>
                        <span className={`badge bg-${stateColor}`}>{state}</span>
                      </td>
                    </tr>
                  )}
                  {campaign.startDate && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>시작일</td>
                      <td>{pnFmtDate(campaign.startDate, 19)}</td>
                    </tr>
                  )}
                  {campaign.endDate && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>종료일</td>
                      <td>{pnFmtDate(campaign.endDate, 19)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={LABEL_COL_STYLE}>캠페인 ID</td>
                    <td style={UUID_STYLE}>{cId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>발행자 (issuer)</div>
              {issuer ? (
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td style={LABEL_COL_STYLE}>이름</td>
                      <td>{issuer.name ?? "—"}</td>
                    </tr>
                    <tr>
                      <td style={LABEL_COL_STYLE}>ID</td>
                      <td style={UUID_STYLE}>{issuer.id ?? "—"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mb-0">발행자 정보 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div style={SECTION_TITLE_STYLE}>캠페인 대상 상품 ({targetCount}개)</div>
          {products.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "40px" }}>
                      #
                    </th>
                    <th>상품명</th>
                    <th className="text-center" style={{ width: "90px" }}>
                      기본 할인
                    </th>
                    <th>가격 (통화별)</th>
                    <th className="text-center" style={{ width: "200px" }}>
                      상품 ID
                    </th>
                    <th className="text-center" style={{ width: "60px" }} />
                  </tr>
                </thead>
                <tbody className="font-12">
                  {products.map((p, i) => (
                    <CampaignProductRow
                      key={p.id ?? i}
                      product={p}
                      num={i + 1}
                      href={productHref}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : productIDs.length > 0 ? (
            <table className="table table-sm table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: "40px" }}>
                    #
                  </th>
                  <th>상품 ID</th>
                  <th className="text-center" style={{ width: "60px" }} />
                </tr>
              </thead>
              <tbody>
                {productIDs.map((pid, i) => (
                  <tr key={i}>
                    <td className="text-center text-muted">{i + 1}</td>
                    <td style={UUID_STYLE}>{pid}</td>
                    <td className="text-center">
                      <a href={productHref(pid)} className="btn btn-sm btn-outline-info">
                        <i className="mdi mdi-eye" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted mb-0">대상 상품 정보 없음</p>
          )}
        </div>
      </div>

      <PnJsonBox data={result} />
    </>
  );
};

const CampaignProductRow = ({
  product: p,
  num,
  href,
}: {
  product: PnCampaignProduct;
  num: number;
  href: (pid: string) => string;
}) => {
  const pId = p.id || "";
  const pName = p.name || "—";
  const defPct = p.defaultDiscountPercent || 0;
  const prices = Array.isArray(p.prices) ? p.prices : [];
  const shown = prices.filter((pr) => pnIsRelevantCurrency(pr.currency?.name));
  const hiddenPp = prices.length - shown.length;

  return (
    <tr>
      <td className="text-center text-muted">{num}</td>
      <td className="fw-semibold">{pName}</td>
      <td className="text-center">
        {defPct > 0 ? (
          <span className="badge bg-warning text-dark">{Math.trunc(defPct)}%</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        {prices.length > 0 ? (
          <>
            {shown.map((pr, i) => {
              const currName = pr.currency?.name || "";
              const initFmt = pr.initialPrice?.formatted || "";
              const discFmt = pr.discountedPrice?.formatted || "";
              const discPct = pr.discount?.percent || 0;
              return (
                <div className="mb-1" style={{ fontSize: "12px", lineHeight: 1.5 }} key={i}>
                  <span
                    className="badge bg-light text-dark border me-1"
                    style={{ fontWeight: "normal" }}
                  >
                    {currName}
                  </span>
                  {discPct > 0 ? (
                    <>
                      <span style={ORIGIN_PRICE_STYLE}>{pnFmtPrice(initFmt)}</span>
                      <span style={PROMO_PRICE_STYLE} className="ms-1">
                        {pnFmtPrice(discFmt)}
                      </span>
                      <span className="text-warning ms-1">(-{Math.trunc(discPct)}%)</span>
                    </>
                  ) : (
                    <span>{pnFmtPrice(initFmt)}</span>
                  )}
                </div>
              );
            })}
            {hiddenPp > 0 && <span className="text-muted">외 {hiddenPp}개 통화</span>}
          </>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="text-center" style={UUID_STYLE}>
        {pId}
      </td>
      <td className="text-center">
        <a href={href(pId)} className="btn btn-sm btn-outline-info">
          <i className="mdi mdi-eye" />
        </a>
      </td>
    </tr>
  );
};
