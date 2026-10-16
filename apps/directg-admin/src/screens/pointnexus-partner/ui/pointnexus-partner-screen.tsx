import {
  usePointNexusPartners,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnAsArray,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_partner";

// legacy: persona 옵션·색상 맵.
const PERSONAS: { value: string; label: string }[] = [
  { value: "", label: "(전체)" },
  { value: "publisher", label: "publisher" },
  { value: "manufacturer", label: "manufacturer" },
  { value: "distributor", label: "distributor" },
  { value: "store", label: "store" },
  { value: "influencer", label: "influencer" },
  { value: "platform", label: "platform" },
  { value: "trader", label: "trader" },
];

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
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};
const BADGE_STYLE: React.CSSProperties = { fontSize: "12px", fontWeight: 500 };

// legacy pointnexus_partner.php — PointNexus 파트너 목록.
export const PointNexusPartnerScreen = ({ mode, persona }: { mode: PnMode; persona: string }) => {
  const { data: result } = usePointNexusPartners(mode, persona);
  if (!result) {
    return null;
  }

  const error = result.success ? "" : pnExtractError(result);
  const partners = result.success ? pnAsArray(result.data) : [];
  const total = result.count ?? partners.length;

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
                <li className="breadcrumb-item active">PointNexus 파트너 목록</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 파트너 목록 <small className="text-muted">GET /partner</small>
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
                      <PnModeSelect mode={mode} autoSubmit={false} />
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="row g-2">
                    <label
                      htmlFor="persona"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      persona
                    </label>
                    <div className="col-9">
                      <select
                        className="form-control form-control-sm"
                        id="persona"
                        name="persona"
                        defaultValue={persona}
                        onChange={(e) => e.currentTarget.form?.submit()}
                      >
                        {PERSONAS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-2 text-end">
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
            <div className="col-12 text-muted">
              전체 <strong className="text-dark">{total.toLocaleString()}</strong>개 파트너
              {persona ? ` (persona: ${persona})` : ""}
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
                        <th>이름</th>
                        <th className="text-center" style={{ width: "120px" }}>
                          persona
                        </th>
                        <th className="text-center" style={{ width: "90px" }}>
                          useAPI
                        </th>
                        <th className="text-center" style={{ width: "100px" }}>
                          계약 수
                        </th>
                        <th className="text-center" style={{ width: "200px" }}>
                          파트너 ID
                        </th>
                        <th className="text-center" style={{ width: "60px" }} />
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {partners.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            파트너가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        partners.map((p, i) => {
                          const pid = p.id ?? "";
                          const pper = p.persona ?? "";
                          const color = PERSONA_COLORS[pper] ?? "secondary";
                          const contracts = Array.isArray(p.contracts) ? p.contracts : [];
                          return (
                            <tr key={i}>
                              <td className="text-center text-muted">{i + 1}</td>
                              <td className="fw-semibold">{p.name ?? "—"}</td>
                              <td className="text-center">
                                <span className={`badge bg-${color}`} style={BADGE_STYLE}>
                                  {pper ? pper : "—"}
                                </span>
                              </td>
                              <td className="text-center">
                                {p.useAPI ? (
                                  <span className="badge bg-success" style={BADGE_STYLE}>
                                    true
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary" style={BADGE_STYLE}>
                                    false
                                  </span>
                                )}
                              </td>
                              <td className="text-center">{contracts.length}개</td>
                              <td className="text-center" style={UUID_STYLE}>
                                {pid}
                              </td>
                              <td className="text-center">
                                <a
                                  href={`/goods/pointnexus/pointnexus_partner_view?mode=${encodeURIComponent(mode)}&partnerID=${encodeURIComponent(pid)}`}
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
