import { useKoreanPatchList } from "@entities/korean-patch";

// legacy korean_patch.php — 한글패치 현황.
export const GoodsKoreanPatchScreen = () => {
  const { data } = useKoreanPatchList();
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
                    한글패치 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">한글패치 현황</li>
              </ol>
            </div>
            <h4 className="page-title">한글패치 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">한글패치 리스트</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">한글패치명</th>
                      <th className="text-center">암호화 key</th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {data.items.map((item, i) => (
                      <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td className="text-start">{item.goods_nm}</td>
                        <td>{item.prefix_text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
