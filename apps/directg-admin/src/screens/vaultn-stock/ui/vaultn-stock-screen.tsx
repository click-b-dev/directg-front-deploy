import { useVaultnStock, type VaultnStockItem } from "@entities/vaultn";

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

// legacy vaultn_stock.php — Vaultn 재고확인.
export const VaultnStockScreen = ({ page }: { page: number }) => {
  const { data } = useVaultnStock(page);
  if (!data) {
    return null;
  }

  const rows = Array.isArray(data.stockLevelInformation) ? data.stockLevelInformation : [];

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
                <li className="breadcrumb-item active">Valutn 재고확인</li>
              </ol>
            </div>
            <h4 className="page-title">Valutn 재고확인</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div>총: {num(data.recordCount).toLocaleString()}</div>
          <div className="table-responsive">
            <table className="table table-centered w-100 table-sm table-bordered caption-top">
              <thead className="table-dark font-13">
                <tr>
                  <th className="text-center">sku</th>
                  <th className="text-center">isKeyless</th>
                  <th className="text-center">title</th>
                  <th className="text-center">ownedUnits</th>
                  <th className="text-center">totalAvailableUnits</th>
                  <th className="text-center">connections</th>
                </tr>
              </thead>
              <tbody className="font-12">
                {rows.map((item, i) => (
                  <StockRow key={item.sku ?? i} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const StockRow = ({ item }: { item: VaultnStockItem }) => {
  const connections = Array.isArray(item.connections) ? item.connections : [];
  return (
    <tr>
      <td>{item.sku}</td>
      <td className="text-center">{String(item.isKeyless ?? "")}</td>
      <td>{item.title}</td>
      <td className="text-center">{String(item.ownedUnits ?? "")}</td>
      <td className="text-end">{num(item.totalAvailableUnits).toLocaleString()}</td>
      <td>
        {connections.length > 0 && (
          <table className="table table-bordered table-sm">
            <thead className="table-light font-12">
              <tr>
                <th>connectionGuid</th>
                <th>connectionName</th>
                <th>reservedUnits</th>
                <th>networkUnits</th>
                <th>totalAvailableUnits</th>
              </tr>
            </thead>
            <tbody className="font-12">
              {connections.map((conn, i) => (
                <tr key={conn.connectionGuid ?? i}>
                  <td>{conn.connectionGuid}</td>
                  <td className="text-center">{conn.connectionName}</td>
                  <td className="text-end">{num(conn.reservedUnits).toLocaleString()}</td>
                  <td className="text-end">{num(conn.networkUnits).toLocaleString()}</td>
                  <td className="text-end">{num(conn.totalAvailableUnits).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </td>
    </tr>
  );
};
