import { useZtormPing } from "@entities/ztorm";

// legacy ztorm_ping.php — Ztorm 연결 확인.
export const ZtormPingScreen = () => {
  const { data } = useZtormPing();
  if (!data) {
    return null;
  }

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
                    상품
                  </a>
                </li>
                {/* legacy copy-paste quirk: Ztorm이어야 하나 "Genba 관리"로 표기 — 그대로 이식 */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Genba 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Ztorm 연결 확인</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 연결 확인</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* legacy: print_r(runPing()) 원시 덤프 */}
              <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
