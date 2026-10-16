import { useRef } from "react";
import {
  usePointNexusProducts,
  PnModeSelect,
  PnCursorPagination,
  pnExtractError,
  pnAsArray,
  pnFmtPrice,
  pnIsRelevantCurrency,
  pnFilterCurrencies,
  type PnMode,
  type PnProduct,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_product";

const PRICE_ROW_STYLE: React.CSSProperties = { whiteSpace: "nowrap", lineHeight: 1.7 };
const PROMO_PRICE_STYLE: React.CSSProperties = { color: "#f59e0b", fontWeight: 600 };
const ORIGIN_PRICE_STYLE: React.CSSProperties = {
  textDecoration: "line-through",
  color: "#6c757d",
  fontSize: "11px",
};
const PRODUCT_ID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};

// filters 예시(클릭 시 input에 채움).
const FILTER_EXAMPLES: { label: string; value: string }[] = [
  { label: "type = sale", value: '[{"field":"type","op":"=","value":"sale"}]' },
  { label: "platform = Steam", value: '[{"field":"platform","op":"=","value":"Steam"}]' },
  { label: "publisher = Focus", value: '[{"field":"publisher","op":"=","value":"Focus"}]' },
  { label: "isPreOrder = true", value: '[{"field":"isPreOrder","op":"=","value":true}]' },
  {
    label: "Steam + build (AND)",
    value:
      '[{"field":"platform","op":"=","value":"Steam"},{"field":"type","op":"=","value":"build"}]',
  },
];

type Props = { mode: PnMode; page: number; limit: number; filters: string };

// legacy pointnexus_product.php — PointNexus 판매 가능 상품 목록.
export const PointNexusProductScreen = ({ mode, page, limit, filters }: Props) => {
  const { data: result } = usePointNexusProducts(mode, page, limit, filters);
  const filtersRef = useRef<HTMLInputElement>(null);
  if (!result) {
    return null;
  }

  const error = result.success ? "" : pnExtractError(result);
  const products = result.success ? pnAsArray(result.data) : [];
  const offset = (page - 1) * limit;
  const hasMore = products.length > 0 && products.length >= limit;
  const pgParams: Record<string, string> = { mode, limit: String(limit) };
  if (filters) {
    pgParams.filters = filters;
  }

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
                <li className="breadcrumb-item active">PointNexus 판매 가능 상품 목록</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 판매 가능 상품 목록 <small className="text-muted">GET /product</small>
            </h4>
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
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="limit"
                      className="col-4 col-form-label col-form-label-sm bg-light border"
                    >
                      한 페이지
                    </label>
                    <div className="col-8">
                      <select
                        className="form-control form-control-sm"
                        id="limit"
                        name="limit"
                        defaultValue={String(limit)}
                      >
                        <option value="10">10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-7">
                  <div className="row g-2">
                    <label
                      htmlFor="filters"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      filters
                    </label>
                    <div className="col-10">
                      <input
                        ref={filtersRef}
                        type="text"
                        className="form-control form-control-sm"
                        id="filters"
                        name="filters"
                        placeholder='[{"field":"type","op":"=","value":"sale"}]'
                        defaultValue={filters}
                      />
                      <details className="mt-1">
                        <summary
                          className="text-muted"
                          style={{ cursor: "pointer", fontSize: "12px" }}
                        >
                          <i className="mdi mdi-help-circle-outline" /> filters 사용법 / 예시
                        </summary>
                        <div
                          className="border rounded p-2 mt-1"
                          style={{ fontSize: "12px", background: "#f8f9fa" }}
                        >
                          <div className="mb-1">
                            형식 <code>[{'{"field":"필드","op":"연산자","value":"값"}'}]</code> —
                            여러 개 넣으면 모두 만족(AND)
                          </div>
                          <div className="mb-1">
                            연산자 <code>=</code> <code>!=</code> <code>&gt;</code>{" "}
                            <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>IN</code>{" "}
                            <code>NOT IN</code>
                          </div>
                          <div className="mb-1">
                            주요 필드 <code>type</code> <code>platform</code> <code>publisher</code>{" "}
                            <code>genericName</code> <code>isPreOrder</code> <code>id</code>{" "}
                            <code>steamAppID</code> <code>releaseDate</code>{" "}
                            <code>lastUpdatedAt</code>
                          </div>
                          <div className="mb-1">
                            예시 (클릭하면 입력칸에 채워집니다 — 값만 바꿔 검색):
                          </div>
                          <div className="d-flex flex-wrap gap-1 mb-1">
                            {FILTER_EXAMPLES.map((ex) => (
                              <button
                                key={ex.label}
                                type="button"
                                className="btn btn-sm btn-outline-secondary py-0 px-1"
                                onClick={() => {
                                  if (filtersRef.current) {
                                    filtersRef.current.value = ex.value;
                                  }
                                }}
                              >
                                {ex.label}
                              </button>
                            ))}
                          </div>
                          <div className="text-danger">
                            ※ <code>=</code>는 정확히 일치만 됩니다(부분검색 X). 상품명 일부로
                            찾으려면{" "}
                            <a
                              href={`/goods/pointnexus/pointnexus_catalogue?mode=${encodeURIComponent(mode)}`}
                            >
                              카탈로그(DB) 페이지
                            </a>
                            의 키워드 검색을 쓰세요.
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-0 mt-1">
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none">
                    검색
                  </button>
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
            <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="text-muted">
                {products.length > 0 ? (
                  <>
                    {(offset + 1).toLocaleString()}–{(offset + products.length).toLocaleString()}{" "}
                    표시 &middot; 현재{" "}
                    <strong className="text-dark">{page.toLocaleString()}</strong> 페이지
                    {!hasMore && (
                      <>
                        {" "}
                        &middot; <span className="text-secondary">마지막 페이지</span>
                      </>
                    )}
                  </>
                ) : (
                  "결과 없음"
                )}
              </div>
              <PnCursorPagination
                page={page}
                hasMore={hasMore}
                baseUrl={BASE_URL}
                baseParams={pgParams}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered table-sm mb-0">
                    <thead className="table-light font-13">
                      <tr>
                        <th className="text-center" style={{ width: "40px" }}>
                          #
                        </th>
                        <th style={{ minWidth: "240px" }}>상품명 / 장르</th>
                        <th className="text-center" style={{ width: "80px" }}>
                          플랫폼
                        </th>
                        <th className="text-center" style={{ width: "120px" }}>
                          퍼블리셔
                        </th>
                        <th className="text-center" style={{ width: "80px" }}>
                          타입
                        </th>
                        <th className="text-center" style={{ width: "70px" }}>
                          프리오더
                        </th>
                        <th style={{ minWidth: "180px" }}>가격</th>
                        <th className="text-center" style={{ width: "120px" }}>
                          허용통화
                        </th>
                        <th className="text-center" style={{ width: "80px" }}>
                          판매국가
                        </th>
                        <th className="text-center" style={{ width: "100px" }}>
                          출시일
                        </th>
                        <th className="text-center" style={{ width: "200px" }}>
                          상품 ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center text-muted py-4">
                            표시할 상품이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        products.map((p, i) => (
                          <ProductRow
                            key={p.id ?? i}
                            product={p}
                            num={offset + i + 1}
                            mode={mode}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 mb-2">
            <PnCursorPagination
              page={page}
              hasMore={hasMore}
              baseUrl={BASE_URL}
              baseParams={pgParams}
            />
          </div>
        </>
      )}
    </>
  );
};

