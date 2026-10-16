import { useEffect, useMemo, useState } from "react";
import { useVaultnStockAll, type VaultnStockAllItem } from "@entities/vaultn";

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

const optionSalesLink = (code: string) =>
  `/goods/goods_option_sales_register?product_code=${encodeURIComponent(code)}`;

const BLOCK = 10; // 페이지 번호 블록 크기

// legacy 행별 파생값(검색문자열·품절/판매중 여부).
type EnrichedRow = {
  item: VaultnStockAllItem;
  srch: string;
  isZero: boolean;
  hasSelling: boolean; // status=0 && soldout≠Y 옵션 존재
  hasSoldout: boolean; // soldout=Y 옵션 존재
  mapped: boolean;
  total: number;
};

// legacy stock/vaultn_stock.php — Vaultn 재고확인(전량 로드, 클라이언트 필터/정렬/페이징).
export const StockVaultnStockScreen = () => {
  useEffect(() => {
    document.title = "Vaultn 재고확인";
  }, []);

  const { data } = useVaultnStockAll();

  const [search, setSearch] = useState("");
  const [mappedFilter, setMappedFilter] = useState("mapped");
  const [sortOrder, setSortOrder] = useState("stock_asc");
  const [pageSize, setPageSize] = useState(50);
  const [curPage, setCurPage] = useState(1);

  const rows = useMemo<EnrichedRow[]>(() => {
    const list = data?.stockLevelInformation ?? [];
    return list.map((item) => {
      const options = Array.isArray(item.options) ? item.options : [];
      const optSrch = options.map((o) => ` ${o.product_code} ${o.product_name}`).join("");
      const srch = `${item.sku} ${item.title}${optSrch}`.toLowerCase();
      const hasSelling = options.some((o) => o.status === "0" && o.soldout !== "Y");
      const hasSoldout = options.some((o) => o.soldout === "Y");
      const total = num(item.totalAvailableUnits);
      return {
        item,
        srch,
        isZero: total === 0,
        hasSelling,
        hasSoldout,
        mapped: options.length > 0,
        total,
      };
    });
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q !== "" && !r.srch.includes(q)) return false;
      if (mappedFilter === "mapped" && !r.mapped) return false;
      if (mappedFilter === "unmapped" && r.mapped) return false;
      return true;
    });
  }, [rows, search, mappedFilter]);

  // 1순위 품절우선(품절 옵션 존재 행이 앞) → 2순위 선택 정렬.
  const sorted = useMemo(() => {
    const soldoutKey = (r: EnrichedRow) => (r.hasSoldout ? 0 : 1);
    return filtered.slice().sort((a, b) => {
      const sd = soldoutKey(a) - soldoutKey(b);
      if (sd !== 0) return sd;
      if (sortOrder === "stock_asc") return a.total - b.total;
      if (sortOrder === "stock_desc") return b.total - a.total;
      return 0;
    });
  }, [filtered, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(curPage, 1), totalPages);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  // 필터/정렬/페이지당 변경 시 1페이지로.
  const resetToFirst =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setCurPage(1);
    };

  const blockStart = Math.floor((page - 1) / BLOCK) * BLOCK + 1;
  const blockEnd = Math.min(blockStart + BLOCK - 1, totalPages);
  const blockPages: number[] = [];
  for (let p = blockStart; p <= blockEnd; p += 1) {
    blockPages.push(p);
  }

  const recordCount = data?.recordCount ?? 0;
  const loadedCount = data?.loadedCount;
  const partial = loadedCount !== undefined && loadedCount < recordCount;

  const PageItem = ({
    label,
    target,
    active,
    disabled,
  }: {
    label: string;
    target?: number;
    active?: boolean;
    disabled?: boolean;
  }) => (
    <li className={`page-item${active ? " active" : ""}${disabled ? " disabled" : ""}`}>
      <a
        className="page-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (!disabled && target) setCurPage(target);
        }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </li>
  );

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
                    재고
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Vaultn 재고
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 재고확인</li>
              </ol>
            </div>
            <h4 className="page-title">Vaultn 재고확인</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <div className="input-group">
                  <span className="input-group-text">검색</span>
                  <input
                    type="text"
                    className="form-control"
                    id="searchInput"
                    placeholder="sku 또는 title 검색"
                    autoComplete="off"
                    value={search}
                    onChange={(e) => resetToFirst(setSearch)(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    id="searchClear"
                    onClick={() => resetToFirst(setSearch)("")}
                  >
                    초기화
                  </button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="input-group">
                  <span className="input-group-text">구분</span>
                  <select
                    className="form-select"
                    id="mappedFilter"
                    value={mappedFilter}
                    onChange={(e) => resetToFirst(setMappedFilter)(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="mapped">등록상품만</option>
                    <option value="unmapped">미등록만</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="input-group">
                  <span className="input-group-text">정렬</span>
                  <select
                    className="form-select"
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => resetToFirst(setSortOrder)(e.target.value)}
                  >
                    <option value="stock_asc">재고 적은순</option>
                    <option value="stock_desc">재고 많은순</option>
                    <option value="default">기본순</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-2">
                <div className="input-group">
                  <span className="input-group-text">페이지당</span>
                  <select
                    className="form-select"
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => resetToFirst(setPageSize)(Number(e.target.value))}
                  >
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="9999">전체</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="mb-2">
            전체: <b>{recordCount.toLocaleString()}</b>
            {partial && (
              <span className="text-danger">
                {" "}
                (로드됨 {num(loadedCount).toLocaleString()} — 일부만 조회됨)
              </span>
            )}{" "}
            / 검색결과: <b id="resultCount">{sorted.length}</b>
          </div>
          <div className="table-responsive">
            <table
              className="table table-centered table-sm table-bordered caption-top text-nowrap"
              id="vaultnStockTable"
            >
              <thead className="table-dark font-13">
                <tr>
                  <th className="text-center">sku</th>
                  <th className="text-center">title</th>
                  <th className="text-center" title="ownedUnits: 내 재고">
                    owned
                  </th>
                  <th className="text-center" title="totalAvailableUnits: 내 재고 + 커넥션 공유 합">
                    total
                  </th>
                  <th className="text-center">connections</th>
                </tr>
              </thead>
              <tbody className="font-12" id="vaultnStockBody">
                {paged.map((r) => {
                  const item = r.item;
                  const connections = Array.isArray(item.connections) ? item.connections : [];
                  return (
                    <tr
                      key={item.sku}
                      className={r.isZero && r.hasSelling ? "table-danger" : undefined}
                    >
                      <td>{item.sku}</td>
                      <td>
                        {item.title}
                        {(item.options ?? []).map((opt) => (
                          <div className="small" key={opt.product_code}>
                            (
                            <a
                              href={optionSalesLink(opt.product_code)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {opt.product_code}
                            </a>{" "}
                            {opt.product_name}){" "}
                            {opt.soldout === "Y" ? (
                              <span className="badge bg-danger">품절</span>
                            ) : (
                              <span className="badge bg-success">판매중</span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="text-center">{item.ownedUnits}</td>
                      <td className="text-end">{num(item.totalAvailableUnits).toLocaleString()}</td>
                      <td>
                        {connections.length > 0 ? (
                          <table className="table table-bordered table-sm mb-0 text-nowrap">
                            <thead className="table-light font-12">
                              <tr>
                                <th>connectionGuid</th>
                                <th>connectionName</th>
                                <th>reservedUnits</th>
                                <th>networkUnits</th>
                                <th title="커넥션 1건 기준 가용: reservedUnits + networkUnits">
                                  total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="font-12">
                              {connections.map((conn, i) => (
                                <tr key={conn.connectionGuid ?? i}>
                                  <td>{conn.connectionGuid}</td>
                                  <td className="text-center">{conn.connectionName}</td>
                                  <td className="text-end">
                                    {num(conn.reservedUnits).toLocaleString()}
                                  </td>
                                  <td className="text-end">
                                    {num(conn.networkUnits).toLocaleString()}
                                  </td>
                                  <td className="text-end">
                                    {num(conn.totalAvailableUnits).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 (숫자 10개 블록) */}
          <nav>
            <ul className="pagination justify-content-center flex-wrap mt-3 mb-0" id="pgList">
              <PageItem label="&laquo;" target={1} disabled={page <= 1} />
              <PageItem label="&lsaquo;" target={page - 1} disabled={page <= 1} />
              {blockPages.map((p) => (
                <PageItem key={p} label={String(p)} target={p} active={p === page} />
              ))}
              <PageItem label="&rsaquo;" target={page + 1} disabled={page >= totalPages} />
              <PageItem label="&raquo;" target={totalPages} disabled={page >= totalPages} />
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
