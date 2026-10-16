import { useVaultnProductView, type VaultnProductRetrieveProduct } from "@entities/vaultn";

// legacy print_r 대응: scalar는 문자열, 그 외는 JSON 덤프.
const dump = (v: unknown) => {
  if (v == null) {
    return "";
  }
  if (typeof v === "object") {
    return JSON.stringify(v, null, 2);
  }
  return String(v);
};

// legacy valutn_product_view.php — Vaultn 상품 상세(runProductRetrieveAll).
export const VaultnProductViewScreen = ({
  productGUID,
  page,
}: {
  productGUID: string;
  page: number;
}) => {
  const { data } = useVaultnProductView(productGUID, page);
  if (!data) {
    return null;
  }

  const products = Array.isArray(data.products) ? data.products : [];

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
                <li className="breadcrumb-item active">Valutn 상품 조회</li>
              </ol>
            </div>
            <h4 className="page-title">ConnectionProduct (Retrieve all products by connection)</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* legacy: print_r($result) 원시 덤프 */}
      <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 table-sm table-bordered caption-top">
            <colgroup>
              <col width="20%" />
              <col width="*" />
            </colgroup>
            <tbody>
              {products.map((product, i) => (
                <ProductRows key={i} product={product} />
              ))}
            </tbody>
          </table>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const AttrRows = ({
  attrs,
  mode,
}: {
  attrs?: Record<string, unknown>;
  mode: "scalar" | "dump";
}) => {
  const entries = attrs ? Object.entries(attrs) : [];
  return (
    <>
      {entries.map(([key, value]) => (
        <tr key={key}>
          <th className="table-light text-center">{key}</th>
          <td className="text-start font-12">
            {mode === "scalar" ? String(value ?? "") : dump(value)}
          </td>
        </tr>
      ))}
    </>
  );
};

const ProductRows = ({ product }: { product: VaultnProductRetrieveProduct }) => (
  <>
    <AttrRows attrs={product.productCoreAttributes} mode="scalar" />
    <AttrRows attrs={product.productTypeAttributes} mode="dump" />
    <AttrRows attrs={product.skus} mode="dump" />
    <AttrRows attrs={product.assets} mode="dump" />
  </>
);
