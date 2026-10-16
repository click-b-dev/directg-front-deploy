import {
  useVaultnConnectionProduct,
  useVaultnSyncBatch,
  type VaultnConnProduct,
  type VaultnSku,
  type VaultnSkuPrice,
  type VaultnPromotion,
} from "@entities/vaultn";

const BASE_URL = "/goods/vaultn/vaultn_connection_product";
const PAGE_SIZE = 20;

const val = (v: unknown) => (v == null ? "" : String(v));

// legacy vaultn_connection_product.php — Vaultn Connection 상품(카탈로그 동기화).
export const VaultnConnectionProductScreen = ({
  connectionGuid,
  page,
}: {
  connectionGuid: string;
  page: number;
}) => {
  const { data } = useVaultnConnectionProduct(connectionGuid, page);
  const sync = useVaultnSyncBatch();

  if (!data) {
    return null;
  }

  const count = data.count || 0;
  const payload = Array.isArray(data.payload) ? data.payload : [];
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const syncPages = Math.ceil(count / 20);
  const startPage = Math.max(1, page - 5);
  const endPage = Math.min(totalPages, page + 5);

  const pageHref = (p: number) =>
    `${BASE_URL}?connectionGuid=${encodeURIComponent(connectionGuid)}&page=${p}`;

  const onSync = (p: number) => {
    sync.mutate({ connectionGuid, page: p }, { onSuccess: (res) => window.alert(res.message) });
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
                    Vaultn 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 카탈로그 동기화</li>
              </ol>
            </div>
            <h4 className="page-title">
              ConnectionProduct v3 (Retrieve all products by connection)
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div>총: {count.toLocaleString()}</div>

          <div className="d-flex flex-row mb-3 flex-wrap">
            {Array.from({ length: syncPages }, (_, i) => i + 1).map((p) => (
              <div className="pe-3" key={p}>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm btn_vaultn_sync"
                  disabled={sync.isPending}
                  onClick={() => onSync(p)}
                >
                  {p} 동기화
                </button>
              </div>
            ))}
          </div>

          <div className="table-responsive">
            {payload.map((product, i) => (
              <ProductTable key={product.guid ?? i} product={product} />
            ))}
          </div>

          {/* 페이징 */}
          <nav className="mt-3">
            <ul className="pagination pagination-sm justify-content-center flex-wrap">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <a className="page-link" href={pageHref(1)}>
                  «
                </a>
              </li>
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <a className="page-link" href={pageHref(page - 1)}>
                  ‹
                </a>
              </li>
              {Array.from(
                { length: Math.max(0, endPage - startPage + 1) },
                (_, k) => startPage + k,
              ).map((i) => (
                <li className={`page-item ${i === page ? "active" : ""}`} key={i}>
                  <a className="page-link" href={pageHref(i)}>
                    {i}
                  </a>
                </li>
              ))}
              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <a className="page-link" href={pageHref(page + 1)}>
                  ›
                </a>
              </li>
              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <a className="page-link" href={pageHref(totalPages)}>
                  »
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <tr>
    <th className="table-dark text-center font-12">{label}</th>
    <td className="text-start font-12">{children}</td>
  </tr>
);

const ProductTable = ({ product }: { product: VaultnConnProduct }) => {
  const skus = Array.isArray(product.skus) ? product.skus : [];
  return (
    <table className="table table-centered w-100 table-sm table-bordered caption-top">
      <tbody className="table-light">
        <Row label="guid">{val(product.guid)}</Row>
        <Row label="title">{val(product.title)}</Row>
        <Row label="publisher">{val(product.publisher)}</Row>
        <Row label="edition">{val(product.edition)}</Row>
        <Row label="franchise">{val(product.franchise)}</Row>
        <Row label="productType">{val(product.productType)}</Row>
        <Row label="skus">
          {skus.map((sku, i) => (
            <SkuTable key={i} sku={sku} />
          ))}
        </Row>
      </tbody>
    </table>
  );
};

const SkuTable = ({ sku }: { sku: VaultnSku }) => {
  const prices = Array.isArray(sku.prices) ? sku.prices : [];
  return (
    <table className="table table-centered w-100 table-sm table-bordered">
      <tbody className="table-light">
        <tr>
          <th className="table-dark">sku</th>
          <td>{val(sku.sku)}</td>
        </tr>
        <tr>
          <th className="table-dark">provider</th>
          <td>{val(sku.provider)}</td>
        </tr>
        <tr>
          <th className="table-dark">regionCode</th>
          <td>{val(sku.regionCode)}</td>
        </tr>
        <tr>
          <th className="table-dark">prices</th>
          <td>
            {prices.map((price, i) => (
              <PriceTable key={i} price={price} />
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const PriceTable = ({ price }: { price: VaultnSkuPrice }) => {
  const promos = Array.isArray(price.promotionDetails) ? price.promotionDetails : [];
  return (
    <table className="table table-centered w-100 table-sm table-bordered">
      <tbody className="table-light">
        <tr>
          <th className="table-dark">priceListGuid</th>
          <td>{val(price.priceListGuid)}</td>
        </tr>
        <tr>
          <th className="table-dark">srp</th>
          <td>{val(price.srp)}</td>
        </tr>
        <tr>
          <th className="table-dark">purchasePrice</th>
          <td>{val(price.purchasePrice)}</td>
        </tr>
        <tr>
          <th className="table-dark">priceListVAT</th>
          <td>{val(price.priceListVAT)}</td>
        </tr>
        <tr>
          <th className="table-dark">currencyCode</th>
          <td>{val(price.currencyCode)}</td>
        </tr>
        <tr>
          <th className="table-dark">pricePoint</th>
          <td>{val(price.pricePoint)}</td>
        </tr>
        <tr>
          <th className="table-dark">isActivePromotion</th>
          <td>{val(price.isActivePromotion)}</td>
        </tr>
        <tr>
          <th className="table-dark">promotionDetails</th>
          <td>
            {promos.map((promo, i) => (
              <PromotionTable key={i} promo={promo} />
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const PromotionTable = ({ promo }: { promo: VaultnPromotion }) => (
  <table className="table table-centered w-100 table-sm table-bordered">
    <tbody className="table-light">
      <tr>
        <th className="table-dark">promotionGuid</th>
        <td>{val(promo.promotionGuid)}</td>
      </tr>
      <tr>
        <th className="table-dark">promotionName</th>
        <td>{val(promo.promotionName)}</td>
      </tr>
      <tr>
        <th className="table-dark">startDate</th>
        <td>{val(promo.startDate)}</td>
      </tr>
      <tr>
        <th className="table-dark">endDate</th>
        <td>{val(promo.endDate)}</td>
      </tr>
      <tr>
        <th className="table-dark">discountedSrp</th>
        <td>{val(promo.discountedSrp)}</td>
      </tr>
      <tr>
        <th className="table-dark">discountedPurchasePrice</th>
        <td>{val(promo.discountedPurchasePrice)}</td>
      </tr>
      <tr>
        <th className="table-dark">discountType</th>
        <td>{val(promo.discountType)}</td>
      </tr>
      <tr>
        <th className="table-dark">discount</th>
        <td>{val(promo.discount)}</td>
      </tr>
      <tr>
        <th className="table-dark">discountCurrencyCode</th>
        <td>{val(promo.discountCurrencyCode)}</td>
      </tr>
    </tbody>
  </table>
);
