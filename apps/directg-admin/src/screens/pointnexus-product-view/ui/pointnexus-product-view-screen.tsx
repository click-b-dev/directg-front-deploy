import {
  usePointNexusProductRetrieve,
  PnModeSelect,
  PnJsonBox,
  pnExtractError,
  pnFirstData,
  pnFmtDate,
  pnFmtPrice,
  pnGetLang,
  pnIsRelevantCurrency,
  pnFilterCurrencies,
  pnFilterCountries,
  type PnMode,
  type PnProductDetail,
  type PnPrice,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_product_view";

const PRODUCT_ID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};
const PROMO_PRICE_STYLE: React.CSSProperties = { color: "#f59e0b", fontWeight: 700 };
const ORIGIN_PRICE_STYLE: React.CSSProperties = {
  textDecoration: "line-through",
  color: "#6c757d",
  fontSize: "12px",
};
const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#6c757d",
  borderBottom: "1px solid #e0e0e0",
  paddingBottom: "6px",
  marginBottom: "14px",
};
const LABEL_COL_STYLE: React.CSSProperties = {
  width: "130px",
  fontSize: "12px",
  color: "#6c757d",
  whiteSpace: "nowrap",
};
const DESCRIPTION_BOX_STYLE: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.8,
  maxHeight: "500px",
  overflowY: "auto",
  background: "#f8f9fa",
  borderRadius: "6px",
  padding: "16px",
};

// legacy pointnexus_product_view.php — PointNexus 상품 상세.
export const PointNexusProductViewScreen = ({ mode, id }: { mode: PnMode; id: string }) => {
  const { data: result } = usePointNexusProductRetrieve(mode, id);

  const product =
    id && result && result.success && result.data ? pnFirstData(result.data) : undefined;
  const error = id && result && !product ? pnExtractError(result) : "";
  const headTitle = product?.genericName || "PointNexus 상품 상세";

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
                <li className="breadcrumb-item active">PointNexus 상품 상세</li>
              </ol>
            </div>
            <h4 className="page-title">
              {headTitle} <small className="text-muted">GET /product/{"{id}"}</small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row g-0">
        <div className="card">
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <PnModeSelect mode={mode} autoSubmit={false} />
                    </div>
                  </div>
                </div>
                <div className="col-8">
                  <div className="row g-2">
                    <label
                      htmlFor="id"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      상품 UUID
                    </label>
                    <div className="col-10">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="id"
                        name="id"
                        defaultValue={id}
                        placeholder="예: a536a4ff-b110-40f8-bde1-777f7ef842b2"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none">
                    조회
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {!id ? (
        <div className="alert alert-info">상품 UUID를 입력하세요.</div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="mdi mdi-alert" /> {error}
        </div>
      ) : product ? (
        <ProductDetail product={product} result={result} />
      ) : (
        result && <div className="alert alert-warning">데이터 없음</div>
      )}
    </>
  );
};

