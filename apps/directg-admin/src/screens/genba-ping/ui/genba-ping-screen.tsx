import { useGenbaPing } from "@entities/genba";

// legacy genba_ping.php — Genba 연결 테스트.
export const GenbaPingScreen = () => {
  const { data } = useGenbaPing();
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
                    Genba 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 연결 테스트</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 연결 테스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* legacy: print_r(runGenbaPingAsync()) 원시 덤프 */}
              <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
