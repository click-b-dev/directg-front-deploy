import { useVaultnConnectionPromotionView } from "@entities/vaultn";

// legacy vaultn_connection_promotion_view.php — Vaultn 프로모션 조회(sku/discountPercentage).
export const VaultnConnectionPromotionViewScreen = ({
  connectionGuid,
  promotionGuid,
}: {
  connectionGuid: string;
  promotionGuid: string;
}) => {
  const { data } = useVaultnConnectionPromotionView(connectionGuid, promotionGuid);
  if (!data) {
    return null;
  }

  const items = Array.isArray(data.items) ? data.items : [];

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
                    Valutn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Valutn 프로모션 조회</li>
              </ol>
            </div>
            <h4 className="page-title">Promotion (Retrieve all promotions)</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <table className="table table-bordered table-sm">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center">sku</th>
                    <th className="text-center">discountPercentage</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.sku}</td>
                      <td>{item.discountPercentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};
