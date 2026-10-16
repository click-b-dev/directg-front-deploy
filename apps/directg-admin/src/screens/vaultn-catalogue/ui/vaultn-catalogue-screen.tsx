import {
  useVaultnProductList,
  type VaultnProductSearch,
  type VaultnProductItem,
} from "@entities/vaultn";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/vaultn/vaultn_catalogue";
const PER_PAGE = 30;

const fmtPrice2 = (v: number) =>
  v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy vaultn_catalogue.php — Valutn 카탈로그 현황.
export const VaultnCatalogueScreen = (search: VaultnProductSearch) => {
  const { data } = useVaultnProductList(search);
  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;

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
                    Vaultn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Valutn 카탈로그 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Valutn 카탈로그 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{total_results.toLocaleString()} 개</div>
          </div>
        </div>
      </div>

      {/* 검색필터 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2 mb-2">
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="search_product_id"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      ProductID
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_product_id"
                        name="search_product_id"
                        placeholder="Vaultn ProductID"
                        defaultValue={search.search_product_id}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="search_sku"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      Sku
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_sku"
                        name="search_sku"
                        placeholder="Vaultn Sku"
                        defaultValue={search.search_sku}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row g-2">
                    <label
                      htmlFor="search_name"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      title
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_name"
                        name="search_name"
                        placeholder="Valutn Name"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-0 mt-1">
                <div className="col-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary btn-sm shadow-none">
                      Valutn 상품 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Vaultn Product</h5>
            <div className="table-responsive">
              <table className="table table-centered w-100 dt-responsive nowrap table-sm table-bordered">
                <thead className="table-light font-14">
                  <tr>
                    <th className="text-center">No</th>
                    <th className="text-center">publisher</th>
                    <th className="text-center">
                      productGUID
                      <br />
                      (sku)
                    </th>
                    <th className="text-center">title</th>
                    <th className="text-center">provider</th>
                    <th className="text-center">regionCode</th>
                    <th className="text-center">srp</th>
                    <th className="text-center">purchasePrice</th>
                    <th className="text-center">stock</th>
                    <th className="text-center">동기화날짜</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {data.items.map((item, index) => (
                    <VaultnCatalogueRow
                      key={`${item.productGUID}-${index}`}
                      item={item}
                      num={total_results - (index + (current_page - 1) * PER_PAGE)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-3">
              <ServerPagination
                page={current_page}
                totalPages={total_pages}
                baseUrl={BASE_URL}
                params={{
                  search_product_id: search.search_product_id,
                  search_sku: search.search_sku,
                  search_name: search.search_name,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const VaultnCatalogueRow = ({ item, num }: { item: VaultnProductItem; num: number }) => (
  <tr>
    <td className="text-center">{num}</td>
    <td className="text-center">{item.publisher}</td>
    <td>
      {item.productGUID}
      <br />({item.sku})
    </td>
    <td className="text-start">{item.title}</td>
    <td className="text-center">{item.provider}</td>
    <td className="text-center">{item.regionCode}</td>
    <td className="text-end">{item.srp.toLocaleString()}</td>
    <td className="text-end">{fmtPrice2(item.purchasePrice)}</td>
    <td className="text-end">
      {item.reservedUnits.toLocaleString()}
      <br />({item.networkUnits.toLocaleString()})
    </td>
    <td className="text-center">
      {item.batch_date}
      <br />({item.update_date})
    </td>
  </tr>
);
