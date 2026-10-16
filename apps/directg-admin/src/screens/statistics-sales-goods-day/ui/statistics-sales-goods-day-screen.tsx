import { useRef, useState } from "react";
import {
  useStatSalesGoodsDay,
  type StatSalesGoodsDaySearch,
  type StatSalesDayRow,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/sales_goods_day";

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

// legacy AdminGoods::getPublisherNameFallback — 현재명 → 예전DB명+badge → 코드.
const PublisherName = ({ row }: { row: StatSalesDayRow }) => {
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

// legacy JS getMax/getMin: 첫 행 시드 후 비교 → {value, product}.
const pickExtreme = (
  rows: StatSalesDayRow[],
  metric: (r: StatSalesDayRow) => number,
  mode: "max" | "min",
) => {
  if (rows.length === 0) return { value: 0, product: "" };
  let value = metric(rows[0]);
  let index = 0;
  for (let i = 1; i < rows.length; i++) {
    const v = metric(rows[i]);
    if ((mode === "max" && v > value) || (mode === "min" && v < value)) {
      value = v;
      index = i;
    }
  }
  return { value, product: rows[index].product_name };
};

// legacy statistics/order/sales_goods_day.php — 기간별 주문통계(page_title "기간별 주문통계").
export const StatisticsSalesGoodsDayScreen = (search: StatSalesGoodsDaySearch) => {
  const today = ymd(new Date());
  // legacy 15~21: start/end 미지정 시 오늘.
  const startDate = search.search_start_date || today;
  const endDate = search.search_end_date || today;
  const resolved: StatSalesGoodsDaySearch = {
    search_start_date: startDate,
    search_end_date: endDate,
  };

  const { data } = useStatSalesGoodsDay(resolved);
  const rows = data?.rows ?? [];

  // 요약(legacy JS 계산 재현).
  const totalCount = rows.reduce((s, r) => s + r.total_count, 0);
  const totalPrice = rows.reduce((s, r) => s + r.total_price, 0);
  const maxCount = pickExtreme(rows, (r) => r.total_count, "max");
  const maxPrice = pickExtreme(rows, (r) => r.total_price, "max");
  const minCount = pickExtreme(rows, (r) => r.total_count, "min");
  const minPrice = pickExtreme(rows, (r) => r.total_price, "min");

  // 필터 폼(GET) + date-range 로컬 제어(maxSpan 90).
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

  // 직접선택 시 90일 초과·역순 검증(legacy daterangepicker maxSpan 90).
  const validateCustom = () => {
    const s = startRef.current?.value ?? "";
    const e = endRef.current?.value ?? "";
    if (s && e) {
      const diff = dayDiff(s, e);
      if (diff < 0) {
        window.alert("종료일이 시작일보다 빠를 수 없습니다.");
        if (endRef.current) endRef.current.value = "";
      } else if (diff > 90) {
        window.alert(`조회 기간은 최대 90일을 초과할 수 없습니다.\n현재 선택 기간: ${diff}일`);
        if (endRef.current) endRef.current.value = "";
      }
    }
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
                <li className="breadcrumb-item active">기간별 주문통계</li>
              </ol>
            </div>
            <h4 className="page-title">기간별 주문통계</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label className="col-sm-1 col-form-label bg-light border">기간검색</label>
                    <div className="col-sm-2">
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
                    <div className="col-sm-4">
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
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
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
            <tbody className="bg-white">
              <tr>
                <td className="text-end">
                  <span className="fw-bold">{nf(totalCount)}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(totalPrice)}</span> 원
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(maxCount.value)}</span>
                  <br />
                  <span className="font-12">{maxCount.product}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(maxPrice.value)}</span> 원<br />
                  <span className="font-12">{maxPrice.product}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(minCount.value)}</span>
                  <br />
                  <span className="font-12">{minCount.product}</span>
                </td>
                <td className="text-end">
                  <span className="fw-bold">{nf(minPrice.value)}</span> 원<br />
                  <span className="font-12">{minPrice.product}</span>
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
            <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-striped table-sm">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">퍼블리셔명</th>
                  <th className="text-center">옵션상품코드</th>
                  <th className="text-center">옵션상품명</th>
                  <th className="text-center">주문수량</th>
                  <th className="text-center">주문합계</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {rows.map((row) => (
                  <tr key={`${row.product_code}-${row.supplier_code}`}>
                    <td className="text-center">
                      <PublisherName row={row} />
                    </td>
                    <td className="text-center">{row.product_code}</td>
                    <td>
                      <span className="product_name">{row.product_name}</span>
                    </td>
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
