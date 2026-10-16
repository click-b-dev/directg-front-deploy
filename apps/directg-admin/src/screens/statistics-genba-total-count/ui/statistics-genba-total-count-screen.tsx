import {
  useStatGenbaTotalCount,
  type StatGenbaTotalCountSearch,
  type StatGenbaTotalRow,
} from "@entities/statistics";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/statistics/order/genba_total_count";

const nf = (n: number) => n.toLocaleString("en-US");
const round2 = (n: number) => String(Math.round(n * 100) / 100);

// legacy statistics/order/genba_total_count.php — Genba 누적 주문현황.
export const StatisticsGenbaTotalCountScreen = (search: StatGenbaTotalCountSearch) => {
  const page = Number.isFinite(search.page) && search.page > 0 ? search.page : 1;
  const resolved: StatGenbaTotalCountSearch = { page };
  const { data } = useStatGenbaTotalCount(resolved);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  let totalCount = 0;
  let totalGross = 0;
  let totalNet = 0;
  let totalActual = 0;
  for (const r of items) {
    totalCount += r.total_count;
    totalGross += r.total_gross_amount;
    totalNet += r.total_net_amount;
    totalActual += r.total_actual_buying_price;
  }
  const totalProfit = totalNet - totalActual;

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
                <li className="breadcrumb-item active">Genba 누적 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 누적 주문현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">Publisher</th>
                  <th className="text-center">SKU</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">주문수량</th>
                  <th className="text-center">GrossAmount 합계</th>
                  <th className="text-center">NetAmount 합계</th>
                  <th className="text-center">ActualBuyingPrice 합계</th>
                  <th className="text-center">이익</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {items.map((row, index) => (
                  <StatGenbaTotalRowView
                    key={row.sku}
                    row={row}
                    rowNumber={index + 1 + (page - 1) * 100}
                  />
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={4} className="text-center">
                    합계
                  </th>
                  <th className="text-end">{nf(totalCount)}</th>
                  <th className="text-end">{nf(totalGross)}</th>
                  <th className="text-end">{nf(totalNet)}</th>
                  <th className="text-end">{nf(totalActual)}</th>
                  <th className="text-end">
                    {totalNet > 0 && (
                      <>
                        {nf(totalProfit)}
                        <br />({round2((totalProfit * 100) / totalNet)} %)
                      </>
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center mt-3">
            {pagination && (
              <ServerPagination
                page={pagination.current_page}
                totalPages={pagination.total_pages}
                baseUrl={BASE_URL}
              />
            )}
          </div>
        </div>
      </div>
      {/* end row */}
    </>
  );
};

const StatGenbaTotalRowView = ({
  row,
  rowNumber,
}: {
  row: StatGenbaTotalRow;
  rowNumber: number;
}) => {
  const profit = row.total_net_amount - row.total_actual_buying_price;
  const textColor = profit < 0 ? "text-danger" : "";
  return (
    <tr>
      <td className="text-center">{rowNumber}</td>
      <td>{row.publisher}</td>
      <td className="text-center">{row.sku}</td>
      <td>{row.name}</td>
      <td className="text-end">{nf(row.total_count)}</td>
      <td className="text-end">{nf(row.total_gross_amount)}</td>
      <td className="text-end">{nf(row.total_net_amount)}</td>
      <td className="text-end">{nf(row.total_actual_buying_price)}</td>
      <td className={`text-end ${textColor}`}>
        {nf(profit)}
        <br />
        {row.total_net_amount > 0 && <>({round2((profit * 100) / row.total_net_amount)}%)</>}
      </td>
    </tr>
  );
};
