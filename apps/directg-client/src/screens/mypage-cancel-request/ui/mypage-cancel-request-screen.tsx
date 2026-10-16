import type { CancelRequestItem, MypageCancelRequestResponse } from "@entities/mypage-order";
import { ServerPagination } from "@shared/ui/server-pagination";
import { MypageAside } from "@widgets/mypage-aside";

import { RequestReturnButton } from "./request-return-button";

interface MypageCancelRequestScreenProps {
  data: MypageCancelRequestResponse;
  /** 상품명 검색어(raw) — legacy 폼 없으나 페이지네이션 param 통과용. */
  searchProductName: string;
  /** 기간 코드 raw(""=URL 미지정) — 페이지네이션 param용(legacy `$param`은 raw `$_GET`). */
  searchDateParam: string;
}

/** delivery_type → 배송방식 뱃지(legacy). 1·2·3 외엔 null. */
function deliveryTypeBadge(deliveryType: string): { cls: string; label: string } | null {
  switch (deliveryType) {
    case "1":
      return { cls: "badge-outline-success", label: "코드발송" };
    case "2":
      return { cls: "badge-outline-post", label: "택배발송" };
    case "3":
      return { cls: "badge-outline-code-post", label: "코드+택배발송" };
    default:
      return null;
  }
}

/** status → 주문상태 라벨(legacy Order::getOrderStatus). 7·미정의는 빈 문자열. */
function orderStatusLabel(status: string): string {
  switch (status) {
    case "1":
      return "주문대기";
    case "2":
      return "주문완료";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    case "8":
      return "취소요청";
    case "9":
      return "취소완료";
    default:
      return "";
  }
}

/** shipment_status → 배송상태 라벨(legacy Order::getShipmentStatus). 미해당 빈 문자열. */
function shipmentStatusLabel(shipmentStatus: string | null): string {
  switch (shipmentStatus) {
    case "2":
      return "배송대기";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    default:
      return "";
  }
}

/**
 * 취소요청 내역 (legacy `pc/mypage/mypage_cancel_request.html`). 세션 SSR 목록(status 7·8) + 요청철회(status 8).
 * 가드는 route. **검색폼 없음**. footer_banner 없음.
 */
export function MypageCancelRequestScreen({
  data,
  searchProductName,
  searchDateParam,
}: MypageCancelRequestScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="cancel_request" />
        <section id="content" className="content rounded-0 font-14">
          <div className="row">
            <div className="col-12">
              <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
                <colgroup>
                  <col width="15%" />
                  <col width="*" />
                  <col width="8%" />
                  <col width="8%" />
                  <col width="8%" />
                </colgroup>
                <thead className="font-14">
                  <tr>
                    <th className="bg-body-tertiary">
                      주문일자
                      <br />
                      (주문번호)
                    </th>
                    <th className="bg-body-tertiary align-middle">상품정보</th>
                    <th className="bg-body-tertiary align-middle">주문금액</th>
                    <th className="bg-body-tertiary align-middle">진행상태</th>
                    <th className="bg-body-tertiary align-middle">비고</th>
                  </tr>
                </thead>
                <tbody className="bg-dark font-13">
                  {list.map((item: CancelRequestItem) => {
                    const delivery = deliveryTypeBadge(item.delivery_type);
                    const statusColor =
                      item.status === "8" || item.status === "9" ? "danger" : "secondary";
                    return (
                      <tr key={`${item.settle_no}-${item.ordno}`}>
                        <td className="text-center px-0">
                          <span className="d-block">{item.order_date}</span>
                          <span className="d-block">({item.ordno})</span>
                        </td>
                        <td className="text-start">
                          <div className="d-block">
                            {delivery && (
                              <span className={`badge ${delivery.cls}`}>{delivery.label}</span>
                            )}
                          </div>
                          <span className="d-block">{item.product_name}</span>
                        </td>
                        <td className="text-end">
                          <span className="num">{item.price.toLocaleString("en-US")}</span> 원
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            {/* 주문상태 */}
                            <div className="mb-1">
                              <span className={`badge bg-${statusColor} font-12`}>
                                {orderStatusLabel(item.status)}
                              </span>
                            </div>
                            {/* 배송상태(택배발송상품) */}
                            {item.delivery_type !== "1" && (
                              <div className="mb-1">
                                <span className="badge text-bg-info">
                                  {shipmentStatusLabel(item.shipment_status)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {item.status === "8" && (
                            <RequestReturnButton settleNo={item.settle_no} ordno={item.ordno} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={5}>취소요청 이력이 존재하지 않습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl="/mypage/mypage_cancel_request"
                params={{ search_product_name: searchProductName, search_date: searchDateParam }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
