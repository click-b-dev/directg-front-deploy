import { Fragment } from "react";

import type { MypageRetailOrderResponse } from "@entities/mypage-order";
import { DateRangePicker } from "@shared/ui/date-range-picker";
import { ServerPagination } from "@shared/ui/server-pagination";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageRetailOrderScreenProps {
  data: MypageRetailOrderResponse;
  searchStartDate: string;
  searchEndDate: string;
}

/** legacy retail settlekind 맵(결제수단). refund의 SC00xx와 다른 코드체계. 미매핑은 "". */
const RETAIL_SETTLE_KIND: Record<string, string> = {
  CARD: "카드결제",
  BANK: "계좌이체",
  POINT: "포인트",
  PHONE: "휴대폰",
  GIFT: "상품권",
  KAKAOM: "카카오머니",
  NPAY: "네이버페이 포인트",
  DGPOINT: "전액할인",
};

/** legacy retailStepText 맵(결제상태). */
const RETAIL_STEP_TEXT: Record<string, string> = {
  "0": "주문완료",
  "1": "결제대기",
  "2": "결제완료",
  "3": "배송준비중",
  "4": "배송중",
  "5": "배송완료",
  "6": "구매확정",
  "8": "취소요청",
  "9": "취소완료",
  "97": "취소보류",
  "11": "반품요청",
  "12": "반품수거중",
  "13": "반품수거완료",
  "14": "반품완료",
  "17": "반품보류",
  "18": "반품반려중",
  "19": "반품반려완료",
  "21": "교환요청",
  "22": "수거중",
  "23": "수거완료",
  "24": "교환중",
  "25": "교환완료",
  "27": "교환보류",
  "28": "교환반려중",
  "29": "교환반려완료",
};

/**
 * 실물 상품 주문 내역 (legacy `pc/mypage/mypage_retail_order.html`, 라이브 고아 화면).
 * 세션 SSR 목록(DGKR DB `retail_order`). 가드는 route. 기간검색 daterangepicker(vendor). aside active 없음.
 */
export function MypageRetailOrderScreen({
  data,
  searchStartDate,
  searchEndDate,
}: MypageRetailOrderScreenProps) {
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
                action="/mypage/mypage_retail_order"
                showCustomRangeLabel
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
                  <th>결제상태</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.settle_no}>
                    <td>{item.settle_no}</td>
                    <td className="text-start text-wrap">{item.goods_nm}</td>
                    <td>
                      {item.pg_provider === "naverpay" && (
                        <Fragment>
                          네이버페이
                          <br />
                        </Fragment>
                      )}
                      {RETAIL_SETTLE_KIND[item.settlekind] ?? ""}
                    </td>
                    <td className="text-end">
                      <span style={{ fontFamily: "dotum" }}>{"\\"}</span>{" "}
                      {item.settleprice.toLocaleString("en-US")}
                    </td>
                    <td>{item.regdt}</td>
                    <td>{RETAIL_STEP_TEXT[item.step] ?? ""}</td>
                    <td>
                      <a
                        href={`/mypage/mypage_retail_order_view?settle_no=${item.settle_no}`}
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
              baseUrl="/mypage/mypage_retail_order"
              params={{ search_start_date: searchStartDate, search_end_date: searchEndDate }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
