import { useState } from "react";
import {
  usePointNexusCatalogue,
  useDeletePointNexusCatalogue,
  PnModeSelect,
  PnPagination,
  pnFmtPrice,
  type PnMode,
  type PnCatalogueSearch,
  type PnCatalogueItem,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_catalogue";

const PRODUCT_ID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};
const PRICE_ROW_STYLE: React.CSSProperties = {
  whiteSpace: "nowrap",
  lineHeight: 1.5,
  fontSize: "13px",
};
const ORIGIN_PRICE_STYLE: React.CSSProperties = {
  textDecoration: "line-through",
  color: "#6c757d",
  fontSize: "11px",
};
const PROMO_PRICE_STYLE: React.CSSProperties = { color: "#f59e0b", fontWeight: 600 };
const CODE_STYLE: React.CSSProperties = { fontFamily: "monospace", color: "#0d6efd" };

type Flash = { message: string; type: string };

// legacy pointnexus_catalogue.php — PointNexus 카탈로그 (DB).
export const PointNexusCatalogueScreen = (search: PnCatalogueSearch) => {
  const { data } = usePointNexusCatalogue(search);
  const del = useDeletePointNexusCatalogue();
  const [flash, setFlash] = useState<Flash | null>(null);

  if (!data) {
    return null;
  }

  const { items, total, publisher_list, platform_list } = data;
  const { mode, page, limit } = search;
  const offset = (page - 1) * limit;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  // 페이지네이션 base 파라미터(page 제외)
  const pgParams: Record<string, string> = { mode, limit: String(limit) };
  if (search.keyword) {
    pgParams.keyword = search.keyword;
  }
  if (search.publisher) {
    pgParams.publisher = search.publisher;
  }
  if (search.platform) {
    pgParams.platform = search.platform;
  }
  if (search.preorder) {
    pgParams.preorder = search.preorder;
  }
  if (search.mapping) {
    pgParams.mapping = search.mapping;
  }
  if (search.stale) {
    pgParams.stale = search.stale;
  }

  const onDelete = (pid: string) => {
    if (!window.confirm(`이 카탈로그 상품을 삭제하시겠습니까?\nproductID: ${pid}`)) {
      return;
    }
    del.mutate(
      { productID: pid, mode },
      {
        onSuccess: (res) => setFlash({ message: res.message, type: res.flash_type || "info" }),
      },
    );
  };

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
                <li className="breadcrumb-item active">PointNexus 카탈로그 (DB)</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 카탈로그 (DB){" "}
              <small className="text-muted">pointnexus_catalogue 테이블 조회</small>
            </h4>
          </div>
        </div>
      </div>

      {flash && (
        <div className={`alert alert-${flash.type || "info"} alert-dismissible py-2`}>
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash(null)} />
        </div>
      )}

      {/* 검색필터 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2 mb-2">
                <div className="col-md-2">
                  <div className="row g-2">
                    <label className="col-4 col-form-label col-form-label-sm bg-light border">
                      환경
                    </label>
                    <div className="col-8">
                      <PnModeSelect mode={mode} />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="row g-2">
                    <label className="col-4 col-form-label col-form-label-sm bg-light border">
                      퍼블리셔
                    </label>
                    <div className="col-8">
                      <select
                        className="form-control form-control-sm"
                        name="publisher"
                        defaultValue={search.publisher}
                      >
                        <option value="">전체</option>
                        {publisher_list.map((pb) => (
                          <option key={pb} value={pb}>
                            {pb}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="row g-2">
                    <label className="col-5 col-form-label col-form-label-sm bg-light border">
                      플랫폼
                    </label>
                    <div className="col-7">
                      <select
                        className="form-control form-control-sm"
                        name="platform"
                        defaultValue={search.platform}
                      >
                        <option value="">전체</option>
                        {platform_list.map((pf) => (
                          <option key={pf} value={pf}>
                            {pf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="row g-2">
                    <label className="col-5 col-form-label col-form-label-sm bg-light border">
                      프리오더
                    </label>
                    <div className="col-7">
                      <select
                        className="form-control form-control-sm"
                        name="preorder"
                        defaultValue={search.preorder}
                      >
                        <option value="">전체</option>
                        <option value="Y">프리오더만</option>
                        <option value="N">일반만</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="row g-2">
                    <label className="col-3 col-form-label col-form-label-sm bg-light border">
                      매핑
                    </label>
                    <div className="col-9">
                      <select
                        className="form-control form-control-sm"
                        name="mapping"
                        defaultValue={search.mapping}
                      >
                        <option value="">전체</option>
                        <option value="Y">매핑됨</option>
                        <option value="N">미매핑</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-md-7">
                  <div className="row g-2">
                    <label className="col-1 col-form-label col-form-label-sm bg-light border">
                      키워드
                    </label>
                    <div className="col-11">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="keyword"
                        placeholder="상품명 / productID / publisher"
                        defaultValue={search.keyword}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="row g-2">
                    <label className="col-4 col-form-label col-form-label-sm bg-light border">
                      단종
                    </label>
                    <div className="col-8">
                      <select
                        className="form-control form-control-sm"
                        name="stale"
                        defaultValue={search.stale}
                      >
                        <option value="">전체</option>
                        <option value="Y">단종의심</option>
                        <option value="N">정상</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="row g-2">
                    <label className="col-5 col-form-label col-form-label-sm bg-light border">
                      한페이지
                    </label>
                    <div className="col-7">
                      <select
                        className="form-control form-control-sm"
                        name="limit"
                        defaultValue={String(limit)}
                      >
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-1 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none w-100">
                    검색
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row mb-2 mt-2">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="text-muted">
            총 <strong className="text-dark">{total.toLocaleString()}</strong>건
            {total > 0 && (
              <>
                {" "}
                &middot; {(offset + 1).toLocaleString()}–{(offset + items.length).toLocaleString()}{" "}
                표시 &middot; {page.toLocaleString()} / {totalPages.toLocaleString()} 페이지
              </>
            )}
          </div>
          <PnPagination
            page={page}
            totalPages={totalPages}
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
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "40px" }}>
                      #
                    </th>
                    <th style={{ minWidth: "240px" }}>상품명</th>
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
                    <th style={{ width: "90px" }}>가격(KRW)</th>
                    <th className="text-center" style={{ width: "100px" }}>
                      출시일
                    </th>
                    <th style={{ minWidth: "200px" }}>매핑 자사상품</th>
                    <th className="text-center" style={{ width: "160px" }}>
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted py-4">
                        표시할 상품이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    items.map((p, i) => (
                      <CatalogueRow
                        key={p.productID}
                        item={p}
                        num={offset + i + 1}
                        mode={mode}
                        onDelete={onDelete}
                        deleting={del.isPending}
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
        <PnPagination
          page={page}
          totalPages={totalPages}
          baseUrl={BASE_URL}
          baseParams={pgParams}
        />
      </div>
    </>
  );
};

const CatalogueRow = ({
  item,
  num,
  mode,
  onDelete,
  deleting,
}: {
  item: PnCatalogueItem;
  num: number;
  mode: PnMode;
  onDelete: (pid: string) => void;
  deleting: boolean;
}) => {
  const pid = item.productID;
  const name = item.genericName || "—";
  const platform = item.platform || "—";
  const publisher = item.publisher || "—";
  const type = item.type || "—";
  const release = item.releaseDate ? String(item.releaseDate).slice(0, 10) : "—";
  const prices = Array.isArray(item.prices) ? item.prices : [];
  const mappedCodes = Array.isArray(item.mappedCodes) ? item.mappedCodes : [];
  const mappedNames = Array.isArray(item.mappedNames) ? item.mappedNames : [];
  const isMapped = mappedCodes.length > 0;
  const isDiscontinued = !!item.isDiscontinued;
  const krwPr = prices.find((pr) => pr.currency === "KRW");

  return (
    <tr>
      <td className="text-center text-muted">{num}</td>
      <td>
        <div className="fw-semibold">
          {name}
          {isDiscontinued && (
            <span
              className="badge bg-danger ms-1"
              title="마지막 동기화에 누락된 상품 (PointNexus 카탈로그에서 제외 추정)"
            >
              단종 의심
            </span>
          )}
        </div>
        <div className="mt-1" style={PRODUCT_ID_STYLE}>
          {pid}
        </div>
      </td>
      <td className="text-center">
        <span className="badge bg-info">{platform}</span>
      </td>
      <td className="text-center">{publisher}</td>
      <td className="text-center">
        <span className="badge bg-secondary">{type}</span>
      </td>
      <td className="text-center">
        {item.isPreOrder ? (
          <span className="badge bg-warning text-dark">프리오더</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td style={PRICE_ROW_STYLE}>
        {krwPr ? (
          krwPr.promo ? (
            <>
              <span style={ORIGIN_PRICE_STYLE}>{pnFmtPrice(krwPr.initialFormatted)}</span>{" "}
              <span style={PROMO_PRICE_STYLE}>{pnFmtPrice(krwPr.priceFormatted)}</span>{" "}
              <span
                className="badge bg-warning text-dark"
                title="동기화 시점 프로모션 — 실제 현재 상태는 최신 동기화 필요"
              >
                프로모션
              </span>
            </>
          ) : (
            <span>{pnFmtPrice(krwPr.initialFormatted)}</span>
          )
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="text-center" style={{ fontSize: "13px" }}>
        {release}
      </td>
      <td>
        {isMapped ? (
          <>
            {isDiscontinued && (
              <div className="text-danger fw-semibold mb-1" style={{ fontSize: "12px" }}>
                <i className="mdi mdi-alert" /> 단종 의심 상품이 매핑됨 — 결제 시 발급 실패 위험
              </div>
            )}
            <div className="mapped-list" style={{ fontSize: "12px", lineHeight: 1.4 }}>
              {mappedCodes.map((mc, idx) => (
                <div className="mapped-item" style={{ marginBottom: "5px" }} key={idx}>
                  <div>
                    <span className="badge bg-success">매핑</span>{" "}
                    <a
                      style={CODE_STYLE}
                      href={`/goods/goods_option_view?product_code=${encodeURIComponent(mc)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {mc}
                    </a>
                  </div>
                  {mappedNames[idx] && <div className="text-dark">{mappedNames[idx]}</div>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <span className="badge bg-light text-dark border">미매핑</span>
        )}
      </td>
      <td className="text-center">
        <div className="col-action d-flex gap-1 justify-content-center flex-nowrap">
          <a
            href={`/goods/pointnexus/pointnexus_catalogue_map?mode=${encodeURIComponent(mode)}&productID=${encodeURIComponent(pid)}`}
            className="btn btn-sm btn-primary shadow-none"
          >
            <i className="mdi mdi-link-variant" /> 매핑 관리
          </a>
          {!isMapped && (
            <button
              type="button"
              className="btn btn-sm btn-danger shadow-none"
              disabled={deleting}
              onClick={() => onDelete(pid)}
            >
              <i className="mdi mdi-trash-can" /> 삭제
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
