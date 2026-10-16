import { useRef, useState } from "react";
import {
  useStatOrderGoodsPublisherCount,
  useStatSalesSuppliers,
  type StatOrderGoodsPublisherCountSearch,
  type StatGoodsPublisherRow,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_goods_publisher_count";

const nf = (n: number) => n.toLocaleString("en-US");
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

const GAME_TYPES = [
  { value: "all", label: "전체" },
  { value: "game", label: "Game" },
  { value: "dlc", label: "DLC" },
  { value: "music", label: "사운드트랙" },
  { value: "bundle", label: "번들" },
];

// legacy AdminGoods::getPublisherNameFallback — 현재명 → 예전DB명+badge → 코드.
const PublisherName = ({ row }: { row: StatGoodsPublisherRow }) => {
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

// legacy statistics/order/order_goods_publisher_count.php — 공급처-옵션상품별 주문통계.
export const StatisticsOrderGoodsPublisherCountScreen = (
  search: StatOrderGoodsPublisherCountSearch,
) => {
  const today = ymd(new Date());
  // legacy 17~23: start/end 미지정 시 오늘.
  const startDate = search.search_start_date || today;
  const endDate = search.search_end_date || today;
  const resolved: StatOrderGoodsPublisherCountSearch = {
    search_start_date: startDate,
    search_end_date: endDate,
    search_supplier_code: search.search_supplier_code,
    search_game_type: search.search_game_type,
  };

  const { data } = useStatOrderGoodsPublisherCount(resolved);
  const { data: supplierData } = useStatSalesSuppliers();

  const rows = data?.rows ?? [];

  // 요약 집계(legacy 53~71 PHP 계산을 프론트 재현).
  let sumCount = 0;
  let sumPrice = 0;
  let maxCount = 0;
  let maxCountProduct = "";
  let maxPrice = 0;
  let maxPriceProduct = "";
  let minCount: number | null = null;
  let minCountProduct = "";
  let minPrice: number | null = null;
  let minPriceProduct = "";
  for (const r of rows) {
    sumCount += r.total_count;
    sumPrice += r.total_price;
    if (r.total_count > maxCount) {
      maxCount = r.total_count;
      maxCountProduct = r.product_name;
    }
    if (r.total_price > maxPrice) {
      maxPrice = r.total_price;
      maxPriceProduct = r.product_name;
    }
    if (minCount === null || r.total_count < minCount) {
      minCount = r.total_count;
      minCountProduct = r.product_name;
    }
    if (minPrice === null || r.total_price < minPrice) {
      minPrice = r.total_price;
      minPriceProduct = r.product_name;
    }
  }
  const minCountVal = minCount ?? 0;
  const minPriceVal = minPrice ?? 0;

  // 상세 tfoot 합계.
  const totalCount = rows.reduce((s, r) => s + r.total_count, 0);
  const totalPrice = rows.reduce((s, r) => s + r.total_price, 0);

  // 필터 폼(GET) + date-range 로컬 제어.
  const formRef = useRef<HTMLFormElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState(`${startDate} - ${endDate}`);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);

  const setRange = (s: string, e: string) => {
    if (startRef.current) startRef.current.value = s;
    if (endRef.current) endRef.current.value = e;
    setLabel(`${s} - ${e}`);
  };

  const PRESETS: { key: string; compute: () => [string, string] | "custom" }[] = [
    { key: "오늘", compute: () => [ymd(new Date()), ymd(new Date())] },
    { key: "어제", compute: () => [ymd(addDays(new Date(), -1)), ymd(addDays(new Date(), -1))] },
    { key: "지난 7일", compute: () => [ymd(addDays(new Date(), -6)), ymd(new Date())] },
    { key: "지난 30일", compute: () => [ymd(addDays(new Date(), -29)), ymd(new Date())] },
    {
      key: "이번달",
      compute: () => {
        const t = new Date();
        return [
          ymd(new Date(t.getFullYear(), t.getMonth(), 1)),
          ymd(new Date(t.getFullYear(), t.getMonth() + 1, 0)),
        ];
      },
    },
    {
      key: "지난달",
      compute: () => {
        const t = new Date();
        return [
          ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)),
          ymd(new Date(t.getFullYear(), t.getMonth(), 0)),
        ];
      },
    },
    { key: "직접선택", compute: () => "custom" },
  ];

  const applyPreset = (key: string, compute: () => [string, string] | "custom") => {
    setOpen(false);
    setLabel(key);
    const range = compute();
    if (range === "custom") {
      setCustom(true);
      return;
    }
    setCustom(false);
    setRange(range[0], range[1]);
  };

  // 직접선택 시 365일 초과·역순 검증(legacy daterangepicker maxSpan 365).
  const validateCustom = () => {
    const s = startRef.current?.value ?? "";
    const e = endRef.current?.value ?? "";
    if (s && e) {
      const diff = dayDiff(s, e);
      if (diff < 0) {
        window.alert("종료일이 시작일보다 빠를 수 없습니다.");
        if (endRef.current) endRef.current.value = "";
      } else if (diff > 365) {
        window.alert(`조회 기간은 최대 365일을 초과할 수 없습니다.\n현재 선택 기간: ${diff}일`);
        if (endRef.current) endRef.current.value = "";
      }
    }
  };

  const handleAllPeriod = () => {
    setRange("2013-01-01", today);
    formRef.current?.submit();
  };

  const inputType = custom ? "date" : "text";

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
                    주문 분석
                  </a>
                </li>
                <li className="breadcrumb-item active">공급처 - 옵션상품별 주문통계</li>
              </ol>
            </div>
            <h4 className="page-title">공급처 - 옵션상품별 주문통계</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL} ref={formRef}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="row">
                    <label className="col-sm-2 col-form-label bg-light border">기간검색</label>
                    <div className="col-sm-4">
                      <div style={{ position: "relative" }}>
                        <div
                          className="form-control"
                          style={{ cursor: "pointer" }}
                          onClick={() => setOpen((p) => !p)}
                        >
                          <i className="mdi mdi-calendar" />
                          &nbsp;
                          <span>{label}</span> <i className="mdi mdi-menu-down" />
                        </div>
                        {open && (
                          <div
                            className="dropdown-menu show p-0"
                            style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000 }}
                          >
                            {PRESETS.map((preset) => (
                              <button
                                key={preset.key}
                                type="button"
                                className="dropdown-item"
                                onClick={() => applyPreset(preset.key, preset.compute)}
                              >
                                {preset.key}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <div className="input-group">
                        <input
                          type={inputType}
                          className="form-control"
                          id="search_start_date"
                          name="search_start_date"
                          placeholder="시작일자"
                          defaultValue={startDate}
                          readOnly={!custom}
                          ref={startRef}
                          onChange={validateCustom}
                        />
                        <span className="input-group-text">~</span>
                        <input
                          type={inputType}
                          className="form-control"
                          id="search_end_date"
                          name="search_end_date"
                          placeholder="종료일자"
                          defaultValue={endDate}
                          readOnly={!custom}
                          ref={endRef}
                          onChange={validateCustom}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-3 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_supplier_code"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      공급처
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="search_supplier_code"
                        name="search_supplier_code"
                        className="form-control"
                        defaultValue={search.search_supplier_code}
                      >
                        <option value="">:::공급처 선택:::</option>
                        {(supplierData?.suppliers ?? []).map((s) => (
                          <option key={s.publisher_code} value={s.publisher_code}>
                            {s.publisher_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-2">
                  <div className="row mb-2">
                    <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                      옵션상품유형
                    </label>
                    <div className="col-sm-8 pt-1">
                      {GAME_TYPES.map((gt) => (
                        <div key={gt.value} className="form-check form-check-inline">
                          <input
                            type="radio"
                            id={`search_game_type_${gt.value}`}
                            name="search_game_type"
                            className="form-check-input"
                            value={gt.value}
                            defaultChecked={search.search_game_type === gt.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_game_type_${gt.value}`}
                          >
                            {gt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary shadow-none me-2"
                      id="btn_all_period"
                      onClick={handleAllPeriod}
                    >
                      전체 기간
                    </button>
                    <button type="submit" className="btn btn-primary shadow-none" id="btn_search">
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {`(검색기간: ${resolved.search_start_date} ~ ${resolved.search_end_date})`}

      {/* 요약 집계 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm">
            <colgroup>
              <col width="18%" />
              <col width="18%" />
              <col width="16%" />
              <col width="16%" />
              <col width="16%" />
              <col width="16%" />
            </colgroup>
            <thead className="table-light font-14">
              <tr>
                <th className="text-center">총 주문수량</th>
                <th className="text-center">총 주문금액</th>
                <th className="text-center">최대 주문수량</th>
                <th className="text-center">최대 주문금액</th>
                <th className="text-center">최소 주문수량</th>
                <th className="text-center">최소 주문금액</th>
              </tr>
            </thead>
            <tbody className="bg-white border">
              <tr>
                <td className="text-end">
                  <span className="fw-bold">{nf(sumCount)}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(sumPrice)}</span> 원
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(maxCount)}</span>
                  <br />
                  <span className="font-12">{maxCountProduct}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(maxPrice)}</span> 원<br />
                  <span className="font-12">{maxPriceProduct}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(minCountVal)}</span>
                  <br />
                  <span className="font-12">{minCountProduct}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(minPriceVal)}</span> 원<br />
                  <span className="font-12">{minPriceProduct}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 */}
      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">퍼블리셔명</th>
                  <th className="text-center">옵션상품유형</th>
                  <th className="text-center">옵션상품코드</th>
                  <th className="text-center">옵션상품명</th>
                  <th className="text-center">출시일</th>
                  <th className="text-center">주문수량</th>
                  <th className="text-center">주문합계</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {rows.map((row) => (
                  <tr key={row.product_code}>
                    <td className="text-center">
                      <PublisherName row={row} />
                    </td>
                    <td className="text-center">{row.game_type}</td>
                    <td className="text-center">{row.product_code}</td>
                    <td>
                      <span className="product_name">{row.product_name}</span>
                    </td>
                    <td className="text-center">{row.release_date.slice(0, 10)}</td>
                    <td className="text-end">
                      <span className="total_count">{nf(row.total_count)}</span>
                    </td>
                    <td className="text-end">
                      <span className="total_price">{nf(row.total_price)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={2} className="text-center">
                    합계
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th className="text-end">
                    <span id="total_count">{nf(totalCount)}</span>
                  </th>
                  <th className="text-end">
                    <span id="total_price">{nf(totalPrice)}</span>
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
