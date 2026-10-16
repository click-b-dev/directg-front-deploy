import { useVaultnConnectionProductView, type VaultnRegion } from "@entities/vaultn";

const val = (v: unknown) => (v == null ? "" : String(v));

// legacy valutn_connection_product_view.php — Vaultn Connection 상품 상세.
export const VaultnConnectionProductViewScreen = ({
  connectionGuid,
  productGUID,
}: {
  connectionGuid: string;
  productGUID: string;
}) => {
  const { data } = useVaultnConnectionProductView(connectionGuid, productGUID);
  if (!data) {
    return null;
  }

  const regions = Array.isArray(data.regions) ? data.regions : [];

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

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 table-sm table-bordered caption-top">
            <tbody>
              <Row label="guid">{val(data.guid)}</Row>
              <Row label="title">{val(data.title)}</Row>
              <Row label="publisher">{val(data.publisher)}</Row>
              <Row label="edition">{val(data.edition)}</Row>
              <Row label="franchise">{val(data.franchise)}</Row>
              <Row label="productType">{val(data.productType)}</Row>
              <tr>
                <th className="text-center font-12 bg-light">regions</th>
                <td className="text-start font-12">
                  <table className="table table-centered">
                    <thead>
                      <tr>
                        <th>RegionCode</th>
                        <th>keyProvider</th>
                        <th>sku</th>
                        <th>prices</th>
                        <th>agreements</th>
                        <th>country</th>
                        <th>salesCountries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regions.map((region, i) => (
                        <RegionRow key={i} region={region} />
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <tr>
    <th className="text-center font-12 bg-light">{label}</th>
    <td className="text-start font-12">{children}</td>
  </tr>
);

const RegionRow = ({ region }: { region: VaultnRegion }) => {
  const firstSku = Array.isArray(region.skus) ? region.skus[0] : undefined;
  const prices = Array.isArray(region.prices) ? region.prices : [];
  const regionCountries = Array.isArray(region.regionCountries) ? region.regionCountries : [];
  const salesCountries = Array.isArray(region.salesCountries) ? region.salesCountries : [];
  return (
    <tr>
      <td>{val(region.code)}</td>
      <td className="text-center">{val(firstSku?.keyProvider)}</td>
      <td>{val(firstSku?.sku)}</td>
      <td>
        <ol>
          {prices.map((price, i) => (
            <li key={i}>
              {val(price.countryCode)}/{val(price.currencyCode)}/{val(price.amount)}/
              {val(price.purchasePrice)}
            </li>
          ))}
        </ol>
      </td>
      <td>
        {/* legacy: print_r(agreements) */}
        {region.agreements == null ? "" : JSON.stringify(region.agreements)}
      </td>
      <td>
        <ol>
          {regionCountries.map((country, i) => (
            <li key={i}>
              {val(country.countryCode)}/{val(country.countryName)}
            </li>
          ))}
        </ol>
      </td>
      <td>
        <ol>
          {salesCountries.map((country, i) => (
            <li key={i}>
              {val(country.countryCode)}/{val(country.countryName)}
            </li>
          ))}
        </ol>
      </td>
    </tr>
  );
};
