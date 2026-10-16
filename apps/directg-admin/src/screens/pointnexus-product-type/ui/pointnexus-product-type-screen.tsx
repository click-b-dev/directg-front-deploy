import {
  usePointNexusProductTypes,
  PnModeSelect,
  PnJsonBox,
  PnCellValue,
  pnExtractError,
  pnAsArray,
  collectPnColumns,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_product_type";

// legacy pointnexus_product_type.php — PointNexus 상품 타입 목록.
export const PointNexusProductTypeScreen = ({ mode }: { mode: PnMode }) => {
  const { data: result } = usePointNexusProductTypes(mode);
  if (!result) {
    return null;
  }

  const error = result.success ? "" : pnExtractError(result);
  const types = result.success ? pnAsArray(result.data) : [];
  const total = result.count ?? types.length;
  const columns = collectPnColumns(types);

  return (
    <>
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
                    PointNexus 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">PointNexus 상품 타입 목록</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 상품 타입 목록 <small className="text-muted">GET /productType</small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row g-0">
        <div className="card">
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <PnModeSelect mode={mode} />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : (
        <>
          <div className="row mb-2">
            <div className="col-12 text-muted">
              전체 <strong className="text-dark">{total.toLocaleString()}</strong>개
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{ width: "40px" }}>
                          #
                        </th>
                        {columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {types.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 1} className="text-center text-muted py-4">
                            표시할 상품 타입이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        types.map((row, i) => (
                          <tr key={i}>
                            <td className="text-center text-muted">{i + 1}</td>
                            {columns.map((col) => (
                              <td key={col}>
                                <PnCellValue value={row[col]} />
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <PnJsonBox data={result} />
        </>
      )}
    </>
  );
};
