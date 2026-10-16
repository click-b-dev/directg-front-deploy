import {
  useGenbaProductList,
  useGenbaTitlePublishers,
  useSyncGenbaProduct,
  useSyncGenbaProductItem,
  useSyncGenbaPrice,
  useSyncGenbaStock,
  useRequestGenbaPreLive,
  type GenbaProductSearch,
  type GenbaProductItem,
} from "@entities/genba";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/genba/genba_product_sync";
const PER_PAGE = 50;

// legacy PreLiveStateLabel 맵.
const PRE_LIVE_STATE_LABEL: Record<string, string> = {
  "0": "NO_PRE_LIVE",
  "1": "LIVE",
  "2": "PRE_LIVE_PENDING",
  "3": "NO_RELATIONSHIP",
  "4": "DECLINED",
};

const PRE_LIVE_STATE_FILTER = ["0", "1", "2", "3", "4"];

const fmtWsp = (v: number) =>
  v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy genba_product_sync.php — Genba 상품 관리.
export const GenbaProductSyncScreen = (search: GenbaProductSearch) => {
  const { data } = useGenbaProductList(search);
  const { data: publisherData } = useGenbaTitlePublishers();
  const syncProduct = useSyncGenbaProduct();

  if (!data || !publisherData) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;

  const onProductSync = () => {
    syncProduct.mutate(undefined, { onSuccess: (res) => window.alert(res.message) });
  };

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
                    Genba 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 상품 관리</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 상품 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

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
                        placeholder="Genba ProductID"
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
                        placeholder="Genba Sku"
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
                      Name
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_name"
                        name="search_name"
                        placeholder="Genba Name"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-8">
                  <div className="row g-2">
                    <label
                      htmlFor="search_appid"
                      className="col-sm-2 col-form-label col-form-label-sm bg-light border"
                    >
                      PreLiveState
                    </label>
                    <div className="col-sm-10 pt-1">
                      {PRE_LIVE_STATE_FILTER.map((v) => (
                        <div className="form-check form-check-inline" key={v}>
                          <input
                            type="radio"
                            id={`PreLiveState_${v}`}
                            name="PreLiveState"
                            className="form-check-input"
                            value={v}
                            defaultChecked={search.PreLiveState === v}
                          />
                          <label className="form-check-label" htmlFor={`PreLiveState_${v}`}>
                            {PRE_LIVE_STATE_LABEL[v]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="row g-2">
                    <label
                      htmlFor="search_publisher"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      Publisher
                    </label>
                    <div className="col-9">
                      <select
                        name="search_publisher"
                        className="form-select"
                        defaultValue={search.search_publisher}
                      >
                        <option value="">:::선택:::</option>
                        {publisherData.items.map((p) => (
                          <option key={p.Publisher} value={p.Publisher}>
                            {p.Publisher}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-0 mt-1">
                <div className="col-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary btn-sm shadow-none">
                      Genba 상품 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{total_results.toLocaleString()} 개</div>
          <div className="float-end">
            <button
              type="button"
              className="btn btn-info btn-sm shadow-none"
              onClick={onProductSync}
            >
              Genba 상품 동기화
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Genba 상품 현황</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light font-12">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">
                        ProductID
                        <br />
                        (Sku)
                      </th>
                      <th className="text-center">Name</th>
                      <th className="text-center">
                        ReleaseDate
                        <br />
                        (DigitalReleaseDate)
                        <br />
                        (EndDate)
                      </th>
                      <th className="text-center">PreReleaseDate</th>
                      <th className="text-center">Srp</th>
                      <th className="text-center">Wsp</th>
                      <th className="text-center">
                        EtailerSplit
                        <br />
                        Percentage
                      </th>
                      <th className="text-center">
                        PreLive
                        <br />
                        State
                      </th>
                      <th className="text-center">가격업데이트</th>
                      <th className="text-center">동기화</th>
                      <th className="text-center">재고확인</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, index) => (
                      <GenbaProductRow
                        key={`${item.ProductID}-${index}`}
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
                    search_publisher: search.search_publisher,
                    PreLiveState: search.PreLiveState,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const GenbaProductRow = ({ item, num }: { item: GenbaProductItem; num: number }) => {
  const syncPrice = useSyncGenbaPrice();
  const syncItem = useSyncGenbaProductItem();
  const syncStock = useSyncGenbaStock();
  const requestPreLive = useRequestGenbaPreLive();

  const alertMsg = (res: { message: string }) => window.alert(res.message);

  return (
    <tr className={item.row_danger ? "text-danger" : ""}>
      <td className="text-center">{num}</td>
      <td className="text-center font-12">
        {item.ProductID}
        <br />({item.Sku})
      </td>
      <td className="text-start">
        {item.Name}
        {item.IsBundle}
        <br />
        <span className="badge bg-secondary text-light font-12">{item.Publisher}</span>{" "}
        <span className="badge bg-secondary text-light font-12">
          {item.RegionCode.toUpperCase()}
        </span>
      </td>
      <td className="text-center font-11">
        {item.ReleaseDate}
        <br />({item.DigitalReleaseDate})<br />({item.EndDate})
      </td>
      <td className="text-center font-11">
        {item.PreReleaseDate}
        {item.is_presale_available && (
          <>
            <br />
            (예약판매가능)
          </>
        )}
      </td>
      <td className="text-end font-11">{item.Srp.toLocaleString()}</td>
      <td className="text-end font-11">{fmtWsp(item.Wsp)}</td>
      <td className="text-end font-11">{item.EtailerSplitPercentage}</td>
      <td className="text-center font-11">
        {(item.PreLiveState === "0" || item.PreLiveState === "1" || item.PreLiveState === "2") &&
          PRE_LIVE_STATE_LABEL[item.PreLiveState]}
        {item.PreLiveState === "0" && (
          <>
            <br />
            <button
              type="button"
              className="btn btn-secondary btn-sm shadow-none btn_prelive_request"
              data-sku={item.Sku}
              onClick={() => requestPreLive.mutate({ sku: item.Sku }, { onSuccess: alertMsg })}
            >
              pre-live 요청
            </button>
          </>
        )}
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-info shadow-none btn_price_sync font-12"
          data-productid={item.ProductID}
          onClick={() => syncPrice.mutate({ productid: item.ProductID }, { onSuccess: alertMsg })}
        >
          가격동기화
        </button>
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-primary shadow-none btn_product_sync font-12"
          data-sku={item.Sku}
          onClick={() => syncItem.mutate({ sku: item.Sku }, { onSuccess: alertMsg })}
        >
          동기화
        </button>
      </td>
      <td className="text-center">
        {item.StockStatus === "0" && <span className="text-danger fw-bold">품절</span>}
        <br />
        <button
          type="button"
          className="btn btn-sm btn-success shadow-none btn_stock_sync font-12"
          data-sku={item.Sku}
          onClick={() => syncStock.mutate({ sku: item.Sku }, { onSuccess: alertMsg })}
        >
          재고확인
        </button>
      </td>
    </tr>
  );
};