const ProductDetail = ({ product, result }: { product: PnProductDetail; result: unknown }) => {
  const name = product.genericName || "—";
  const platform = product.platform || "—";
  const publisher = product.publisher || "—";
  const type = product.type || "—";
  const edition = product.edition || "";
  const copyright = product.copyright || "";
  const genres = Array.isArray(product.genres) ? product.genres : [];
  const prices = Array.isArray(product.prices) ? product.prices : [];
  const currencies = Array.isArray(product.allowedCurrencies) ? product.allowedCurrencies : [];
  const countries = Array.isArray(product.allowedCountries) ? product.allowedCountries : [];
  const releaseDate = pnFmtDate(product.releaseDate, 10);
  const updatedAt = pnFmtDate(product.lastUpdatedAt, 19);
  const platformSKU = product.platformSKU || "—";
  const publisherSKU = product.publisherSKU || "—";
  const steamAppID = product.steamAppID || "";
  const shortDesc = pnGetLang(product.shortDescription);
  const longDesc = pnGetLang(product.longDescription);

  const shownPrices = prices.filter((pr) => pnIsRelevantCurrency(pr.currency));
  const hiddenRows = prices.length - shownPrices.length;
  const cf = pnFilterCurrencies(currencies);
  const kf = pnFilterCountries(countries);

  return (
    <>
      <div className="row g-3">
        {/* 기본 정보 */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>기본 정보</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>상품명</td>
                    <td className="fw-semibold">{name}</td>
                  </tr>
                  {edition && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>에디션</td>
                      <td>{edition}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={LABEL_COL_STYLE}>플랫폼</td>
                    <td>
                      <span className="badge bg-info">{platform}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>퍼블리셔</td>
                    <td>{publisher}</td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>타입</td>
                    <td>
                      <span className="badge bg-secondary">{type}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>프리오더</td>
                    <td>
                      {product.isPreOrder ? (
                        <span className="badge bg-warning text-dark">프리오더</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                  {genres.length > 0 && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>장르</td>
                      <td>
                        {genres.map((g, i) => (
                          <span className="badge bg-light text-dark border me-1" key={i}>
                            {g}
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={LABEL_COL_STYLE}>출시일</td>
                    <td>{releaseDate}</td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>최종 업데이트</td>
                    <td>{updatedAt}</td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>플랫폼 SKU</td>
                    <td style={PRODUCT_ID_STYLE}>{platformSKU}</td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>퍼블리셔 SKU</td>
                    <td style={PRODUCT_ID_STYLE}>{publisherSKU}</td>
                  </tr>
                  {steamAppID && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>Steam App ID</td>
                      <td>
                        <a
                          href={`https://store.steampowered.com/app/${encodeURIComponent(steamAppID)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-info text-decoration-none"
                        >
                          {steamAppID} <i className="mdi mdi-open-in-new" />
                        </a>
                      </td>
                    </tr>
                  )}
                  {copyright && (
                    <tr>
                      <td style={LABEL_COL_STYLE}>저작권</td>
                      <td className="text-muted">{copyright}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={LABEL_COL_STYLE}>상품 ID</td>
                    <td style={PRODUCT_ID_STYLE}>{product.id || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>가격 정보</div>
              {prices.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{ width: "70px" }}>
                          통화
                        </th>
                        <th className="text-center">정가</th>
                        <th className="text-center">판매가</th>
                        <th className="text-center" style={{ width: "90px" }}>
                          프로모션
                        </th>
                        <th>판매 국가</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownPrices.map((pr, i) => (
                        <PriceRow key={i} pr={pr} />
                      ))}
                      {hiddenRows > 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            외 {hiddenRows}개 통화 가격 정보 숨김 (KRW · JPY · USD 외)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">가격 정보 없음</p>
              )}
            </div>
          </div>

          {/* 판매 범위 */}
          <div className="card mt-3">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>판매 범위</div>
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td style={LABEL_COL_STYLE}>허용 통화</td>
                    <td>
                      {currencies.length > 0 ? (
                        <>
                          {cf.shown.map((c) => (
                            <span className="badge bg-light text-dark border me-1" key={c}>
                              {c}
                            </span>
                          ))}
                          {cf.hidden > 0 && (
                            <span className="badge bg-secondary me-1">외 {cf.hidden}개</span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={LABEL_COL_STYLE}>판매 국가 수</td>
                    <td>
                      <span className="badge bg-secondary">{countries.length}개국</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              {countries.length > 0 && (
                <div className="mt-2">
                  {kf.shown.map((c) => (
                    <span className="badge bg-light text-dark border me-1" key={c}>
                      {c}
                    </span>
                  ))}
                  {kf.hidden > 0 && (
                    <span className="badge bg-secondary me-1">외 {kf.hidden}개국</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div style={SECTION_TITLE_STYLE}>짧은 설명</div>
              {shortDesc ? (
                <p className="mb-4" style={{ fontSize: "13px", lineHeight: 1.8 }}>
                  {shortDesc}
                </p>
              ) : (
                <p className="text-muted mb-4">정보 없음</p>
              )}
              <div style={SECTION_TITLE_STYLE}>긴 설명</div>
              {longDesc ? (
                // legacy: 긴 설명은 HTML 그대로 렌더(description-box)
                <div style={DESCRIPTION_BOX_STYLE} dangerouslySetInnerHTML={{ __html: longDesc }} />
              ) : (
                <p className="text-muted mb-0">정보 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PnJsonBox data={result} />
    </>
  );
};

const PriceRow = ({ pr }: { pr: PnPrice }) => {
  const pcc = pr.currency || "";
  const kf = pnFilterCountries(pr.allowedCountries);
  return (
    <tr>
      <td className="text-center">
        <span className="badge bg-light text-dark border">{pcc}</span>
      </td>
      <td className="text-center">
        {pr.promo ? (
          <span style={ORIGIN_PRICE_STYLE}>{pnFmtPrice(pr.initialFormatted)}</span>
        ) : (
          <span>{pnFmtPrice(pr.priceFormatted)}</span>
        )}
      </td>
      <td className="text-center">
        {pr.promo ? (
          <span style={PROMO_PRICE_STYLE}>{pnFmtPrice(pr.priceFormatted)}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="text-center">
        {pr.promo ? (
          <span className="badge bg-warning text-dark">
            {typeof pr.promo === "string" ? pr.promo : "ON"}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        {pr.allowedCountries && pr.allowedCountries.length > 0 ? (
          <>
            {kf.shown.map((c) => (
              <span className="badge bg-light text-dark border me-1" key={c}>
                {c}
              </span>
            ))}
            {kf.hidden > 0 && <span className="badge bg-secondary me-1">외 {kf.hidden}개국</span>}
          </>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
    </tr>
  );
};
