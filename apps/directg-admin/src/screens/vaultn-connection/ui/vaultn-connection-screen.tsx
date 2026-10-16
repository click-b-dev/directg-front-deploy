import { useVaultnConnections, type VaultnConnectionItem } from "@entities/vaultn";

// legacy vaultn_connection.php — Vaultn 퍼블리셔 현황.
export const VaultnConnectionScreen = () => {
  const { data } = useVaultnConnections();
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
                    Valutn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 퍼블리셔 현황</li>
              </ol>
            </div>
            {/* legacy: h4는 page_title이 아닌 하드코딩 문구 */}
            <h4 className="page-title">Connection V2(Returns a collection of connections)</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-centered w-100 table-sm table-bordered">
                  <thead className="table-dark font-13">
                    <tr>
                      <th className="text-center" style={{ width: "270px" }}>
                        connectionGuid
                        <br />
                        (created)
                      </th>
                      <th className="text-center" style={{ width: "120px" }}>
                        catalogSharingEnabled
                      </th>
                      <th className="text-center">connectedOwner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <VaultnConnectionRows key={item.guid} item={item} />
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

const VaultnConnectionRows = ({ item }: { item: VaultnConnectionItem }) => {
  const owner = item.connectedOwner;
  return (
    <>
      <tr>
        <td className="text-center font-12">
          <a href={`/goods/vaultn/vaultn_connection_product?connectionGuid=${item.guid}`}>
            {item.guid}
          </a>
          <br />({item.created})
        </td>
        {/* legacy: PHP echo bool → true "1" / false "" */}
        <td className="text-center p-0 font-12">{item.catalogSharingEnabled ? "1" : ""}</td>
        <td className="text-center p-1 font-12">
          <table className="table table-centered w-100 table-sm table-bordered">
            <thead className="table-light font-12">
              <tr>
                <th className="text-center" style={{ width: "200px" }}>
                  imageUrl
                </th>
                <th className="text-center">name</th>
                <th className="text-center">companyName</th>
                <th className="text-center">guid</th>
                <th className="text-center">country</th>
                <th className="text-center">timezone</th>
                <th className="text-center">defaultCurrencyCode</th>
              </tr>
            </thead>
            <tbody className="font-12">
              <tr>
                <td className="text-center">
                  <img src={owner.imageUrl} className="img-thumbnail" alt="" />
                </td>
                <td className="text-center">{owner.name}</td>
                <td className="text-center">{owner.companyName}</td>
                <td className="text-center">{owner.guid}</td>
                <td className="text-center">{owner.country}</td>
                <td className="text-center">{owner.timezone}</td>
                <td className="text-center">{owner.defaultCurrencyCode}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td colSpan={3}>
          <a href={`/goods/vaultn/vaultn_connection_promotion?connectionGuid=${item.guid}`}>
            프로모션 바로가기
          </a>
        </td>
      </tr>
    </>
  );
};
