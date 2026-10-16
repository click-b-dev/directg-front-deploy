import { useEffect, useRef, useState } from "react";
import { env } from "@shared/config/env";
import {
  useStatOrderGoodsCount,
  useStatSalesSuppliers,
  searchStatSalesProducts,
  fetchStatProductSuppliers,
  type StatOrderGoodsCountSearch,
  type StatGoodsSupplierRow,
  type StatProductSearchResult,
} from "@entities/statistics";
import { ProductStatusBadge } from "@shared/ui";

const BASE_URL = "/statistics/order/order_goods_count";
const EXCEL_URL = `${env.apiBaseUrl}/admin/statistics/order/goods-count/download`;

const nf = (n: number) => n.toLocaleString("en-US");

type SupplierOption = { value: string; label: string };

// legacy: publisher_name ?: (old_publisher_name ? old+' [예전DB badge]' : supplier_code)
const SupplierLabel = ({ row }: { row: StatGoodsSupplierRow }) => {
  if (row.publisher_name) return <>{row.publisher_name}</>;
  if (row.old_publisher_name) {
    return (
      <>
        {row.old_publisher_name} <span className="badge bg-warning text-dark">예전DB</span>
      </>
    );
  }
  return <>{row.supplier_code}</>;
};

// legacy statistics/order/order_goods_count.php — 옵션상품 주문통계.
export const StatisticsOrderGoodsCountScreen = (search: StatOrderGoodsCountSearch) => {
  const now = new Date();
  // legacy 16~17: search_year 미지정 시 date('Y').
  const year = search.search_year || String(now.getFullYear());
  const resolved: StatOrderGoodsCountSearch = {
    search_year: year,
    search_product_code: search.search_product_code,
    search_supplier_code: search.search_supplier_code,
  };

  const { data } = useStatOrderGoodsCount(resolved);
  const { data: supplierData } = useStatSalesSuppliers();

  // 필터 로컬 상태(제출 전 상호작용).
  const [productCode, setProductCode] = useState(search.search_product_code);
  const [productLabel, setProductLabel] = useState(
    search.search_product_code ? `[${search.search_product_code}]` : "",
  );
  const [supplierCode, setSupplierCode] = useState(search.search_supplier_code);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);

  const fullSupplierOptions: SupplierOption[] = (supplierData?.suppliers ?? []).map((s) => ({
    value: s.publisher_code,
    label: s.publisher_name,
  }));

  // 상품 미선택 시 공급처 전체목록 유지(legacy fullSupplierOptions).
  useEffect(() => {
    if (productCode === "") setSupplierOptions(fullSupplierOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierData, productCode]);

  // 상품이 URL에 있으면(초기 진입) 해당 상품의 공급처로 좁힘 + 라벨 보강(legacy 440~458).
  const initialNarrowRef = useRef(false);
  useEffect(() => {
    if (!initialNarrowRef.current && search.search_product_code) {
      initialNarrowRef.current = true;
      void narrowSuppliers(search.search_product_code, search.search_supplier_code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 데이터 로드 시 combobox 라벨을 `[코드] 상품명 (미등록?)`로 보강.
  useEffect(() => {
    if (data && data.search_product_code === productCode && productCode) {
      const name = data.goods_item?.product_name ?? data.selected_product_name;
      const tail = data.goods_item ? "" : " (미등록)";
      setProductLabel(`[${productCode}] ${name}${tail}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const narrowSuppliers = async (code: string, keepSupplier: string) => {
    const res = await fetchStatProductSuppliers({
      product_code: code,
      supplier_code: keepSupplier,
    });
    setSupplierOptions(res.suppliers.map((s) => ({ value: s.supplier_code, label: s.label })));
  };

  const handleSelectProduct = (result: StatProductSearchResult) => {
    setProductCode(result.id);
    setProductLabel(result.text);
    void narrowSuppliers(result.id, supplierCode);
  };

  const handleClearProduct = () => {
    setProductCode("");
    setProductLabel("");
    setSupplierOptions(fullSupplierOptions);
    setSupplierCode("");
  };

  // 엑셀 다운로드(legacy btn_order_day_all_download → order_goods_count_download.php form POST).
  const excelFormRef = useRef<HTMLFormElement>(null);
  const handleExcelDownload = () => excelFormRef.current?.submit();

  const showSupplier = data?.show_supplier ?? true;
  const yearLabel = data?.year_label ?? (year === "all" ? "전체" : `${year}년`);
  const priceStats = data?.price_stats ?? [];
  const dayStats = data?.day_stats ?? [];
  const promotionHistory = data?.promotion_history ?? [];
  const goodsItem = data?.goods_item ?? null;
  const selectedProductName = data?.selected_product_name ?? "";
  const hasProduct = resolved.search_product_code !== "";

  // 판매가격별 합계.
  let priceTotalCount = 0;
  let priceTotalPrice = 0;
  for (const r of priceStats) {
    priceTotalCount += r.total_count;
    priceTotalPrice += r.unit_price * r.total_count;
  }
  // 일자별 합계.
  let dayTotalCount = 0;
  let dayTotalPrice = 0;
  for (const r of dayStats) {
    dayTotalCount += r.total_count;
    dayTotalPrice += r.unit_price * r.total_count;
  }
  // 프로모션 합계.
  let promoTotalCount = 0;
  let promoTotalPrice = 0;
  for (const r of promotionHistory) {
    promoTotalCount += r.order_count;
    promoTotalPrice += r.sale_price * r.order_count;
  }

  // 연도 radio: 전체 + 2020~현재.
  const years: number[] = [];
  for (let y = 2020; y <= now.getFullYear(); y++) years.push(y);

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
                    통계
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    주문분석
                  </a>
                </li>
                <li className="breadcrumb-item active">옵션상품 주문통계</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 주문통계</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body py-2">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <label className="col-sm-1 col-form-label bg-light border">주문연도</label>
                  <div className="col-sm-11">
                    <div className="form-check form-check-inline mt-2">
                      <input
                        type="radio"
                        id="search_year_all"
                        name="search_year"
                        className="form-check-input"
                        value="all"
                        defaultChecked={year === "all"}
                      />
                      <label className="form-check-label" htmlFor="search_year_all">
                        전체
                      </label>
                    </div>
                    {years.map((y) => (
                      <div key={y} className="form-check form-check-inline mt-2">
                        <input
                          type="radio"
                          id={`search_year_${y}`}
                          name="search_year"
                          className="form-check-input"
                          value={y}
                          defaultChecked={year === String(y)}
                        />
                        <label className="form-check-label" htmlFor={`search_year_${y}`}>
                          {y}년
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-8 mb-2">
                    <div className="row">
                      <label
                        htmlFor="search_product_code"
                        className="col-sm-2 col-form-label bg-light border"
                      >
                        옵션상품
                      </label>
                      <div className="col-sm-10">
                        <ProductCombobox
                          value={productCode}
                          label={productLabel}
                          supplierCode={supplierCode}
                          onSelect={handleSelectProduct}
                          onClear={handleClearProduct}
                        />
                        <input type="hidden" name="search_product_code" value={productCode} />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 mb-2">
                    <div className="row">
                      <label
                        htmlFor="search_supplier_code"
                        className="col-sm-2 col-form-label bg-light border"
                      >
                        공급처
                      </label>
                      <div className="col-sm-8">
                        <select
                          id="search_supplier_code"
                          name="search_supplier_code"
                          className="form-control"
                          value={supplierCode}
                          onChange={(e) => setSupplierCode(e.target.value)}
                        >
                          <option value="">:::공급처 선택:::</option>
                          {supplierOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="d-flex justify-content-center">
                      <button className="btn btn-primary shadow-none" type="submit">
                        검 색
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 옵션상품정보 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-bordered table-centered table-sm caption-top">
            <caption className="fw-bold">옵션상품정보</caption>
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">옵션상품코드</th>
                <th className="text-center">옵션상품명</th>
                <th className="text-center">진열그룹</th>
                <th className="text-center">플랫폼</th>
                <th className="text-center">출시일</th>
                <th className="text-center">소비자가</th>
                <th className="text-center">판매가</th>
                <th className="text-center">판매상태</th>
              </tr>
            </thead>
            {hasProduct && (
              <tbody className="bg-white">
                {goodsItem ? (
                  <tr>
                    <td className="text-center">{goodsItem.product_code}</td>
                    <td>{goodsItem.product_name}</td>
                    <td className="text-center">{goodsItem.display_type}</td>
                    <td className="text-center">{goodsItem.platform_name}</td>
                    <td className="text-center">{goodsItem.release_date}</td>
                    <td className="text-end">{nf(goodsItem.consumer_price)}</td>
                    <td className="text-end">{nf(goodsItem.price)}</td>
                    <td className="text-center">
                      <ProductStatusBadge status={goodsItem.status} />
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="text-center">{resolved.search_product_code}</td>
                    <td>
                      {selectedProductName} <span className="badge bg-secondary">미등록</span>
                    </td>
                    <td className="text-center" colSpan={6}>
                      현재 상품 등록정보가 없습니다 (판매이력만 존재)
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* 판매가격별 통계 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-bordered table-centered table-sm caption-top">
            <caption className="fw-bold">판매가격별 통계</caption>
            <thead className="table-light font-13">
              <tr>
                {showSupplier && <th className="text-center">공급처</th>}
                <th className="text-center">판매가</th>
                <th className="text-center">판매수량</th>
                <th className="text-center">합계</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {priceStats.map((row, index) => (
                <tr key={`${row.supplier_code}-${row.unit_price}-${index}`}>
                  {showSupplier && (
                    <td className="text-center">
                      <SupplierLabel row={row} />
                    </td>
                  )}
                  <td className="text-end">{nf(row.unit_price)}</td>
                  <td className="text-end">{nf(row.total_count)}</td>
                  <td className="text-end">{nf(row.unit_price * row.total_count)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light font-13">
              <tr>
                <th className="text-center" colSpan={showSupplier ? 2 : 1}>
                  합계
                </th>
                <th className="text-end">{nf(priceTotalCount)}</th>
                <th className="text-end">{nf(priceTotalPrice)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 일자별 통계 */}
      <div className="row">
        <div className="col-12 mb-2">
          <div className="float-start">
            <h5>일자별 통계</h5>
          </div>
          <div className="float-end">
            <button
              type="button"
              className="btn btn-success btn-sm shadow-none"
              id="btn_order_day_all_download"
              onClick={handleExcelDownload}
            >
              <i className="mdi mdi-microsoft-excel mdi-18px"></i> 일자별 통계 엑셀 다운로드
            </button>
            <form ref={excelFormRef} action={EXCEL_URL} method="POST" className="d-none">
              <input type="hidden" name="product_code" value={goodsItem?.product_code ?? ""} />
              <input type="hidden" name="supplier_code" value={resolved.search_supplier_code} />
              <input type="hidden" name="search_year" value={resolved.search_year} />
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-bordered table-centered table-sm caption-top">
            <thead className="table-light font-13">
              <tr>
                {showSupplier && <th className="text-center">공급처</th>}
                <th className="text-center">주문일자</th>
                <th className="text-center">판매가</th>
                <th className="text-center">판매수량</th>
                <th className="text-center">합계</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dayStats.map((row, index) => (
                <tr key={`${row.supplier_code}-${row.ord_ymd}-${row.unit_price}-${index}`}>
                  {showSupplier && (
                    <td className="text-center">
                      <SupplierLabel row={row} />
                    </td>
                  )}
                  <td className="text-center">{row.ord_ymd}</td>
                  <td className="text-end">{nf(row.unit_price)}</td>
                  <td className="text-end">{nf(row.total_count)}</td>
                  <td className="text-end">{nf(row.unit_price * row.total_count)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light font-13">
              <tr>
                <th className="text-center" colSpan={showSupplier ? 3 : 2}>
                  {yearLabel} 합계
                </th>
                <th className="text-end">{nf(dayTotalCount)}</th>
                <th className="text-end">{nf(dayTotalPrice)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 할인 프로모션 이력 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-bordered table-centered table-sm caption-top">
            <caption className="fw-bold">할인 프로모션 이력</caption>
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">할인 프로모션 기간</th>
                <th className="text-center">승인할인율</th>
                <th className="text-center">DG할인율</th>
                <th className="text-center">할인 프로모션 판매가</th>
                <th className="text-center">할인 프로모션 판매수량</th>
                <th className="text-center">할인 프로모션 판매합계</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {promotionHistory.map((row, index) => (
                <tr key={`${row.promotion_start}-${index}`}>
                  <td className="text-center">
                    {row.promotion_start} ~ {row.promotion_end}
                  </td>
                  <td className="text-end">{row.p_discount_rate}%</td>
                  <td className="text-end">{row.discount_rate}%</td>
                  <td className="text-end">{nf(row.sale_price)}</td>
                  <td className="text-end">{nf(row.order_count)}</td>
                  <td className="text-end">{nf(row.sale_price * row.order_count)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light font-13">
              <tr>
                <th className="text-center" colSpan={4}>
                  {yearLabel} 합계
                </th>
                <th className="text-end">{nf(promoTotalCount)}</th>
                <th className="text-end">{nf(promoTotalPrice)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

// legacy select2 원격검색(ajax_sales_product.php) 재현: 타이핑 debounce + 결과 드롭다운.
const ProductCombobox = ({
  value,
  label,
  supplierCode,
  onSelect,
  onClear,
}: {
  value: string;
  label: string;
  supplierCode: string;
  onSelect: (result: StatProductSearchResult) => void;
  onClear: () => void;
}) => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<StatProductSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (q: string) => {
    // legacy: q 있거나 supplier 선택 시에만 조회.
    if (q === "" && supplierCode === "") {
      setResults([]);
      return;
    }
    void searchStatSalesProducts({ q, supplier_code: supplierCode }).then((res) =>
      setResults(res.results),
    );
  };

  const handleChange = (q: string) => {
    setTerm(q);
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(q), 300);
  };

  // 선택된 상품이 있으면 라벨 표시, 없으면 검색어 입력.
  if (value !== "") {
    return (
      <div className="input-group">
        <input type="text" className="form-control" value={label} readOnly />
        <button type="button" className="btn btn-outline-secondary" onClick={onClear}>
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control"
        placeholder=":::옵션상품 검색 (상품코드/상품명):::"
        value={term}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          if (term === "" && supplierCode !== "") runSearch("");
        }}
      />
      {open && results.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 5 }}>
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="list-group-item list-group-item-action text-start w-100"
                onClick={() => {
                  onSelect(r);
                  setOpen(false);
                  setTerm("");
                }}
              >
                {r.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