const ProductRow = ({
  product: p,
  num,
  mode,
}: {
  product: PnProduct;
  num: number;
  mode: PnMode;
}) => {
  const name = p.genericName ?? "—";
  const platform = p.platform ?? "—";
  const publisher = p.publisher ?? "—";
  const type = p.type ?? "—";
  const genres = Array.isArray(p.genres) ? p.genres : [];
  const prices = Array.isArray(p.prices) ? p.prices : [];
  const releaseDate = p.releaseDate ? String(p.releaseDate).slice(0, 10) : "—";
  const pid = p.id ?? "";
  const countryCount = Array.isArray(p.allowedCountries) ? p.allowedCountries.length : 0;
  const cf = pnFilterCurrencies(p.allowedCurrencies);

  // 가격 셀: relevant 통화만, promo면 원가 취소선 + 프로모가.
  const shownPrices = prices.filter((pr) => pnIsRelevantCurrency(pr.currency));
  const hiddenPrices = prices.length - shownPrices.length;

  return (
    <tr>
      <td className="text-center text-muted">{num}</td>
      <td>
        <div className="fw-semibold">
          <a
            href={`/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(pid)}`}
            className="text-dark text-decoration-none"
          >
            {name}
          </a>
        </div>
        {genres.length > 0 && (
          <div className="mt-1">
            {genres.map((g, gi) => (
              <span className="badge bg-light text-dark border" key={gi}>
                {g}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="text-center">
        <span className="badge bg-info">{platform}</span>
      </td>
      <td className="text-center">{publisher}</td>
      <td className="text-center">
        <span className="badge bg-secondary">{type}</span>
      </td>
      <td className="text-center">
        {p.isPreOrder ? (
          <span className="badge bg-warning text-dark">프리오더</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        {prices.length > 0 ? (
          <div style={PRICE_ROW_STYLE}>
            {shownPrices.map((pr, pi) => (
              <div key={pi}>
                <span className="text-muted" style={{ fontSize: "11px" }}>
                  {pr.currency ?? ""}
                </span>{" "}
                {pr.promo ? (
                  <>
                    <span style={ORIGIN_PRICE_STYLE}>{pnFmtPrice(pr.initialFormatted)}</span>{" "}
                    <span style={PROMO_PRICE_STYLE}>{pnFmtPrice(pr.priceFormatted)}</span>
                  </>
                ) : (
                  <span>{pnFmtPrice(pr.priceFormatted)}</span>
                )}
              </div>
            ))}
            {hiddenPrices > 0 && <div className="text-muted">외 {hiddenPrices}개 통화</div>}
          </div>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="text-center">
        {cf.shown.map((c) => (
          <span className="badge bg-light text-dark border me-1" key={c}>
            {c}
          </span>
        ))}
        {cf.hidden > 0 && <span className="badge bg-secondary me-1">외 {cf.hidden}개</span>}
      </td>
      <td className="text-center">{countryCount}개국</td>
      <td className="text-center" style={{ fontSize: "11px" }}>
        {releaseDate}
      </td>
      <td className="text-center" style={PRODUCT_ID_STYLE}>
        {pid}
      </td>
    </tr>
  );
};
