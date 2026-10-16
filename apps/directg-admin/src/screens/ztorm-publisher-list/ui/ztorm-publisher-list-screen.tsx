import { useZtormPublisherList } from "@entities/ztorm";

// legacy ztorm_publisher_list.php — Ztorm 퍼블리셔 현황.
export const ZtormPublisherListScreen = () => {
  const { data } = useZtormPublisherList();
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
                    Ztorm 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Ztorm 퍼블리셔 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 퍼블리셔 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-14">
              <tr>
                <th className="text-center">퍼블리셔번호</th>
                <th className="text-center">퍼블리셔명</th>
                <th className="text-center">상품수</th>
                <th className="text-center">동기화</th>
              </tr>
            </thead>
            <tbody className="font-13 bg-white">
              {data.items.map((item) => (
                <tr key={item.publisher_id}>
                  <td className="text-center">{item.publisher_id}</td>
                  <td className="text-start">{item.publisher_name}</td>
                  <td className="text-center">{item.cc}</td>
                  <td className="text-center" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
