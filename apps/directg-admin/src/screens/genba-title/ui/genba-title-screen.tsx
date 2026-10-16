import {
  useGenbaTitleList,
  useGenbaTitlePublishers,
  useSyncGenbaPrice,
  useSyncGenbaProduct,
  type GenbaTitleSearch,
  type GenbaTitleItem,
} from "@entities/genba";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/genba/genba_title";
const PER_PAGE = 50;

// legacy genba_title.php — Genba 타이틀 현황.
export const GenbaTitleScreen = (search: GenbaTitleSearch) => {
  const { data } = useGenbaTitleList(search);
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
                <li className="breadcrumb-item active">Genba 타이틀 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 타이틀 현황</h4>
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
              <div className="row g-2">
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
                <div className="col-3">
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
                <div className="col-3">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
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
                  <thead className="table-light font-14">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">ProductID</th>
                      <th className="text-center">Name</th>
                      <th className="text-center">Publisher</th>
                      <th className="text-center">ReleaseDate</th>
                      <th className="text-center">EtailerSplitPercentage</th>
                      <th className="text-center">동기화날짜</th>
                      <th className="text-center">가격업데이트</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, index) => (
                      <GenbaTitleRow
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
                    search_publisher: search.search_publisher,
                    search_name: search.search_name,
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

// legacy: 개별 가격동기화 버튼 → genba_api.php price → alert + 재조회.
const GenbaTitleRow = ({ item, num }: { item: GenbaTitleItem; num: number }) => {
  const syncPrice = useSyncGenbaPrice();

  return (
    <tr>
      <td className="text-center">{num}</td>
      <td className="text-center">{item.ProductID}</td>
      <td className="text-start">{item.Name}</td>
      <td className="text-start">{item.Publisher}</td>
      <td className="text-center">{item.ReleaseDate}</td>
      <td className="text-center">
        {item.EtailerSplitPercentage}
        <br />({item.is_krw})
      </td>
      <td className="text-center">{item.batch_date}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-info shadow-none btn_price_sync"
          data-productid={item.ProductID}
          onClick={() =>
            syncPrice.mutate(
              { productid: item.ProductID },
              { onSuccess: (res) => window.alert(res.message) },
            )
          }
        >
          가격동기화
        </button>
      </td>
    </tr>
  );
};
