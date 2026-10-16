import type { MypageRefundResponse, RefundItem } from "@entities/mypage-order";
import { DateRangePicker } from "@shared/ui/date-range-picker";
import { ServerPagination } from "@shared/ui/server-pagination";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageRefundScreenProps {
  data: MypageRefundResponse;
  searchStartDate: string;
  searchEndDate: string;
}

/** legacy settlekind 맵(결제수단). */
const SETTLE_KIND: Record<string, string> = {
  "000000": "현금",
  SC0000: "무통장입금",
  SC0010: "신용카드",
  SC0030: "실시간 계좌이체",
  SC0040: "가상계좌",
  SC0060: "휴대폰",
  DG0000: "전액할인",
  PAYCO: "PAYCO",
  samsung: "삼성페이",
  naverpay: "네이버페이",
  POINT: "네이버포인트",
};

/** legacy settleStatus 맵(결제상태). */
const SETTLE_STATUS: Record<string, string> = {
  "0": "결제완료",
  "1": "결제대기",
  "2": "결제완료",
  "3": "결제실패",
  "9": "결제취소",
  "99": "주문취소",
};

/** 결제수단: pg_provider=="naverpay"면 "네이버페이" 우선, 아니면 settlekind 맵(legacy). */
function paymentMethodLabel(item: RefundItem): string {
  return item.pg_provider === "naverpay" ? "네이버페이" : (SETTLE_KIND[item.settlekind] ?? "");
}

/**
 * 환불(취소) 내역 (legacy `pc/mypage/mypage_refund.html`, title "취소 내역"). 세션 SSR 목록(DGKR DB, step 8·9·99).
 * 가드는 route. 기간검색 daterangepicker(A안). aside active 없음(refund2 키 부재). 빈 목록 메시지 없음.
 */
export function MypageRefundScreen({
  data,
  searchStartDate,
  searchEndDate,
}: MypageRefundScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      {/* legacy page-specific: mdi 아이콘 + daterangepicker(base CDN + dark 테마) */}
      <link rel="stylesheet" href="/assets/css/icons.min.css" />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css"
      />
      <link rel="stylesheet" type="text/css" href="/assets/css/daterangepicker-dark.css" />
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside />
        <section id="content" className="content rounded-0 font-14">
          <div className="col-12">
            <div className="card shadow-none rounded-0 my-3 font-14">
              <DateRangePicker
                startName="search_start_date"
                endName="search_end_date"
                initialStart={searchStartDate}
                initialEnd={searchEndDate}
                action="/mypage/mypage_refund"
              />
            </div>
          </div>

          <div className="col-12">
            <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
              <thead className="align-middle">
                <tr>
                  <th>결제번호</th>
                  <th>상품명</th>
                  <th>결제수단</th>
                  <th>결제금액</th>
                  <th>주문일자</th>
                  <th>취소일자</th>
                  <th>결제상태</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.settle_no}>
                    <td>{item.settle_no}</td>
                    <td className="text-wrap text-start">{item.item_name}</td>
                    <td>{paymentMethodLabel(item)}</td>
                    <td className="text-end">
                      <span style={{ fontFamily: "dotum" }}>{"\\"}</span>{" "}
                      {item.settleprice.toLocaleString("en-US")}
                    </td>
                    <td>{item.regdt}</td>
                    <td>{item.canceldt}</td>
                    <td>{SETTLE_STATUS[item.step] ?? ""}</td>
                    <td>
                      <a
                        href={`/mypage/mypage_order_view?settle_no=${item.settle_no}`}
                        className="btn btn-sm btn-info font-14"
                      >
                        상세보기
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="pagination" className="mt-4">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              baseUrl="/mypage/mypage_refund"
              params={{ search_start_date: searchStartDate, search_end_date: searchEndDate }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
