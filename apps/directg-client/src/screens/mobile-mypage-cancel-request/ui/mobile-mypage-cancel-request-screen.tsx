import type { CancelRequestItem } from "@entities/mypage-order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileRequestReturnButton } from "./mobile-request-return-button";

/** status → 주문상태 라벨(legacy Order::getOrderStatus). 미정의는 빈 문자열. */
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
 * 모바일 마이페이지 - 취소요청 내역 (legacy `mobile/mypage/mypage_cancel_request.html`).
 * 검색폼/더보기 없음. status 7·8 카드 목록 + getOrderStatus 배지 + 배송상태 텍스트 + 요청철회(status==8)/배송조회(shipment 4~6 dead).
 */
export function MobileMypageCancelRequestScreen({ list }: { list: CancelRequestItem[] }) {
  return (
    <>
      <MobileSubHeader pageTitle="취소 요청 내역" />
      <div id="appCapsuleSub">
        {list.map((data, index) => {
          const statusColor = data.status === "8" || data.status === "9" ? "danger" : "secondary";
          const showShipment = data.delivery_type !== "1";
          const showTracking =
            data.shipment_status === "4" ||
            data.shipment_status === "5" ||
            data.shipment_status === "6";
          return (
            <div className="section mt-2" key={index}>
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <div>{data.order_date.substring(0, 10)}</div>
                    <div className="in">
                      <a
                        href={`/mypage/mypage_order_view?settle_no=${data.settle_no}`}
                        className="item"
                      >
                        상세보기
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card-body py-2">
                  <div className="mb-1">
                    <span className={`badge bg-${statusColor} font-12`}>
                      {orderStatusLabel(data.status)}
                    </span>
                  </div>
                  {showShipment ? shipmentStatusLabel(data.shipment_status) : null}
                  <p className="card-text">{data.product_name}</p>
                  <p className="card-text">
                    <span className="num">{data.price.toLocaleString()}</span> 원{" "}
                  </p>
                </div>
                {showTracking && (
                  <div className="card-footer">
                    <button type="button" className="btn btn-primary btn-block">
                      배송조회
                    </button>
                  </div>
                )}
                {data.status === "8" && (
                  <div className="card-footer">
                    <MobileRequestReturnButton settleNo={data.settle_no} ordno={data.ordno} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
