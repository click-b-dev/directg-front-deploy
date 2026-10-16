import { useEffect } from "react";

// legacy pc/_Admin_/promotion/dashboard_promotion.php — 정적 껍데기.
// page-title-box(연도 datepicker input-group + 새로고침 버튼 + h4 프로모션 대시보드)만 렌더.
// breadcrumb 없음, 본문 카드 없음. 데이터/API 없음.
// 죽은 스캐폴딩 미이식: apexcharts/jvectormap/demo.dashboard.js, $('#datepicker6').datepicker(year).
// datepicker는 무동작 컨트롤이므로 팝업 없이 마크업만 재현(board-dashboard #112 demo JS 미이식 선례).
export const PromotionDashboardScreen = () => {
  useEffect(() => {
    document.title = "프로모션 대시보드";
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box">
          <div className="page-title-right">
            <form className="d-flex" onSubmit={(event) => event.preventDefault()}>
              <div className="input-group">
                <div className="position-relative">
                  <input type="text" className="form-control" id="datepicker6" name="datepicker6" />
                </div>
                <span className="input-group-text bg-primary border-primary text-white">
                  <i className="mdi mdi-calendar-range font-13" />
                </span>
              </div>
              <a
                href="#"
                className="btn btn-primary ms-2"
                onClick={(event) => event.preventDefault()}
              >
                <i className="mdi mdi-autorenew" />
              </a>
            </form>
          </div>
          <h4 className="page-title">프로모션 대시보드</h4>
        </div>
      </div>
    </div>
  );
};
