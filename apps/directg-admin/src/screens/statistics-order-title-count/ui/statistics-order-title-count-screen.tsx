import { useRef } from "react";
import {
  useStatOrderTitleCount,
  useRunStatOrderTitleBestSave,
  type StatOrderTitleCountSearch,
  type StatOrderTitleItem,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_title_count";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy statistics/order/order_title_count.php — 대표상품별 주문통계(page_title "대표상품별 주문현황").
export const StatisticsOrderTitleCountScreen = (search: StatOrderTitleCountSearch) => {
  const now = new Date();
  // legacy 15~16: search_year 미지정 시 date('Y'). search_month는 빈값 허용(연 전체).
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month;
  const resolved: StatOrderTitleCountSearch = { search_year: year, search_month: month };

  const { data } = useStatOrderTitleCount(resolved);
  const bestSave = useRunStatOrderTitleBestSave();

  const yearRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);

  // 연도 옵션 2013~현재년 (legacy 221~226).
  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  // legacy btn_best_save: 클릭 시점의 select 값 → best-save → alert만(reload 없음).
  const handleBestSave = () => {
    bestSave.mutate(
      {
        search_year: yearRef.current?.value ?? year,
        search_month: monthRef.current?.value ?? month,
      },
      { onSuccess: () => window.alert("집계가 완료되었습니다.") },
    );
  };

  const titles = data?.titles ?? [];

  // tfoot 합계 누적 (legacy 331~336).
  let gameTotalCount = 0;
  let gameTotalPrice = 0;
  let editionTotalCount = 0;
  let editionTotalPrice = 0;
  let dlcTotalCount = 0;
  let dlcTotalPrice = 0;
  for (const t of titles) {
    gameTotalCount += t.game.total_count;
    gameTotalPrice += t.game.total_price;
    editionTotalCount += t.edition.total_count;
    editionTotalPrice += t.edition.total_price;
    dlcTotalCount += t.dlc.total_count;
    dlcTotalPrice += t.dlc.total_price;
  }

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
                <li className="breadcrumb-item active">대표상품별 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">대표상품별 주문현황</h4>
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
                  <div className="col-lg-12">
                    <div className="row">
                      <label
                        htmlFor="search_year"
                        className="col-sm-1 col-form-label bg-light border"
                      >
                        주문기간
                      </label>
                      <div className="col-sm-3">
                        <div className="input-group">
                          <select
                            ref={yearRef}
                            className="form-select me-2"
                            id="search_year"
                            name="search_year"
                            defaultValue={year}
                          >
                            <option value="">:::년:::</option>
                            {years.map((y) => (
                              <option key={y} value={y}>
                                {y}년
                              </option>
                            ))}
                          </select>
                          <select
                            ref={monthRef}
                            className="form-select"
                            id="search_month"
                            name="search_month"
                            defaultValue={month}
                          >
                            <option value="">:::월:::</option>
                            {months.map((m) => (
                              <option key={m} value={m}>
                                {m}월
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-auto">
                        <button className="input-group-text btn-primary shadow-none" type="submit">
                          검 색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-end">
                    <button
                      type="button"
                      className="btn btn-info shadow-none"
                      id="btn_best_save"
                      onClick={handleBestSave}
                    >
                      인기 타이틀 저장
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-centered table-sm">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center" rowSpan={2} style={{ width: "50px" }}>
                        순위
                      </th>
                      <th className="text-center" rowSpan={2} style={{ width: "100px" }}>
                        대표상품코드
                      </th>
                      <th className="text-center" rowSpan={2}>
                        대표상품명
                      </th>
                      <th className="text-center" colSpan={2}>
                        기본게임
                      </th>
                      <th className="text-center" colSpan={2}>
                        에디션
                      </th>
                      <th className="text-center" colSpan={2}>
                        DLC
                      </th>
                      <th className="text-center" colSpan={2}>
                        합계
                      </th>
                    </tr>
                    <tr>
                      <th className="text-center" style={{ width: "40px" }}>
                        수량
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        금액
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        수량
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        금액
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        수량
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        금액
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        수량
                      </th>
                      <th className="text-center" style={{ width: "40px" }}>
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {titles.map((title, index) => (
                      <StatTitleRow key={title.title_id} title={title} ranking={index + 1} />
                    ))}
                  </tbody>
                  <tfoot className="table-dark">
                    <tr>
                      <th className="text-center" colSpan={3}>
                        {year}년 {month} 합계
                      </th>
                      <th className="text-end">
                        <span className="num">{nf(gameTotalCount)}</span>
                      </th>
                      <th className="text-end">
                        <span className="num">{nf(gameTotalPrice)}</span>
                      </th>
                      <th className="text-end">
                        <span className="num">{nf(editionTotalCount)}</span>
                      </th>
                      <th className="text-end">
                        <span className="num">{nf(editionTotalPrice)}</span>
                      </th>
                      {/* legacy: dlc tfoot 셀은 span.num 미래핑 quirk */}
                      <th className="text-end">{nf(dlcTotalCount)}</th>
                      <th className="text-end">{nf(dlcTotalPrice)}</th>
                      <th className="text-end">
                        <span className="num">
                          {nf(gameTotalCount + editionTotalCount + dlcTotalCount)}
                        </span>
                      </th>
                      <th className="text-end">
                        <span className="num">
                          {nf(gameTotalPrice + editionTotalPrice + dlcTotalPrice)}
                        </span>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const StatTitleRow = ({ title, ranking }: { title: StatOrderTitleItem; ranking: number }) => (
  <tr>
    <td className="text-center">{ranking}</td>
    <td className="text-center">{title.title_id}</td>
    <td className="px-1">{title.title_name}</td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.game.total_count)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.game.total_price)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.edition.total_count)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.edition.total_price)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.dlc.total_count)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.dlc.total_price)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.sales_count)}</span>
    </td>
    <td className="text-end" style={{ width: "50px" }}>
      <span className="num">{nf(title.sales_price)}</span>
    </td>
  </tr>
);
