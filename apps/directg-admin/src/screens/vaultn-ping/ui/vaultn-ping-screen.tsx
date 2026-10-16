import { useVaultnPing } from "@entities/vaultn";

// legacy vaultn_ping.php — Vaultn 연결 확인.
export const VaultnPingScreen = () => {
  const { data } = useVaultnPing();
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
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Vaultn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 연결 확인</li>
              </ol>
            </div>
            <h4 className="page-title">Vaultn 연결 확인</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* legacy: print_r(runVaultnPingPost()) 원시 덤프 */}
              <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
