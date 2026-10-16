import {
  usePointNexusPing,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_ping";

// legacy pointnexus_ping.php — PointNexus 인증 상태 확인.
export const PointNexusPingScreen = ({ mode }: { mode: PnMode }) => {
  const { data: result } = usePointNexusPing(mode);
  if (!result) {
    return null;
  }

  const data = result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = data ? "" : pnExtractError(result);

  const isSandbox = !!data?.isSandbox;
  const provider = data?.authenticatedProvider;
  const credentials = data?.credentials;

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
                <li className="breadcrumb-item active">PointNexus 인증 상태 확인</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 인증 상태 확인 <small className="text-muted">GET /test</small>
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
        data && (
          <>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h5 className="card-title text-muted text-uppercase fs-6">환경</h5>
                    {isSandbox ? (
                      <>
                        <i
                          className="mdi mdi-flask-outline text-warning"
                          style={{ fontSize: "42px" }}
                        />
                        <h4 className="mt-3 mb-1">
                          <span className="badge bg-warning text-dark">SANDBOX</span>
                        </h4>
                        <small className="text-muted">테스트 환경입니다</small>
                      </>
                    ) : (
                      <>
                        <i
                          className="mdi mdi-rocket-launch text-danger"
                          style={{ fontSize: "42px" }}
                        />
                        <h4 className="mt-3 mb-1">
                          <span className="badge bg-danger">PRODUCTION</span>
                        </h4>
                        <small className="text-muted">운영 환경입니다</small>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted text-uppercase fs-6">인증된 Provider</h5>
                    {provider ? (
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr>
                            <th style={{ width: "90px" }}>이름</th>
                            <td>{provider.name ?? "—"}</td>
                          </tr>
                          <tr>
                            <th>persona</th>
                            <td>
                              <span className="badge bg-info">{provider.persona ?? "—"}</span>
                            </td>
                          </tr>
                          <tr>
                            <th>ID</th>
                            <td className="text-monospace small">{provider.id ?? "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted mb-0">정보 없음</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted text-uppercase fs-6">API 자격증명</h5>
                    {credentials ? (
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr>
                            <th style={{ width: "90px" }}>이름</th>
                            <td>{credentials.name ?? "—"}</td>
                          </tr>
                          <tr>
                            <th>clientID</th>
                            <td className="text-monospace small" style={{ wordBreak: "break-all" }}>
                              {credentials.clientID ?? "—"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted mb-0">정보 없음</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-3">
              <i className="mdi mdi-check-circle" /> 토큰이 정상적으로 인증되었습니다.
            </div>

            <PnJsonBox data={result} />
          </>
        )
      )}
    </>
  );
};
