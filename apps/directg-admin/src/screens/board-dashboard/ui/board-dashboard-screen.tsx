import { useEffect } from "react";

// legacy pc/_Admin_/board/dashboard_board.php — 미구현 스텁(레이아웃만).
// page-title-box(breadcrumb 홈/게시판/대시보드, h4 대시보드) + 빈 카드 1개. 데이터/API 없음.
export const BoardDashboardScreen = () => {
  useEffect(() => {
    document.title = "게시판 대시보드";
  }, []);

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item active">대시보드</li>
              </ol>
            </div>
            <h4 className="page-title">대시보드</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body" />
          </div>
        </div>
      </div>
    </>
  );
};
