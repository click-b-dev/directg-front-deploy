import {
  usePointNexusPartnerRetrieve,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  collectPnColumns,
  type PnMode,
  type PnPartnerDetail,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_partner_view";

const PERSONA_COLORS: Record<string, string> = {
  publisher: "primary",
  manufacturer: "success",
  distributor: "info",
  store: "warning",
  influencer: "danger",
  platform: "secondary",
  trader: "dark",
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

const GUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-/;

// legacy 계약 셀 렌더 — GUID는 .uuid 스타일(product_type PnCellValue와 다름).
const ContractCell = ({ value }: { value: unknown }) => {
  if (value !== null && typeof value === "object") {
    return <code style={{ fontSize: "11px" }}>{JSON.stringify(value)}</code>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={`badge bg-${value ? "success" : "secondary"}`}>
        {value ? "true" : "false"}
      </span>
    );
  }
  const s = value == null ? "" : String(value);
  if (GUID_PREFIX.test(s)) {
    return <span style={UUID_STYLE}>{s}</span>;
  }
  return <>{s}</>;
};

// legacy pointnexus_partner_view.php — PointNexus 파트너 상세.
export const PointNexusPartnerViewScreen = ({
  mode,
  partnerID,
}: {
  mode: PnMode;
  partnerID: string;
}) => {
  const { data: result } = usePointNexusPartnerRetrieve(mode, partnerID);

  const partner =
    partnerID && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = partnerID && result && !partner ? pnExtractError(result) : "";

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
                <li className="breadcrumb-item active">PointNexus 파트너 상세</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 파트너 상세{" "}
              <small className="text-muted">GET /partner/{"{partnerID}"}</small>
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
                      htmlFor="partnerID"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      파트너 UUID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="partnerID"
                        name="partnerID"
                        defaultValue={partnerID}
                        placeholder="예: bce51079-b46b-45bd-8029-e03f7d9578b9"
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

      {!partnerID ? (
        <div className="alert alert-info">파트너 UUID를 입력하세요.</div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : partner ? (
        <PartnerDetail partner={partner} partnerID={partnerID} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const PartnerDetail = ({
  partner,
  partnerID,
  result,
}: {
  partner: PnPartnerDetail;
  partnerID: string;
  result: unknown;
}) => {
  const pid = partner.id || partnerID;
  const pname = partner.name || "—";
  const pper = partner.persona || "—";
  const color = PERSONA_COLORS[pper] ?? "secondary";
  const contracts = Array.isArray(partner.contracts) ? partner.contracts : [];
  const contractKeys = collectPnColumns(contracts);

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div style={SECTION_TITLE_STYLE}>기본 정보</div>
          <table className="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <td style={LABEL_COL_STYLE}>이름</td>
                <td className="fw-semibold">{pname}</td>
              </tr>
              <tr>
                <td style={LABEL_COL_STYLE}>persona</td>
                <td>
                  <span className={`badge bg-${color}`}>{pper}</span>
                </td>
              </tr>
              <tr>
                <td style={LABEL_COL_STYLE}>useAPI</td>
                <td>
                  {partner.useAPI ? (
                    <span className="badge bg-success">true</span>
                  ) : (
                    <span className="badge bg-secondary">false</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={LABEL_COL_STYLE}>파트너 ID</td>
                <td style={UUID_STYLE}>{pid}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div style={SECTION_TITLE_STYLE}>계약 (contracts) — {contracts.length}건</div>
          {contracts.length === 0 ? (
            <p className="text-muted mb-0">계약 정보 없음</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "40px" }}>
                      #
                    </th>
                    {contractKeys.map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-12">
                  {contracts.map((ct, i) => (
                    <tr key={i}>
                      <td className="text-center text-muted">{i + 1}</td>
                      {contractKeys.map((k) => (
                        <td key={k}>
                          <ContractCell value={ct[k]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PnJsonBox data={result} />
    </>
  );
};
