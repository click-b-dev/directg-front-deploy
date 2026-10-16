import { useEffect } from "react";

// legacy dg_operation_service.php — 정적 빈 테이블(헤더만). 데이터/API 없음.
export const OperationServiceScreen = () => {
  useEffect(() => {
    document.title = "운영서비스 현황";
  }, []);

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                {/* legacy: 2번째가 "사이트설정"(타 사이트 페이지와 다름) — 그대로 이식 */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트설정
                  </a>
                </li>
                <li className="breadcrumb-item active">운영서비스 현황</li>
              </ol>
            </div>
            <h4 className="page-title">운영서비스 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered nowrap table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" style={{ width: "10%" }}>
                        시스템 분류
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        서비스 분류
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        서비스 용도
                      </th>
                      <th className="text-center" style={{ width: "20%" }}>
                        서비스 내용
                      </th>
                      <th className="text-center" style={{ width: "15%" }}>
                        서비스 기간
                      </th>
                      <th className="text-center" style={{ width: "10%" }}>
                        서비스 제공업체
                      </th>
                      <th className="text-center" style={{ width: "20%" }}>
                        운영관리업무
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
    </>
  );
};
