import { usePlatformList } from "@entities/code";

// legacy code/platform_list.php — 플랫폼 설정.
export const CodePlatformListScreen = () => {
  const { data } = usePlatformList();
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
                    코드 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">플랫폼 설정</li>
              </ol>
            </div>
            <h4 className="page-title">플랫폼 설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body py-1 px-0">
              <table className="table table-centered mb-0 table-sm">
                <thead className="table-dark font-14">
                  <tr>
                    <th className="text-center">플랫폼코드</th>
                    <th className="text-center">플랫폼명</th>
                    <th className="text-center">사용여부</th>
                  </tr>
                </thead>
                <tbody className="font-13">
                  {data.items.map((item) => (
                    <tr key={item.idx}>
                      <td className="text-center">{item.idx}</td>
                      <td>{item.platform}</td>
                      <td className="text-center">{item.flag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-6" />
      </div>
    </>
  );
};
